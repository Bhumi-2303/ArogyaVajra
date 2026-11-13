"""Integration tests for doctor availability CRUD and time slot generation."""

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
            first_name="Avail",
            last_name="Doctor",
            specialization="Pediatrics",
            consultation_fee=500,
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        return doc.id


@pytest.mark.integration
def test_doctor_availability_lifecycle_and_slots():
    """Verify availability creation, listing, slot calculation, booking impact,
    and deletion.
    """
    doc1_user_id, _, doc1_token = create_user_with_role(UserRole.DOCTOR)
    doc1_id = create_doctor(doc1_user_id)

    doc2_user_id, _, doc2_token = create_user_with_role(UserRole.DOCTOR)
    create_doctor(doc2_user_id)

    patient_user_id, _, patient_token = create_user_with_role(UserRole.PATIENT)
    with SessionLocal() as db:
        patient = db.scalar(
            select(PatientProfile).where(PatientProfile.user_id == patient_user_id)
        )
        patient_id = patient.id

    # Pick a date 4 days in the future
    target_dt = datetime.now(UTC) + timedelta(days=4)
    target_date = target_dt.date()
    # Python weekday(): Monday is 0 and Sunday is 6.
    # Our DB model day_of_week: 0=Sunday or 1=Monday?
    # In doctor service: day_of_week is typically matched via date.weekday() or
    # (date.weekday() + 1) % 7
    # Let's add availability for all 7 days to test robustly
    created_slot_ids = []
    for dow in range(7):
        create_res = client.post(
            f"/api/v1/doctors/{doc1_id}/availability",
            headers=auth_headers(doc1_token),
            json={
                "day_of_week": dow,
                "start_time": "14:00:00",
                "end_time": "16:00:00",
                "slot_duration_minutes": 30,
            },
        )
        assert create_res.status_code == 201
        created_slot_ids.append(create_res.json()["data"]["id"])

    # 1. Doctor lists availability
    list_res = client.get(
        f"/api/v1/doctors/{doc1_id}/availability",
        headers=auth_headers(doc1_token),
    )
    assert list_res.status_code == 200
    assert len(list_res.json()["data"]) >= 7

    # 2. Unauthorized update: Doctor 2 cannot update Doctor 1's availability (403)
    unauth_upd = client.put(
        f"/api/v1/doctors/{doc1_id}/availability/{created_slot_ids[0]}",
        headers=auth_headers(doc2_token),
        json={"slot_duration_minutes": 45},
    )
    assert unauth_upd.status_code == 403

    # 3. Authorized update by Doctor 1
    auth_upd = client.put(
        f"/api/v1/doctors/{doc1_id}/availability/{created_slot_ids[0]}",
        headers=auth_headers(doc1_token),
        json={"is_active": True},
    )
    assert auth_upd.status_code == 200

    # 4. Generate available slots for target date
    slots_res = client.get(
        f"/api/v1/doctors/{doc1_id}/slots?date={target_date.isoformat()}",
        headers=auth_headers(patient_token),
    )
    assert slots_res.status_code == 200
    slots = slots_res.json()["slots"]
    assert len(slots) > 0
    # Initial state: all slots available
    first_slot = slots[0]
    assert first_slot["is_available"] is True

    # 5. Book appointment in the first slot
    book_res = client.post(
        "/api/v1/appointments",
        headers=auth_headers(patient_token),
        json={
            "patient_id": str(patient_id),
            "doctor_id": str(doc1_id),
            "appointment_date": target_date.isoformat(),
            "start_time": first_slot["start_time"],
            "end_time": first_slot["end_time"],
            "reason": "Consultation for test slot",
        },
    )
    assert book_res.status_code == 201

    # 6. Refetch slots: the booked slot must now show is_available=False
    slots_res2 = client.get(
        f"/api/v1/doctors/{doc1_id}/slots?date={target_date.isoformat()}",
        headers=auth_headers(patient_token),
    )
    assert slots_res2.status_code == 200
    slots2 = slots_res2.json()["slots"]
    matched_slot = next(
        s for s in slots2 if s["start_time"] == first_slot["start_time"]
    )
    assert matched_slot["is_available"] is False

    # 7. Delete availability slot
    del_res = client.delete(
        f"/api/v1/doctors/{doc1_id}/availability/{created_slot_ids[0]}",
        headers=auth_headers(doc1_token),
    )
    assert del_res.status_code == 200
