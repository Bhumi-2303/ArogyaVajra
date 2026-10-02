"""Unit tests for administrative user management schemas and logic."""

import uuid
from datetime import UTC, datetime

import pytest
from pydantic import ValidationError

from app.models.user import UserRole
from app.schemas.user import (
    UserResponse,
    UserRoleUpdate,
    UserStatusUpdate,
    UserUpdate,
)


@pytest.mark.unit
def test_user_response_serialization():
    """Verify UserResponse serializes properly without exposing sensitive attributes."""
    user_id = uuid.uuid4()
    now = datetime.now(UTC)

    data = {
        "id": user_id,
        "email": "clinical.doctor@example.com",
        "role": UserRole.DOCTOR,
        "is_active": True,
        "created_at": now,
        "updated_at": now,
        "last_login_at": None,
    }

    resp = UserResponse.model_validate(data)
    assert resp.id == user_id
    assert resp.email == "clinical.doctor@example.com"
    assert resp.role == UserRole.DOCTOR
    assert resp.is_active is True
    assert "password_hash" not in resp.model_dump()


@pytest.mark.unit
def test_user_update_schema_validation():
    """Verify UserUpdate validates role and active status correctly."""
    # Valid role update
    u1 = UserUpdate(role=UserRole.ADMIN)
    assert u1.role == UserRole.ADMIN
    assert u1.is_active is None

    # Valid status update
    u2 = UserUpdate(is_active=False)
    assert u2.is_active is False
    assert u2.role is None

    # Invalid role string raises ValidationError
    with pytest.raises(ValidationError):
        UserUpdate(role="SUPERUSER")  # type: ignore[arg-type]


@pytest.mark.unit
def test_user_role_update_exact_roles():
    """Verify UserRoleUpdate only accepts the exact 5 documented roles."""
    for valid_role in [
        UserRole.PATIENT,
        UserRole.DOCTOR,
        UserRole.RECEPTIONIST,
        UserRole.BILLING_STAFF,
        UserRole.ADMIN,
    ]:
        update = UserRoleUpdate(role=valid_role)
        assert update.role == valid_role

    with pytest.raises(ValidationError):
        UserRoleUpdate(role="MANAGER")  # type: ignore[arg-type]


@pytest.mark.unit
def test_user_status_update():
    """Verify UserStatusUpdate validates boolean state."""
    s1 = UserStatusUpdate(is_active=True)
    assert s1.is_active is True

    s2 = UserStatusUpdate(is_active=False)
    assert s2.is_active is False
