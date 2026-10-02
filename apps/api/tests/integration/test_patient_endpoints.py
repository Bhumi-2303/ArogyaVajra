"""Integration tests for patient management API endpoints and audit logging."""

import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.db.transaction import transactional_session
from app.main import app
from app.models.audit_log import AuditLog
from app.models.user import UserRole

client = TestClient(app)


def create_authenticated_user(role: UserRole) -> tuple[str, str]:
    """Helper to create user and return (email, token)."""
    email = f"{role.value.lower()}_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"

    reg = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "role": role.value},
    )
    assert reg.status_code == 201
    return email, reg.json()["data"]["access_token"]


@pytest.mark.integration
def test_patient_create_and_audit_trail():
    _, receptionist_token = create_authenticated_user(UserRole.RECEPTIONIST)
    patient_email = f"patient_{uuid.uuid4().hex[:8]}@example.com"

    # 1. Receptionist registers patient
    payload = {
        "email": patient_email,
        "first_name": "Aarav",
        "last_name": "Sharma",
        "date_of_birth": "1990-05-15",
        "gender": "MALE",
        "phone": "+919876543210",
        "address": "45 MG Road, Bengaluru",
        "emergency_contact_name": "Sunita Sharma",
        "emergency_contact_phone": "+919876543219",
    }

    create_res = client.post(
        "/api/v1/patients",
        headers={"Authorization": f"Bearer {receptionist_token}"},
        json=payload,
    )
    assert create_res.status_code == 201
    data = create_res.json()["data"]
    assert data["first_name"] == "Aarav"
    assert data["last_name"] == "Sharma"
    assert data["phone"] == "+919876543210"
    assert data["email"] == patient_email
    assert data["patient_code"].startswith("PAT-")
    patient_id = data["id"]

    # 2. Check audit trail logged for PATIENT_CREATE
    with transactional_session() as session:
        audit = session.scalar(
            select(AuditLog)
            .where(AuditLog.entity_id == patient_id)
            .order_by(AuditLog.created_at.desc())
        )
        assert audit is not None
        assert audit.action == "PATIENT_CREATE"
        assert audit.entity_type == "patient_profile"
        assert audit.new_values["first_name"] == "Aarav"


@pytest.mark.integration
def test_patient_search_and_pagination():
    _, receptionist_token = create_authenticated_user(UserRole.RECEPTIONIST)
    _, doctor_token = create_authenticated_user(UserRole.DOCTOR)
    suffix = uuid.uuid4().hex[:6]

    # Create 3 distinct patients with unique identifiable attributes
    p1 = {
        "email": f"rahul_{suffix}@example.com",
        "first_name": f"Rahul_{suffix}",
        "last_name": "Verma",
        "phone": f"+9191000{suffix[:4]}",
    }
    p2 = {
        "email": f"priya_{suffix}@example.com",
        "first_name": f"Priya_{suffix}",
        "last_name": "Mehta",
        "phone": f"+9192000{suffix[:4]}",
    }
    p3 = {
        "email": f"amit_{suffix}@example.com",
        "first_name": f"Amit_{suffix}",
        "last_name": "Verma",
        "phone": f"+9193000{suffix[:4]}",
    }

    recep_headers = {"Authorization": f"Bearer {receptionist_token}"}
    headers = {"Authorization": f"Bearer {doctor_token}"}
    r1 = client.post("/api/v1/patients", headers=recep_headers, json=p1).json()["data"]
    client.post("/api/v1/patients", headers=recep_headers, json=p2)
    client.post("/api/v1/patients", headers=recep_headers, json=p3)

    # 1. Search by name
    name_res = client.get(f"/api/v1/patients?name=Rahul_{suffix}", headers=headers)
    assert name_res.status_code == 200
    assert len(name_res.json()["data"]) == 1
    assert name_res.json()["data"][0]["first_name"] == f"Rahul_{suffix}"

    # 2. Search by code
    code_res = client.get(
        f"/api/v1/patients?code={r1['patient_code']}", headers=headers
    )
    assert code_res.status_code == 200
    assert len(code_res.json()["data"]) == 1
    assert code_res.json()["data"][0]["patient_code"] == r1["patient_code"]

    # 3. Search by phone
    phone_res = client.get(f"/api/v1/patients?phone={p2['phone']}", headers=headers)
    assert phone_res.status_code == 200
    assert len(phone_res.json()["data"]) == 1
    assert phone_res.json()["data"][0]["phone"] == p2["phone"]

    # 4. Search by email
    email_res = client.get(f"/api/v1/patients?email={p2['email']}", headers=headers)
    assert email_res.status_code == 200
    assert len(email_res.json()["data"]) == 1
    assert email_res.json()["data"][0]["email"] == p2["email"]

    # 5. Global search query across multiple matches (e.g. Verma)
    global_res = client.get(f"/api/v1/patients?search={suffix}", headers=headers)
    assert global_res.status_code == 200
    assert len(global_res.json()["data"]) >= 3
    assert global_res.json()["pagination"]["total"] >= 3


@pytest.mark.integration
def test_patient_update_and_audit_log():
    _, receptionist_token = create_authenticated_user(UserRole.RECEPTIONIST)
    patient_email = f"update_{uuid.uuid4().hex[:8]}@example.com"

    reg = client.post(
        "/api/v1/patients",
        headers={"Authorization": f"Bearer {receptionist_token}"},
        json={
            "email": patient_email,
            "first_name": "Vikram",
            "last_name": "Rao",
            "phone": "+919800000001",
            "address": "Initial Address",
        },
    )
    patient_id = reg.json()["data"]["id"]

    # Update patient
    update_res = client.put(
        f"/api/v1/patients/{patient_id}",
        headers={"Authorization": f"Bearer {receptionist_token}"},
        json={
            "phone": "+919800000099",
            "address": "Updated Clinical Address",
        },
    )
    assert update_res.status_code == 200
    data = update_res.json()["data"]
    assert data["phone"] == "+919800000099"
    assert data["address"] == "Updated Clinical Address"

    # Verify audit log recorded old and new values
    with transactional_session() as session:
        audit = session.scalar(
            select(AuditLog)
            .where(
                AuditLog.entity_id == patient_id, AuditLog.action == "PATIENT_UPDATE"
            )
            .order_by(AuditLog.created_at.desc())
        )
        assert audit is not None
        assert audit.old_values["phone"] == "+919800000001"
        assert audit.new_values["phone"] == "+919800000099"


@pytest.mark.integration
def test_patient_delete_admin_only():
    _, doctor_token = create_authenticated_user(UserRole.DOCTOR)
    _, admin_token = create_authenticated_user(UserRole.ADMIN)

    reg = client.post(
        "/api/v1/patients",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "email": f"del_{uuid.uuid4().hex[:8]}@example.com",
            "first_name": "Delete",
            "last_name": "Target",
        },
    )
    patient_id = reg.json()["data"]["id"]

    # Doctor trying to delete -> 403 Forbidden
    doc_del = client.delete(
        f"/api/v1/patients/{patient_id}",
        headers={"Authorization": f"Bearer {doctor_token}"},
    )
    assert doc_del.status_code == 403

    # Admin delete -> 200 OK
    admin_del = client.delete(
        f"/api/v1/patients/{patient_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert admin_del.status_code == 200

    # Verify patient no longer found
    get_res = client.get(
        f"/api/v1/patients/{patient_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert get_res.status_code == 404


@pytest.mark.integration
def test_patient_subresource_retrieval_and_rbac():
    _, doctor_token = create_authenticated_user(UserRole.DOCTOR)
    _, billing_token = create_authenticated_user(UserRole.BILLING_STAFF)
    _, admin_token = create_authenticated_user(UserRole.ADMIN)

    # Register patient
    reg = client.post(
        "/api/v1/patients",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "email": f"sub_{uuid.uuid4().hex[:8]}@example.com",
            "first_name": "Sub",
            "last_name": "Resource",
        },
    )
    patient_id = reg.json()["data"]["id"]

    # 1. Appointments retrieval -> accessible by doctor, billing staff, admin
    assert (
        client.get(
            f"/api/v1/patients/{patient_id}/appointments",
            headers={"Authorization": f"Bearer {doctor_token}"},
        ).status_code
        == 200
    )
    assert (
        client.get(
            f"/api/v1/patients/{patient_id}/appointments",
            headers={"Authorization": f"Bearer {billing_token}"},
        ).status_code
        == 200
    )

    # 2. Medical records -> Doctor (200), Billing staff (403 Forbidden)
    assert (
        client.get(
            f"/api/v1/patients/{patient_id}/medical-records",
            headers={"Authorization": f"Bearer {doctor_token}"},
        ).status_code
        == 200
    )
    assert (
        client.get(
            f"/api/v1/patients/{patient_id}/medical-records",
            headers={"Authorization": f"Bearer {billing_token}"},
        ).status_code
        == 403
    )

    # 3. Prescriptions -> Doctor (200), Billing staff (403 Forbidden)
    assert (
        client.get(
            f"/api/v1/patients/{patient_id}/prescriptions",
            headers={"Authorization": f"Bearer {doctor_token}"},
        ).status_code
        == 200
    )
    assert (
        client.get(
            f"/api/v1/patients/{patient_id}/prescriptions",
            headers={"Authorization": f"Bearer {billing_token}"},
        ).status_code
        == 403
    )

    # 4. Invoices -> Billing staff (200), Doctor (403 Forbidden)
    assert (
        client.get(
            f"/api/v1/patients/{patient_id}/invoices",
            headers={"Authorization": f"Bearer {billing_token}"},
        ).status_code
        == 200
    )
    assert (
        client.get(
            f"/api/v1/patients/{patient_id}/invoices",
            headers={"Authorization": f"Bearer {doctor_token}"},
        ).status_code
        == 403
    )
