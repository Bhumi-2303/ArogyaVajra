"""Integration tests for POST /api/v1/users staff provisioning endpoint."""

import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.core.security import create_access_token, hash_password
from app.db.session import get_sessionmaker
from app.main import app
from app.models.audit_log import AuditLog
from app.models.doctor import DoctorProfile
from app.models.user import User, UserRole

client = TestClient(app)


def create_authenticated_user(role: UserRole) -> tuple[User, str]:
    """Helper to provision and authenticate a user for testing."""
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
def test_admin_can_provision_receptionist_and_billing_staff():
    """Verify administrator can provision staff members with custom passwords."""
    _, admin_token = create_authenticated_user(UserRole.ADMIN)
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Provision Receptionist
    rec_email = f"rec_{uuid.uuid4().hex[:8]}@hospital.org"
    rec_payload = {
        "email": rec_email,
        "role": "RECEPTIONIST",
        "password": "CustomStaffPass123!",
    }

    res_rec = client.post("/api/v1/users", json=rec_payload, headers=headers)
    assert res_rec.status_code == 201
    rec_json = res_rec.json()
    assert rec_json["data"]["email"] == rec_email
    assert rec_json["data"]["role"] == "RECEPTIONIST"
    assert rec_json["data"]["is_active"] is True
    assert "password_hash" not in rec_json["data"]

    # Verify newly provisioned receptionist can immediately log in
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": rec_email, "password": "CustomStaffPass123!"},
    )
    assert login_res.status_code == 200
    assert login_res.json()["data"]["user"]["role"] == "RECEPTIONIST"

    # 2. Provision Billing Staff with auto-generated temporary password
    bill_email = f"bill_{uuid.uuid4().hex[:8]}@hospital.org"
    bill_payload = {
        "email": bill_email,
        "role": "BILLING_STAFF",
    }

    res_bill = client.post("/api/v1/users", json=bill_payload, headers=headers)
    assert res_bill.status_code == 201
    bill_json = res_bill.json()
    assert bill_json["data"]["email"] == bill_email
    assert bill_json["data"]["role"] == "BILLING_STAFF"
    temp_pw = bill_json["temporary_password"]
    assert temp_pw is not None
    assert len(temp_pw) >= 12

    # Verify newly provisioned billing staff can log in with temporary password
    bill_login = client.post(
        "/api/v1/auth/login",
        json={"email": bill_email, "password": temp_pw},
    )
    assert bill_login.status_code == 200
    assert bill_login.json()["data"]["user"]["role"] == "BILLING_STAFF"


@pytest.mark.integration
def test_admin_can_provision_doctor_with_profile():
    """Verify provisioning a DOCTOR initializes both User and DoctorProfile."""
    admin_user, admin_token = create_authenticated_user(UserRole.ADMIN)
    headers = {"Authorization": f"Bearer {admin_token}"}

    doc_email = f"dr.sharma.{uuid.uuid4().hex[:8]}@hospital.org"
    doc_payload = {
        "email": doc_email,
        "role": "DOCTOR",
        "password": "DoctorPass!123",
    }

    res = client.post("/api/v1/users", json=doc_payload, headers=headers)
    assert res.status_code == 201
    doc_id = res.json()["data"]["id"]

    # Verify DoctorProfile was auto-initialized
    session_factory = get_sessionmaker()
    with session_factory() as db:
        profile = db.scalar(
            select(DoctorProfile).where(DoctorProfile.user_id == uuid.UUID(doc_id))
        )
        assert profile is not None
        assert profile.doctor_code.startswith("DOC-")
        assert profile.first_name in ("Dr", "Dr.")

        # Verify audit log was recorded
        audit_log = db.scalar(
            select(AuditLog)
            .where(
                AuditLog.entity_id == doc_id,
                AuditLog.action == "USER_CREATE",
            )
        )
        assert audit_log is not None
        assert audit_log.user_id == admin_user.id
        assert "password" not in str(audit_log.new_values)


@pytest.mark.integration
def test_non_admins_forbidden_from_provisioning():
    """Verify PATIENT, DOCTOR, RECEPTIONIST, BILLING_STAFF are rejected with 403."""
    for role in [
        UserRole.PATIENT,
        UserRole.DOCTOR,
        UserRole.RECEPTIONIST,
        UserRole.BILLING_STAFF,
    ]:
        _, token = create_authenticated_user(role)
        headers = {"Authorization": f"Bearer {token}"}

        res = client.post(
            "/api/v1/users",
            json={"email": f"attacker_{role.value}@test.com", "role": "ADMIN"},
            headers=headers,
        )
        assert res.status_code == 403


@pytest.mark.integration
def test_duplicate_email_conflict_rejected():
    """Verify attempting to create a user with an already registered email returns 409."""
    _, admin_token = create_authenticated_user(UserRole.ADMIN)
    headers = {"Authorization": f"Bearer {admin_token}"}

    existing_user, _ = create_authenticated_user(UserRole.PATIENT)

    res = client.post(
        "/api/v1/users",
        json={"email": existing_user.email, "role": "RECEPTIONIST"},
        headers=headers,
    )
    assert res.status_code == 409
    assert "already exists" in res.json()["detail"].lower()
