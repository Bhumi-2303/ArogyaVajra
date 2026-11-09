"""Integration tests for audit logs admin-only read and mutation logging."""

import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.db.session import SessionLocal
from app.main import app
from app.models.user import User, UserRole

client = TestClient(app)


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def create_user_with_role(role: UserRole) -> tuple[uuid.UUID, str, str]:
    """Helper creating user with role."""
    email = f"{role.value.lower()}_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"

    reg = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "role": "PATIENT"},
    )
    assert reg.status_code == 201
    user_id = uuid.UUID(reg.json()["data"]["user"]["id"])

    if role != UserRole.PATIENT:
        with SessionLocal() as db:
            user = db.scalar(select(User).where(User.id == user_id))
            assert user is not None
            user.role = role
            db.commit()

        login_res = client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": password},
        )
        assert login_res.status_code == 200
        return user_id, email, login_res.json()["data"]["access_token"]

    return user_id, email, reg.json()["data"]["access_token"]


@pytest.mark.integration
def test_audit_logs_rbac_and_filtering():
    """Verify admin access to audit logs and 403 Forbidden for non-admin roles."""
    _, _, admin_token = create_user_with_role(UserRole.ADMIN)
    _, _, patient_token = create_user_with_role(UserRole.PATIENT)
    _, _, doctor_token = create_user_with_role(UserRole.DOCTOR)
    _, _, recep_token = create_user_with_role(UserRole.RECEPTIONIST)

    # 1. Non-admin users are rejected with 403
    for tok in [patient_token, doctor_token, recep_token]:
        res = client.get("/api/v1/audit-logs", headers=auth_headers(tok))
        assert res.status_code == 403

    # 2. Admin can list audit logs
    admin_res = client.get(
        "/api/v1/audit-logs?page=1&page_size=20",
        headers=auth_headers(admin_token),
    )
    assert admin_res.status_code == 200
    data = admin_res.json()
    assert "data" in data
    assert "pagination" in data
    assert isinstance(data["data"], list)
    assert data["pagination"]["page"] == 1

    # 3. Filter by entity_type or action
    filter_res = client.get(
        "/api/v1/audit-logs?entity_type=INVOICE&page=1&page_size=10",
        headers=auth_headers(admin_token),
    )
    assert filter_res.status_code == 200
    for entry in filter_res.json()["data"]:
        assert entry["entity_type"] == "INVOICE"
