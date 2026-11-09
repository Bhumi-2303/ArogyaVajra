"""Integration tests for medical records and prescriptions authorization and lifecycle."""

import uuid
from datetime import UTC, datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.db.session import SessionLocal
from app.main import app
from app.models.doctor import DoctorProfile
from app.models.patient import PatientProfile
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


def create_doctor(user_id: uuid.UUID) -> uuid.UUID:
    """Helper to link doctor profile."""
    suffix = uuid.uuid4().hex[:6]
    with SessionLocal() as db:
        doc = DoctorProfile(
            user_id=user_id,
            doctor_code=f"DOC-{suffix.upper()}",
            first_name="Clinician",
            last_name="Test",
            specialization="Internal Medicine",
            consultation_fee=700,
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        return doc.id


@pytest.mark.integration
def test_medical_records_authorization_and_crud():
    """Verify doctor creation of medical record, patient read access, and cross-patient isolation."""
    doc_user_id, _, doc_token = create_user_with_role(UserRole.DOCTOR)
    doc_id = create_doctor(doc_user_id)

    p1_user_id, _, p1_token = create_user_with_role(UserRole.PATIENT)
    _, _, p2_token = create_user_with_role(UserRole.PATIENT)

    with SessionLocal() as db:
        p1 = db.scalar(
            select(PatientProfile).where(PatientProfile.user_id == p1_user_id)
        )
        p1_id = p1.id

    today_str = datetime.now(UTC).date().isoformat()

    # 1. Doctor creates medical record for Patient 1
    create_res = client.post(
        "/api/v1/medical-records",
        headers=auth_headers(doc_token),
        json={
            "patient_id": str(p1_id),
            "doctor_id": str(doc_id),
            "record_date": today_str,
            "chief_complaint": "Persistent headache and fatigue",
            "diagnosis": "Tension Headache",
            "clinical_notes": "Patient advised rest and hydration.",
            "treatment_notes": "Prescribed analgesics.",
        },
    )
    assert create_res.status_code == 201
    rec = create_res.json()["data"]
    rec_id = rec["id"]

    # 2. Patient 1 reads their own medical record (200)
    p1_read = client.get(
        f"/api/v1/medical-records/{rec_id}",
        headers=auth_headers(p1_token),
    )
    assert p1_read.status_code == 200
    assert p1_read.json()["data"]["diagnosis"] == "Tension Headache"

    # 3. Patient 2 attempts to read Patient 1's record (403 Forbidden)
    p2_read = client.get(
        f"/api/v1/medical-records/{rec_id}",
        headers=auth_headers(p2_token),
    )
    assert p2_read.status_code == 403

    # 4. Patient 1 attempts to update medical record (403 - patients cannot write records)
    p1_upd = client.put(
        f"/api/v1/medical-records/{rec_id}",
        headers=auth_headers(p1_token),
        json={"diagnosis": "Self diagnosed migraine"},
    )
    assert p1_upd.status_code == 403

    # 5. Doctor updates medical record (200)
    doc_upd = client.put(
        f"/api/v1/medical-records/{rec_id}",
        headers=auth_headers(doc_token),
        json={"clinical_notes": "Updated note: patient feeling better."},
    )
    assert doc_upd.status_code == 200
    assert "feeling better" in doc_upd.json()["data"]["clinical_notes"]


@pytest.mark.integration
def test_prescription_lifecycle_and_cancellation():
    """Verify prescription issuance, item creation, patient access, and cancellation rules."""
    doc1_user_id, _, doc1_token = create_user_with_role(UserRole.DOCTOR)
    doc1_id = create_doctor(doc1_user_id)

    doc2_user_id, _, doc2_token = create_user_with_role(UserRole.DOCTOR)
    create_doctor(doc2_user_id)

    p1_user_id, _, p1_token = create_user_with_role(UserRole.PATIENT)
    _, _, p2_token = create_user_with_role(UserRole.PATIENT)

    with SessionLocal() as db:
        p1 = db.scalar(
            select(PatientProfile).where(PatientProfile.user_id == p1_user_id)
        )
        p1_id = p1.id

    today_str = datetime.now(UTC).date().isoformat()

    # 1. Doctor 1 issues prescription with items for Patient 1
    rx_res = client.post(
        "/api/v1/prescriptions",
        headers=auth_headers(doc1_token),
        json={
            "patient_id": str(p1_id),
            "doctor_id": str(doc1_id),
            "prescription_date": today_str,
            "instructions": "Take medicines after meals with warm water.",
            "items": [
                {
                    "medicine_name": "Paracetamol",
                    "dosage": "500mg",
                    "frequency": "1-0-1",
                    "duration": "5 days",
                    "route": "Oral",
                    "instructions": "After meals",
                },
                {
                    "medicine_name": "Vitamin C",
                    "dosage": "500mg",
                    "frequency": "0-1-0",
                    "duration": "10 days",
                    "route": "Oral",
                },
            ],
        },
    )
    assert rx_res.status_code == 201
    rx = rx_res.json()["data"]
    rx_id = rx["id"]
    assert len(rx["items"]) == 2
    assert rx["status"] == "ACTIVE"

    # 2. Patient 1 views their prescription (200)
    p1_view = client.get(
        f"/api/v1/prescriptions/{rx_id}",
        headers=auth_headers(p1_token),
    )
    assert p1_view.status_code == 200

    # 3. Patient 2 cannot view Patient 1's prescription (403)
    p2_view = client.get(
        f"/api/v1/prescriptions/{rx_id}",
        headers=auth_headers(p2_token),
    )
    assert p2_view.status_code == 403

    # 4. Patient 1 cannot cancel prescription (403)
    p1_cancel = client.post(
        f"/api/v1/prescriptions/{rx_id}/cancel",
        headers=auth_headers(p1_token),
    )
    assert p1_cancel.status_code == 403

    # 5. Doctor 2 cannot cancel Doctor 1's prescription (403)
    doc2_cancel = client.post(
        f"/api/v1/prescriptions/{rx_id}/cancel",
        headers=auth_headers(doc2_token),
    )
    assert doc2_cancel.status_code == 403

    # 6. Doctor 1 cancels prescription successfully
    doc1_cancel = client.post(
        f"/api/v1/prescriptions/{rx_id}/cancel",
        headers=auth_headers(doc1_token),
    )
    assert doc1_cancel.status_code == 200
    assert doc1_cancel.json()["data"]["status"] == "CANCELLED"
