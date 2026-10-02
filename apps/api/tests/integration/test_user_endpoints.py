"""Integration tests for administrator user management API endpoints."""

import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.core.security import create_access_token, hash_password
from app.db.session import get_sessionmaker
from app.main import app
from app.models.audit_log import AuditLog
from app.models.user import User, UserRole

client = TestClient(app)


def create_authenticated_user(role: UserRole) -> tuple[User, str]:
    """Helper to create and authenticate a test user in live database."""
    session_factory = get_sessionmaker()
    with session_factory() as db:
        unique_email = f"user_{role.value.lower()}_{uuid.uuid4().hex[:8]}@example.com"
        user = User(
            id=uuid.uuid4(),
            email=unique_email,
            password_hash=hash_password("ArogyaPass123!"),
            role=role,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        token = create_access_token(subject=user.id, role=user.role.value)
        return user, token


@pytest.mark.integration
def test_unauthorized_roles_blocked_from_user_management():
    """Verify non-admin roles (PATIENT, DOCTOR, RECEPTIONIST, BILLING_STAFF) are blocked with 403."""
    # 1. Unauthenticated request -> 401
    unauth_res = client.get("/api/v1/users")
    assert unauth_res.status_code == 401

    # 2. Clinical and Staff roles -> 403
    for non_admin_role in [
        UserRole.PATIENT,
        UserRole.DOCTOR,
        UserRole.RECEPTIONIST,
        UserRole.BILLING_STAFF,
    ]:
        _, token = create_authenticated_user(non_admin_role)
        headers = {"Authorization": f"Bearer {token}"}

        res_list = client.get("/api/v1/users", headers=headers)
        assert res_list.status_code == 403

        dummy_id = uuid.uuid4()
        res_get = client.get(f"/api/v1/users/{dummy_id}", headers=headers)
        assert res_get.status_code == 403

        res_put = client.put(
            f"/api/v1/users/{dummy_id}",
            headers=headers,
            json={"role": "ADMIN"},
        )
        assert res_put.status_code == 403

        res_act = client.post(f"/api/v1/users/{dummy_id}/activate", headers=headers)
        assert res_act.status_code == 403

        res_deact = client.post(f"/api/v1/users/{dummy_id}/deactivate", headers=headers)
        assert res_deact.status_code == 403


@pytest.mark.integration
def test_admin_list_and_search_users():
    """Verify administrator can search, filter, and paginate users."""
    _, admin_token = create_authenticated_user(UserRole.ADMIN)
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Create target test user
    target_user, _ = create_authenticated_user(UserRole.RECEPTIONIST)

    # 1. List users
    res = client.get("/api/v1/users", headers=headers)
    assert res.status_code == 200
    json_data = res.json()
    assert "data" in json_data
    assert "pagination" in json_data
    assert json_data["pagination"]["page"] == 1
    assert json_data["pagination"]["total"] >= 1

    # Verify no password_hash exposed in any item
    for u in json_data["data"]:
        assert "password_hash" not in u
        assert "email" in u
        assert "role" in u

    # 2. Filter by email search
    search_res = client.get(
        f"/api/v1/users?search={target_user.email}", headers=headers
    )
    assert search_res.status_code == 200
    results = search_res.json()["data"]
    assert len(results) == 1
    assert results[0]["id"] == str(target_user.id)

    # 3. Filter by role
    role_res = client.get("/api/v1/users?role=RECEPTIONIST", headers=headers)
    assert role_res.status_code == 200
    for u in role_res.json()["data"]:
        assert u["role"] == "RECEPTIONIST"


@pytest.mark.integration
def test_admin_user_detail_and_role_assignment():
    """Verify administrator can inspect user details and assign roles with audit trail."""
    admin_user, admin_token = create_authenticated_user(UserRole.ADMIN)
    headers = {"Authorization": f"Bearer {admin_token}"}

    target_user, _ = create_authenticated_user(UserRole.PATIENT)

    # 1. Get user detail
    detail_res = client.get(f"/api/v1/users/{target_user.id}", headers=headers)
    assert detail_res.status_code == 200
    user_data = detail_res.json()["data"]
    assert user_data["id"] == str(target_user.id)
    assert user_data["role"] == "PATIENT"
    assert "password_hash" not in user_data

    # 2. Update role from PATIENT to DOCTOR
    update_res = client.put(
        f"/api/v1/users/{target_user.id}",
        headers=headers,
        json={"role": "DOCTOR"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["data"]["role"] == "DOCTOR"

    # 3. Verify audit log entry created in database
    session_factory = get_sessionmaker()
    with session_factory() as db:
        audit_entry = db.scalar(
            select(AuditLog)
            .where(
                AuditLog.entity_id == str(target_user.id),
                AuditLog.action == "USER_ROLE_UPDATE",
            )
            .order_by(AuditLog.created_at.desc())
        )
        assert audit_entry is not None
        assert audit_entry.user_id == admin_user.id
        assert audit_entry.old_values == {"role": "PATIENT"}
        assert audit_entry.new_values == {"role": "DOCTOR"}


@pytest.mark.integration
def test_admin_account_activation_and_deactivation_lifecycle():
    """Verify activation/deactivation alters status, enforces login block, and writes audit trails."""
    admin_user, admin_token = create_authenticated_user(UserRole.ADMIN)
    headers = {"Authorization": f"Bearer {admin_token}"}

    target_user, target_token = create_authenticated_user(UserRole.DOCTOR)
    target_headers = {"Authorization": f"Bearer {target_token}"}

    # Verify initial active access
    me_res = client.get("/api/v1/auth/me", headers=target_headers)
    assert me_res.status_code == 200

    # 1. Deactivate target user
    deact_res = client.post(
        f"/api/v1/users/{target_user.id}/deactivate",
        headers=headers,
    )
    assert deact_res.status_code == 200
    assert deact_res.json()["data"]["is_active"] is False

    # 2. Verify target user is now blocked from authentication
    blocked_me = client.get("/api/v1/auth/me", headers=target_headers)
    assert blocked_me.status_code == 401

    blocked_login = client.post(
        "/api/v1/auth/login",
        json={"email": target_user.email, "password": "ArogyaPass123!"},
    )
    assert blocked_login.status_code == 401
    detail_msg = blocked_login.json()["detail"].lower()
    assert "deactivated" in detail_msg or "inactive" in detail_msg

    # 3. Reactivate target user
    act_res = client.post(
        f"/api/v1/users/{target_user.id}/activate",
        headers=headers,
    )
    assert act_res.status_code == 200
    assert act_res.json()["data"]["is_active"] is True

    # 4. Verify target user can now successfully login again
    success_login = client.post(
        "/api/v1/auth/login",
        json={"email": target_user.email, "password": "ArogyaPass123!"},
    )
    assert success_login.status_code == 200

    # 5. Verify audit log entries
    session_factory = get_sessionmaker()
    with session_factory() as db:
        deact_log = db.scalar(
            select(AuditLog)
            .where(
                AuditLog.entity_id == str(target_user.id),
                AuditLog.action == "USER_DEACTIVATE",
            )
            .order_by(AuditLog.created_at.desc())
        )
        assert deact_log is not None
        assert deact_log.user_id == admin_user.id

        act_log = db.scalar(
            select(AuditLog)
            .where(
                AuditLog.entity_id == str(target_user.id),
                AuditLog.action == "USER_ACTIVATE",
            )
            .order_by(AuditLog.created_at.desc())
        )
        assert act_log is not None
        assert act_log.user_id == admin_user.id


@pytest.mark.integration
def test_admin_self_deactivation_prevention():
    """Verify administrator cannot deactivate their own active account."""
    admin_user, admin_token = create_authenticated_user(UserRole.ADMIN)
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Attempt self-deactivation via POST /users/{id}/deactivate
    deact_res = client.post(
        f"/api/v1/users/{admin_user.id}/deactivate",
        headers=headers,
    )
    assert deact_res.status_code == 400
    assert "cannot deactivate their own" in deact_res.json()["detail"].lower()

    # Attempt self-deactivation via PUT /users/{id}
    put_res = client.put(
        f"/api/v1/users/{admin_user.id}",
        headers=headers,
        json={"is_active": False},
    )
    assert put_res.status_code == 400
    assert "cannot deactivate their own" in put_res.json()["detail"].lower()
