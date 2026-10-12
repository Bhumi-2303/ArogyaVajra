"""Authentication and user session management endpoints."""

import uuid
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from jose import JWTError
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.rate_limit import check_rate_limit, get_client_identifier
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.db.session import get_db
from app.models.refresh_token import RefreshToken
from app.models.user import User, UserRole
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
from app.services.audit import record_audit_event

router = APIRouter(prefix="/auth", tags=["Authentication"])


def issue_and_persist_tokens(
    db: Session,
    user: User,
    family_id: uuid.UUID | None = None,
    commit: bool = True,
) -> tuple[str, str]:
    """Issue a fresh access token and a tracked, rotated refresh token."""
    now = datetime.now(UTC)
    token_id = uuid.uuid4()
    fam = family_id or uuid.uuid4()
    expires_at = now + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)

    access_token = create_access_token(subject=user.id, role=user.role.value)
    refresh_token = create_refresh_token(
        subject=user.id,
        token_id=token_id,
        family_id=fam,
    )

    token_record = RefreshToken(
        id=token_id,
        user_id=user.id,
        family_id=fam,
        token_hash=hash_token(refresh_token),
        expires_at=expires_at,
        is_revoked=False,
    )
    db.add(token_record)
    if commit:
        db.commit()
    return access_token, refresh_token




@router.post(
    "/register",
    response_model=APIResponse[AuthData],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def register(
    payload: RegisterRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> APIResponse[AuthData]:
    """Register a new user account with credentials and role assignment.

    Returns user profile along with authenticated access and refresh tokens.
    """
    check_rate_limit(
        db,
        "register",
        get_client_identifier(request),
        max_requests=10,
        window_seconds=60,
    )
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
        role=UserRole.PATIENT,  # Enforce patient role for public registration
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Issue tracked token pair with new session family
    access_token, refresh_token = issue_and_persist_tokens(db=db, user=user)

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
    request: Request,
    db: Session = Depends(get_db),
) -> APIResponse[AuthData]:
    """Authenticate with email and password credentials.

    Updates last_login_at timestamp and returns user info with JWT tokens.
    """
    normalized_email = payload.email.lower().strip()
    check_rate_limit(
        db,
        "login",
        get_client_identifier(request),
        max_requests=10,
        window_seconds=60,
    )
    check_rate_limit(
        db,
        "login_account",
        normalized_email,
        max_requests=10,
        window_seconds=60,
    )
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

    access_token, refresh_token = issue_and_persist_tokens(db=db, user=user)

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
    request: Request,
    db: Session = Depends(get_db),
) -> APIResponse[TokenResponse]:
    """Validate refresh token, enforce single-use rotation, and issue fresh token pair."""
    check_rate_limit(
        db,
        "refresh",
        get_client_identifier(request),
        max_requests=30,
        window_seconds=60,
    )
    now = datetime.now(UTC)
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
        jti_str = decoded.get("jti")
        family_str = decoded.get("family")
        if not user_id_str or not jti_str:
            raise credentials_exception

        user_id = uuid.UUID(user_id_str)
        token_id = uuid.UUID(jti_str)
        family_claim_id = uuid.UUID(family_str) if family_str else None
    except (JWTError, ValueError):
        raise credentials_exception

    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or account is deactivated.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 1. Row-level pessimistic lock: Prevents concurrent requests from both consuming
    # the same token record simultaneously.
    stored_token = db.scalar(
        select(RefreshToken)
        .where(RefreshToken.id == token_id)
        .with_for_update()
    )
    if not stored_token or stored_token.expires_at < now:
        raise credentials_exception

    # 2. Cryptographic and identity binding checks:
    # Ensure raw token hash matches stored hash, user matches, and family claim matches.
    computed_hash = hash_token(payload.refresh_token)
    if (
        stored_token.token_hash != computed_hash
        or stored_token.user_id != user.id
        or (family_claim_id and stored_token.family_id != family_claim_id)
    ):
        raise credentials_exception

    # 3. Check family revocation status
    if stored_token.is_revoked:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token family has been revoked.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 4. Single-use rotation and bounded concurrency grace window:
    if stored_token.consumed_at is not None:
        consumed_delta = (now - stored_token.consumed_at).total_seconds()
        # If outside grace window OR grace window has already been used:
        # Detected replay attack! Revoke the entire token family.
        if consumed_delta > 15 or stored_token.grace_count >= 1:
            db.execute(
                update(RefreshToken)
                .where(RefreshToken.family_id == stored_token.family_id)
                .values(is_revoked=True)
            )
            db.commit()
            record_audit_event(
                db=db,
                action="REVOKE_TOKEN_FAMILY",
                entity_type="RefreshToken",
                entity_id=str(stored_token.id),
                user_id=user.id,
                new_values={
                    "reason": "Token replay detected",
                    "family_id": str(stored_token.family_id),
                    "consumed_delta": consumed_delta,
                    "grace_count": stored_token.grace_count,
                },
                ip_address=get_client_identifier(request),
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Replay attack detected: Refresh token reuse detected. Session terminated for security.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # First and only allowed concurrent race resolution within 15-second grace window:
        stored_token.grace_count += 1
    else:
        # Normal first-time consumption
        stored_token.consumed_at = now

    # Rotate: issue a fresh refresh token inheriting the family ID in the same atomic transaction.
    # Passing commit=False ensures the row lock on stored_token is held continuously until both
    # the consumption/grace update and the new token record are committed together.
    # If any error occurs during replacement token issuance or commit, rollback ensures
    # the existing token is not marked consumed.
    try:
        new_access, new_refresh = issue_and_persist_tokens(
            db=db,
            user=user,
            family_id=stored_token.family_id,
            commit=False,
        )
        db.commit()
    except Exception:
        db.rollback()
        raise



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
    db: Session = Depends(get_db),
) -> SimpleMessageResponse:
    """Conclude current authentication session and revoke active refresh tokens."""
    db.execute(
        update(RefreshToken)
        .where(
            RefreshToken.user_id == current_user.id,
            RefreshToken.is_revoked.is_(False),
        )
        .values(is_revoked=True)
    )
    db.commit()
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
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SimpleMessageResponse:
    """Verify current password and set a new password."""
    check_rate_limit(
        db,
        "change_password",
        get_client_identifier(request),
        max_requests=5,
        window_seconds=60,
    )
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
    # Revoke all active refresh tokens for the user upon credential update
    db.execute(
        update(RefreshToken)
        .where(
            RefreshToken.user_id == current_user.id,
            RefreshToken.is_revoked.is_(False),
        )
        .values(is_revoked=True)
    )
    db.commit()

    return SimpleMessageResponse(message="Password changed successfully.")

