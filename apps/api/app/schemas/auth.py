"""Pydantic schemas for authentication, credentials, and user lifecycle."""

import uuid
from datetime import datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import UserRole

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """Standardized API response envelope conforming to platform contract."""

    data: T
    message: str


class SimpleMessageResponse(BaseModel):
    """Standard message-only response."""

    message: str


class UserResponse(BaseModel):
    """Safe public representation of a User entity (never exposes password_hash)."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    role: UserRole
    is_active: bool
    created_at: datetime
    last_login_at: datetime | None = None


class RegisterRequest(BaseModel):
    """Payload for user registration.

    Self-registration strictly provisions PATIENT accounts.
    Requested role can be submitted for administrative intake auditing,
    but cannot grant immediate privileged access.
    """

    email: EmailStr
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Password must contain at least 8 characters.",
    )
    full_name: str | None = Field(
        default=None,
        max_length=200,
        description="Full legal name of the user.",
    )
    age: int | None = Field(
        default=None,
        ge=1,
        le=125,
        description="Age in years (positive integer between 1 and 125).",
    )
    requested_role: str | None = Field(
        default=None,
        max_length=50,
        description="Optional role requested by applicant for administrative review.",
    )



class LoginRequest(BaseModel):
    """Payload for user login authentication."""

    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)


class TokenResponse(BaseModel):
    """JWT token pair representation."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AuthData(BaseModel):
    """Combined user profile and token pair returned on successful auth."""

    user: UserResponse
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    """Payload for renewing an expired access token."""

    refresh_token: str = Field(..., min_length=1)


class ChangePasswordRequest(BaseModel):
    """Payload for authenticated password modification."""

    current_password: str = Field(..., min_length=1)
    new_password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="New password must be at least 8 characters long.",
    )


class UpdateProfileRequest(BaseModel):
    """Payload for updating user profile fields."""

    email: EmailStr | None = None
