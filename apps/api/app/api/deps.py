"""Authentication and authorization dependencies for FastAPI endpoints."""

import uuid
from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.authorization import (
    check_resource_ownership,
    verify_billing_resource_access,
    verify_doctor_resource_access,
    verify_patient_resource_access,
    verify_resource_ownership,
)
from app.core.config import settings
from app.core.permissions import Permission, has_all_permissions
from app.core.security import decode_token
from app.db.session import get_db
from app.models.user import User, UserRole

# OAuth2 scheme extracting Bearer token from Authorization header
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_PREFIX}/auth/login",
    auto_error=False,
)


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Validate bearer token and resolve current active User entity.

    Raises:
        HTTPException: 401 if missing, expired, invalid, or account is inactive.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_token(token)
        token_type = payload.get("type")
        if token_type != "access":
            raise credentials_exception

        user_id_str = payload.get("sub")
        if not user_id_str:
            raise credentials_exception

        user_id = uuid.UUID(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exception

    user = db.get(User, user_id)
    if not user:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Enforce that authenticated user is active."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive.",
        )
    return current_user


def require_roles(*allowed_roles: UserRole) -> Callable[[User], User]:
    """Dependency factory enforcing server-side role-based authorization.

    Args:
        *allowed_roles: Permitted UserRole values.

    Returns:
        Callable dependency validating current user role against allowed roles.
    """

    def role_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted for current user role.",
            )
        return current_user

    return role_checker


def require_permissions(*required_permissions: Permission) -> Callable[[User], User]:
    """Dependency factory enforcing server-side permission-based authorization.

    Args:
        *required_permissions: Permitted Permission values required for the operation.

    Returns:
        Callable dependency validating that current user's role grants all required permissions.
    """

    def permission_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:
        if not has_all_permissions(current_user.role, required_permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted for current user permissions.",
            )
        return current_user

    return permission_checker


# Reusable, pre-configured role dependencies
require_admin = require_roles(UserRole.ADMIN)
require_doctor = require_roles(UserRole.DOCTOR)
require_patient = require_roles(UserRole.PATIENT)
require_receptionist = require_roles(UserRole.RECEPTIONIST)
require_billing_staff = require_roles(UserRole.BILLING_STAFF)
require_clinical_staff = require_roles(
    UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.ADMIN
)
require_staff = require_roles(
    UserRole.DOCTOR,
    UserRole.RECEPTIONIST,
    UserRole.BILLING_STAFF,
    UserRole.ADMIN,
)

__all__ = [
    "check_resource_ownership",
    "get_current_active_user",
    "get_current_user",
    "require_admin",
    "require_billing_staff",
    "require_clinical_staff",
    "require_doctor",
    "require_patient",
    "require_permissions",
    "require_receptionist",
    "require_roles",
    "require_staff",
    "verify_billing_resource_access",
    "verify_doctor_resource_access",
    "verify_patient_resource_access",
    "verify_resource_ownership",
]
