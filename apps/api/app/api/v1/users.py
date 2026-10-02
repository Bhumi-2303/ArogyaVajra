"""API endpoints for administrative user management."""

import uuid

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.patient import PaginationMeta
from app.schemas.user import (
    UserDetailResponse,
    UserListResponse,
    UserResponse,
    UserUpdate,
)
from app.services.user_management import UserManagementService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "",
    response_model=UserListResponse,
    summary="List and search system users (Admin only)",
)
def list_users(
    search: str | None = Query(
        default=None, description="Search users by email address"
    ),
    role: UserRole | None = Query(
        default=None, description="Filter users by assigned role"
    ),
    is_active: bool | None = Query(
        default=None, description="Filter users by account active status"
    ),
    page: int = Query(default=1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Retrieve a paginated list of system users with filtering options."""
    users, total, total_pages = UserManagementService.list_users(
        db=db,
        current_user=current_user,
        search=search,
        role=role,
        is_active=is_active,
        page=page,
        page_size=page_size,
    )

    return UserListResponse(
        data=[UserResponse.model_validate(u) for u in users],
        pagination=PaginationMeta(
            page=page,
            page_size=page_size,
            total=total,
            total_pages=total_pages,
        ),
        message="Users retrieved successfully.",
    )


@router.get(
    "/{user_id}",
    response_model=UserDetailResponse,
    summary="Get user details by ID (Admin only)",
)
def get_user(
    user_id: uuid.UUID,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Retrieve complete user account details."""
    user = UserManagementService.get_user_detail(
        db=db,
        user_id=user_id,
        current_user=current_user,
    )
    return UserDetailResponse(
        data=UserResponse.model_validate(user),
        message="User details retrieved successfully.",
    )


@router.put(
    "/{user_id}",
    response_model=UserDetailResponse,
    summary="Update user role or active status (Admin only)",
)
def update_user(
    user_id: uuid.UUID,
    data: UserUpdate,
    request: Request,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Update role or account status with safety invariants and audit logging."""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    user = UserManagementService.update_user(
        db=db,
        user_id=user_id,
        data=data,
        current_user=current_user,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.commit()

    return UserDetailResponse(
        data=UserResponse.model_validate(user),
        message="User account updated successfully.",
    )


@router.post(
    "/{user_id}/activate",
    response_model=UserDetailResponse,
    summary="Activate user account (Admin only)",
)
def activate_user(
    user_id: uuid.UUID,
    request: Request,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Reactivate a previously deactivated user account."""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    user = UserManagementService.activate_user(
        db=db,
        user_id=user_id,
        current_user=current_user,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.commit()

    return UserDetailResponse(
        data=UserResponse.model_validate(user),
        message="User account activated successfully.",
    )


@router.post(
    "/{user_id}/deactivate",
    response_model=UserDetailResponse,
    summary="Deactivate user account (Admin only)",
)
def deactivate_user(
    user_id: uuid.UUID,
    request: Request,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Deactivate a user account, preventing further authentication."""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    user = UserManagementService.deactivate_user(
        db=db,
        user_id=user_id,
        current_user=current_user,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.commit()

    return UserDetailResponse(
        data=UserResponse.model_validate(user),
        message="User account deactivated successfully.",
    )
