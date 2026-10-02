"""Authentication and user session management endpoints."""

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    APIResponse,
    AuthData,
    ChangePasswordRequest,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    SimpleMessageResponse,
    TokenResponse,
    UpdateProfileRequest,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=APIResponse[AuthData],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
) -> APIResponse[AuthData]:
    """Register a new user account with credentials and role assignment.

    Returns user profile along with authenticated access and refresh tokens.
    """
    normalized_email = payload.email.lower().strip()

    # Check for existing user with identical email
    existing_user = db.scalar(select(User).where(User.email == normalized_email))
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email address already exists.",
        )

    # Hash password and persist user
    hashed = hash_password(payload.password)
    user = User(
        email=normalized_email,
        password_hash=hashed,
        role=payload.role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Issue JWT token pair
    access_token = create_access_token(subject=user.id, role=user.role.value)
    refresh_token = create_refresh_token(subject=user.id)

    return APIResponse(
        data=AuthData(
            user=UserResponse.model_validate(user),
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
        ),
        message="Registration successful.",
    )


@router.post(
    "/login",
    response_model=APIResponse[AuthData],
    status_code=status.HTTP_200_OK,
    summary="Authenticate user and obtain JWT tokens",
)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
) -> APIResponse[AuthData]:
    """Authenticate with email and password credentials.

    Updates last_login_at timestamp and returns user info with JWT tokens.
    """
    normalized_email = payload.email.lower().strip()
    user = db.scalar(select(User).where(User.email == normalized_email))

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated. Contact an administrator.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Record login timestamp
    user.last_login_at = datetime.now(UTC)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(subject=user.id, role=user.role.value)
    refresh_token = create_refresh_token(subject=user.id)

    return APIResponse(
        data=AuthData(
            user=UserResponse.model_validate(user),
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
        ),
        message="Login successful.",
    )


@router.post(
    "/refresh",
    response_model=APIResponse[TokenResponse],
    status_code=status.HTTP_200_OK,
    summary="Renew access token using refresh token",
)
def refresh_token(
    payload: RefreshRequest,
    db: Session = Depends(get_db),
) -> APIResponse[TokenResponse]:
    """Validate refresh token and issue a fresh token pair."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired refresh token.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        decoded = decode_token(payload.refresh_token)
        if decoded.get("type") != "refresh":
            raise credentials_exception

        user_id_str = decoded.get("sub")
        if not user_id_str:
            raise credentials_exception

        user_id = uuid.UUID(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exception

    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or account is deactivated.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    new_access = create_access_token(subject=user.id, role=user.role.value)
    new_refresh = create_refresh_token(subject=user.id)

    return APIResponse(
        data=TokenResponse(
            access_token=new_access,
            refresh_token=new_refresh,
            token_type="bearer",
        ),
        message="Token refreshed successfully.",
    )


@router.post(
    "/logout",
    response_model=SimpleMessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Log out of current session",
)
def logout(
    current_user: User = Depends(get_current_user),
) -> SimpleMessageResponse:
    """Conclude current authentication session."""
    return SimpleMessageResponse(message="Logout successful.")


@router.get(
    "/me",
    response_model=APIResponse[UserResponse],
    status_code=status.HTTP_200_OK,
    summary="Retrieve current authenticated user profile",
)
def get_me(
    current_user: User = Depends(get_current_user),
) -> APIResponse[UserResponse]:
    """Return the profile of the currently authenticated user."""
    return APIResponse(
        data=UserResponse.model_validate(current_user),
        message="Current user profile retrieved.",
    )


@router.put(
    "/me",
    response_model=APIResponse[UserResponse],
    status_code=status.HTTP_200_OK,
    summary="Update current user profile information",
)
def update_me(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> APIResponse[UserResponse]:
    """Update profile fields for the authenticated user."""
    if payload.email is not None:
        normalized_email = payload.email.lower().strip()
        if normalized_email != current_user.email:
            existing = db.scalar(select(User).where(User.email == normalized_email))
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="A user with this email address already exists.",
                )
            current_user.email = normalized_email

    db.commit()
    db.refresh(current_user)

    return APIResponse(
        data=UserResponse.model_validate(current_user),
        message="User profile updated successfully.",
    )


@router.put(
    "/change-password",
    response_model=SimpleMessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Change user password",
)
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SimpleMessageResponse:
    """Verify current password and set a new password."""
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    if payload.current_password == payload.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password.",
        )

    current_user.password_hash = hash_password(payload.new_password)
    db.commit()

    return SimpleMessageResponse(message="Password changed successfully.")
