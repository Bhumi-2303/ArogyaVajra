"""Pydantic schemas for administrative user management."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import UserRole
from app.schemas.patient import PaginationMeta


class UserResponse(BaseModel):
    """Public representation of a User entity (never exposes password_hash)."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime | None = None
    last_login_at: datetime | None = None


class UserDetailResponse(BaseModel):
    """Envelope for single user responses."""

    data: UserResponse
    message: str = "User details retrieved successfully."


class UserListResponse(BaseModel):
    """Envelope for paginated user list responses."""

    data: list[UserResponse]
    pagination: PaginationMeta
    message: str = "Users retrieved successfully."


class UserUpdate(BaseModel):
    """Payload for updating user role or active status by administrator."""

    role: UserRole | None = Field(
        default=None,
        description="New role to assign (must be one of the 5 documented roles).",
    )
    is_active: bool | None = Field(
        default=None,
        description="Account activation/deactivation status.",
    )


class UserRoleUpdate(BaseModel):
    """Payload specifically for role assignment."""

    role: UserRole = Field(
        ...,
        description="Target role (PATIENT, DOCTOR, RECEPTIONIST, BILLING_STAFF, ADMIN).",
    )


class UserStatusUpdate(BaseModel):
    """Payload for activating or deactivating a user account."""

    is_active: bool = Field(
        ...,
        description="True to activate, False to deactivate.",
    )
