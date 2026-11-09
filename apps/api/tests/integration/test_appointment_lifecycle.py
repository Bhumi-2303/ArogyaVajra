"""Integration tests for appointment status lifecycle and RBAC authorization."""

import uuid
from datetime import UTC, datetime, timedelta

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
    """Helper to create and authenticate a user with a given role."""
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


def create_test_doctor(admin_token: str) -> tuple[uuid.UUID, str]:
    """Helper to provision a doctor profile."""
    doc_user_id, _, doc_token = create_user_with_role(UserRole.DOCTOR)
    suffix = uuid.uuid4().hex[:6]
    with SessionLocal() as db:
        doc = DoctorProfile(
            user_id=doc_user_id,
            doctor_code=f"DOC-{suffix.upper()}",
            first_name="Lifecycle",
            last_name=f"Doc_{suffix}",
            specialization="General Medicine",
            consultation_fee=600,
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        doctor_id = doc.id

    # Add daily availability for doctor
    for day in range(7):
        avail_res = client.post(
            f"/api/v1/doctors/{doctor_id}/availability",
            headers=auth_headers(doc_token),
            json={
                "day_of_week": day,
                "start_time": "08:00:00",
                "end_time": "18:00:00",
                "slot_duration_minutes": 30,
            },
        )
        assert avail_res.status_code == 201

    return doctor_id, doc_token


@pytest.mark.integration
def test_appointment_full_status_lifecycle():
    """Verify SCHEDULED -> CONFIRMED -> COMPLETED lifecycle and invalid transitions."""
    _, _, admin_token = create_user_with_role(UserRole.ADMIN)
    p_user_id, _, p_token = create_user_with_role(UserRole.PATIENT)
    doctor_id, doc_token = create_test_doctor(admin_token)

    with SessionLocal() as db:
        patient = db.scalar(
            select(PatientProfile).where(PatientProfile.user_id == p_user_id)
        )
        patient_id = patient.id

    appt_date = (datetime.now(UTC) + timedelta(days=2)).date().isoformat()

    # 1. Book appointment (SCHEDULED)
    book_res = client.post(
        "/api/v1/appointments",
        headers=auth_headers(p_token),
        json={
            "patient_id": str(patient_id),
            "doctor_id": str(doctor_id),
            "appointment_date": appt_date,
            "start_time": "09:00:00",
            "end_time": "09:30:00",
            "reason": "Routine Checkup",
        },
    )
    assert book_res.status_code == 201
    appt_id = book_res.json()["data"]["id"]
    assert book_res.json()["data"]["status"] == "SCHEDULED"

    # 2. Confirm appointment (CONFIRMED)
    conf_res = client.post(
        f"/api/v1/appointments/{appt_id}/confirm",
        headers=auth_headers(doc_token),
    )
    assert conf_res.status_code == 200
    assert conf_res.json()["data"]["status"] == "CONFIRMED"

    # 3. Complete appointment (COMPLETED)
    comp_res = client.post(
        f"/api/v1/appointments/{appt_id}/complete",
        headers=auth_headers(doc_token),
    )
    assert comp_res.status_code == 200
    assert comp_res.json()["data"]["status"] == "COMPLETED"

    # 4. Invalid transition: cannot reschedule or set COMPLETED to SCHEDULED/CONFIRMED
    resched_res = client.put(
        f"/api/v1/appointments/{appt_id}",
        headers=auth_headers(doc_token),
        json={"status": "SCHEDULED"},
    )
    assert resched_res.status_code == 400
    assert "Cannot reschedule a completed appointment" in resched_res.json()["detail"]

    # 5. Book a second appointment to test CANCELLED lifecycle
    book_res2 = client.post(
        "/api/v1/appointments",
        headers=auth_headers(p_token),
        json={
            "patient_id": str(patient_id),
            "doctor_id": str(doctor_id),
            "appointment_date": appt_date,
            "start_time": "10:00:00",
            "end_time": "10:30:00",
            "reason": "Follow up",
        },
    )
    assert book_res2.status_code == 201
    appt2_id = book_res2.json()["data"]["id"]

    # Cancel via cancel endpoint
    cancel_res = client.post(
        f"/api/v1/appointments/{appt2_id}/cancel",
        headers=auth_headers(p_token),
    )
    assert cancel_res.status_code == 200
    assert cancel_res.json()["data"]["status"] == "CANCELLED"

    # Invalid transition: cannot complete a CANCELLED appointment
    comp_fail = client.post(
        f"/api/v1/appointments/{appt2_id}/complete",
        headers=auth_headers(doc_token),
    )
    assert comp_fail.status_code == 400
    assert "Cannot complete a cancelled appointment" in comp_fail.json()["detail"]


@pytest.mark.integration
def test_appointment_role_authorization_and_ownership():
    """Verify patient and doctor ownership rules on appointments."""
    _, _, admin_token = create_user_with_role(UserRole.ADMIN)
    p1_user_id, _, p1_token = create_user_with_role(UserRole.PATIENT)
    _, _, p2_token = create_user_with_role(UserRole.PATIENT)
    doctor1_id, _ = create_test_doctor(admin_token)
    _, doc2_token = create_test_doctor(admin_token)

    with SessionLocal() as db:
        p1 = db.scalar(
            select(PatientProfile).where(PatientProfile.user_id == p1_user_id)
        )
        p1_id = p1.id

    appt_date = (datetime.now(UTC) + timedelta(days=3)).date().isoformat()

    # Patient 1 books appointment with Doctor 1
    book_res = client.post(
        "/api/v1/appointments",
        headers=auth_headers(p1_token),
        json={
            "patient_id": str(p1_id),
            "doctor_id": str(doctor1_id),
            "appointment_date": appt_date,
            "start_time": "11:00:00",
            "end_time": "11:30:00",
            "reason": "Consultation",
        },
    )
    assert book_res.status_code == 201
    appt_id = book_res.json()["data"]["id"]

    # 1. Patient 2 cannot access Patient 1's appointment details (403)
    p2_get = client.get(
        f"/api/v1/appointments/{appt_id}",
        headers=auth_headers(p2_token),
    )
    assert p2_get.status_code == 403

    # 2. Patient 2 cannot cancel Patient 1's appointment (403)
    p2_cancel = client.post(
        f"/api/v1/appointments/{appt_id}/cancel",
        headers=auth_headers(p2_token),
    )
    assert p2_cancel.status_code == 403

    # 3. Patient 1 cannot confirm an appointment (only doctor/admin/receptionist)
    p1_conf = client.post(
        f"/api/v1/appointments/{appt_id}/confirm",
        headers=auth_headers(p1_token),
    )
    assert p1_conf.status_code == 403

    # 4. Patient 1 cannot edit clinical notes (403)
    p1_notes = client.put(
        f"/api/v1/appointments/{appt_id}",
        headers=auth_headers(p1_token),
        json={"notes": "Illegal edit by patient"},
    )
    assert p1_notes.status_code == 403

    # 5. Doctor 2 cannot modify Doctor 1's appointment (403)
    doc2_conf = client.post(
        f"/api/v1/appointments/{appt_id}/confirm",
        headers=auth_headers(doc2_token),
    )
    assert doc2_conf.status_code == 403

    # 6. Receptionist CAN read and confirm Doctor 1's appointment
    _, _, recep_token = create_user_with_role(UserRole.RECEPTIONIST)
    recep_conf = client.post(
        f"/api/v1/appointments/{appt_id}/confirm",
        headers=auth_headers(recep_token),
    )
    assert recep_conf.status_code == 200
    assert recep_conf.json()["data"]["status"] == "CONFIRMED"
