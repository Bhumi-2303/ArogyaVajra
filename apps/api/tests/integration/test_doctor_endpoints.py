"""Integration tests for doctor management API endpoints, RBAC, search, and audit trail."""

import uuid
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.db.transaction import transactional_session
from app.main import app
from app.models.audit_log import AuditLog
from app.models.user import UserRole

client = TestClient(app)


def create_authenticated_user(role: UserRole) -> tuple[str, str, str]:
    """Helper to create user and return (user_id, email, token)."""
    email = f"{role.value.lower()}_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"

    reg = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "role": role.value},
    )
    assert reg.status_code == 201
    user_id = reg.json()["data"]["user"]["id"]
    token = reg.json()["data"]["access_token"]
    return user_id, email, token


@pytest.mark.integration
def test_doctor_create_admin_only_and_audit_trail():
    """Verify that only admin can provision a doctor and audit log is written."""
    _, _, admin_token = create_authenticated_user(UserRole.ADMIN)
    _, _, receptionist_token = create_authenticated_user(UserRole.RECEPTIONIST)
    _, _, patient_token = create_authenticated_user(UserRole.PATIENT)

    suffix = uuid.uuid4().hex[:6]
    doc_email = f"doc_{suffix}@example.com"
    payload = {
        "email": doc_email,
        "first_name": "Aarav",
        "last_name": f"Menon_{suffix}",
        "specialization": "Cardiology",
        "qualification": "MBBS, MD (Cardiology)",
        "license_number": f"MED-{suffix.upper()}",
        "phone": "+919876543299",
        "consultation_fee": "750.00",
        "bio": "Senior Interventional Cardiologist with over 12 years of experience.",
    }

    # 1. Non-admin roles should be forbidden from creating doctor profiles
    res_rec = client.post(
        "/api/v1/doctors",
        headers={"Authorization": f"Bearer {receptionist_token}"},
        json=payload,
    )
    assert res_rec.status_code == 403

    res_pat = client.post(
        "/api/v1/doctors",
        headers={"Authorization": f"Bearer {patient_token}"},
        json=payload,
    )
    assert res_pat.status_code == 403

    # 2. Admin successfully creates doctor profile
    res_admin = client.post(
        "/api/v1/doctors",
        headers={"Authorization": f"Bearer {admin_token}"},
        json=payload,
    )
    assert res_admin.status_code == 201
    data = res_admin.json()["data"]
    assert data["first_name"] == "Aarav"
    assert data["last_name"] == f"Menon_{suffix}"
    assert data["specialization"] == "Cardiology"
    assert data["consultation_fee"] == 750.0 or Decimal(
        str(data["consultation_fee"])
    ) == Decimal("750.00")
    assert data["doctor_code"].startswith("DOC-")
    doctor_id = data["id"]

    # 3. Check audit log in PostgreSQL
    with transactional_session() as session:
        audit = session.scalar(
            select(AuditLog)
            .where(AuditLog.entity_id == doctor_id)
            .order_by(AuditLog.created_at.desc())
        )
        assert audit is not None
        assert audit.action == "DOCTOR_CREATE"
        assert audit.entity_type == "DOCTOR"
        assert audit.new_values["specialization"] == "Cardiology"


@pytest.mark.integration
def test_doctor_search_and_pagination():
    """Verify search by doctor name, specialization, doctor code, and pagination."""
    _, _, admin_token = create_authenticated_user(UserRole.ADMIN)
    _, _, patient_token = create_authenticated_user(UserRole.PATIENT)
    suffix = uuid.uuid4().hex[:6]

    # Create 3 doctors with different specializations and names
    d1_payload = {
        "email": f"ped_{suffix}@example.com",
        "first_name": f"Sunita_{suffix}",
        "last_name": "Rao",
        "specialization": f"Pediatrics_{suffix}",
        "qualification": "MBBS, DCH",
        "consultation_fee": "500.00",
    }
    d2_payload = {
        "email": f"neuro_{suffix}@example.com",
        "first_name": f"Vikram_{suffix}",
        "last_name": "Patel",
        "specialization": f"Neurology_{suffix}",
        "qualification": "MBBS, DM (Neurology)",
        "consultation_fee": "1200.00",
    }
    d3_payload = {
        "email": f"ortho_{suffix}@example.com",
        "first_name": f"Rohan_{suffix}",
        "last_name": "Rao",
        "specialization": f"Orthopedics_{suffix}",
        "qualification": "MS (Ortho)",
        "consultation_fee": "800.00",
    }

    res1 = client.post(
        "/api/v1/doctors",
        headers={"Authorization": f"Bearer {admin_token}"},
        json=d1_payload,
    )
    assert res1.status_code == 201
    doc1_code = res1.json()["data"]["doctor_code"]

    res2 = client.post(
        "/api/v1/doctors",
        headers={"Authorization": f"Bearer {admin_token}"},
        json=d2_payload,
    )
    assert res2.status_code == 201

    res3 = client.post(
        "/api/v1/doctors",
        headers={"Authorization": f"Bearer {admin_token}"},
        json=d3_payload,
    )
    assert res3.status_code == 201

    # Search by doctor name
    search_res = client.get(
        f"/api/v1/doctors?search=Vikram_{suffix}",
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert search_res.status_code == 200
    search_data = search_res.json()["data"]
    assert len(search_data) == 1
    assert search_data[0]["first_name"] == f"Vikram_{suffix}"

    # Search by specialization
    spec_res = client.get(
        f"/api/v1/doctors?specialization=Pediatrics_{suffix}",
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert spec_res.status_code == 200
    spec_data = spec_res.json()["data"]
    assert len(spec_data) == 1
    assert spec_data[0]["specialization"] == f"Pediatrics_{suffix}"

    # Search by doctor code
    code_res = client.get(
        f"/api/v1/doctors?code={doc1_code}",
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert code_res.status_code == 200
    code_data = code_res.json()["data"]
    assert len(code_data) == 1
    assert code_data[0]["doctor_code"] == doc1_code

    # Pagination test
    page_res = client.get(
        f"/api/v1/doctors?search={suffix}&page=1&page_size=2",
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert page_res.status_code == 200
    body = page_res.json()
    assert len(body["data"]) == 2
    assert body["pagination"]["page"] == 1
    assert body["pagination"]["page_size"] == 2
    assert body["pagination"]["total"] == 3
    assert body["pagination"]["total_pages"] == 2


@pytest.mark.integration
def test_doctor_update_self_and_admin_vs_forbidden():
    """Verify admin or owning doctor can update profile, while others receive 403."""
    _, _, admin_token = create_authenticated_user(UserRole.ADMIN)
    doc_user_id, _, doc_token = create_authenticated_user(UserRole.DOCTOR)
    _, _, other_doc_token = create_authenticated_user(UserRole.DOCTOR)
    _, _, patient_token = create_authenticated_user(UserRole.PATIENT)

    suffix = uuid.uuid4().hex[:6]
    # Admin creates profile associated with doc_user_id
    payload = {
        "user_id": doc_user_id,
        "first_name": "Meera",
        "last_name": f"Nair_{suffix}",
        "specialization": "Dermatology",
        "qualification": "MBBS, MD",
        "consultation_fee": "600.00",
    }
    create_res = client.post(
        "/api/v1/doctors",
        headers={"Authorization": f"Bearer {admin_token}"},
        json=payload,
    )
    assert create_res.status_code == 201
    doctor_id = create_res.json()["data"]["id"]

    # Other doctor tries to update -> 403 Forbidden
    unauth_res = client.put(
        f"/api/v1/doctors/{doctor_id}",
        headers={"Authorization": f"Bearer {other_doc_token}"},
        json={"consultation_fee": "999.00"},
    )
    assert unauth_res.status_code == 403

    # Patient tries to update -> 403 Forbidden
    pat_res = client.put(
        f"/api/v1/doctors/{doctor_id}",
        headers={"Authorization": f"Bearer {patient_token}"},
        json={"consultation_fee": "999.00"},
    )
    assert pat_res.status_code == 403

    # Owning doctor updates bio and consultation fee -> 200 OK
    own_update_res = client.put(
        f"/api/v1/doctors/{doctor_id}",
        headers={"Authorization": f"Bearer {doc_token}"},
        json={"consultation_fee": "700.00", "bio": "Updated self bio"},
    )
    assert own_update_res.status_code == 200
    assert own_update_res.json()["data"]["bio"] == "Updated self bio"

    # Admin updates qualification -> 200 OK
    admin_update_res = client.put(
        f"/api/v1/doctors/{doctor_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"qualification": "MBBS, MD, Fellowship"},
    )
    assert admin_update_res.status_code == 200
    assert admin_update_res.json()["data"]["qualification"] == "MBBS, MD, Fellowship"

    # Check update audit trail
    with transactional_session() as session:
        audits = session.scalars(
            select(AuditLog).where(
                AuditLog.entity_id == doctor_id, AuditLog.action == "DOCTOR_UPDATE"
            )
        ).all()
        assert len(audits) >= 2


@pytest.mark.integration
def test_doctor_delete_admin_only():
    """Verify only admin can delete doctor and 404 on subsequent get."""
    _, _, admin_token = create_authenticated_user(UserRole.ADMIN)
    _, _, doc_token = create_authenticated_user(UserRole.DOCTOR)
    suffix = uuid.uuid4().hex[:6]

    res = client.post(
        "/api/v1/doctors",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "email": f"del_doc_{suffix}@example.com",
            "first_name": "To Delete",
            "last_name": f"Doctor_{suffix}",
            "specialization": "General",
        },
    )
    assert res.status_code == 201
    doctor_id = res.json()["data"]["id"]

    # Doctor tries to delete -> 403 Forbidden
    del_doc_res = client.delete(
        f"/api/v1/doctors/{doctor_id}",
        headers={"Authorization": f"Bearer {doc_token}"},
    )
    assert del_doc_res.status_code == 403

    # Admin deletes doctor -> 200 OK
    del_admin_res = client.delete(
        f"/api/v1/doctors/{doctor_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert del_admin_res.status_code == 200

    # Getting deleted doctor -> 404 Not Found
    get_res = client.get(
        f"/api/v1/doctors/{doctor_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert get_res.status_code == 404

    # Audit log recorded
    with transactional_session() as session:
        audit = session.scalar(
            select(AuditLog).where(
                AuditLog.entity_id == doctor_id, AuditLog.action == "DOCTOR_DELETE"
            )
        )
        assert audit is not None
