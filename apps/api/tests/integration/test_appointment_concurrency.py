"""Integration tests for appointment concurrency and PostgreSQL exclusion constraint.

Verifies:
1. Two simultaneous booking requests for the exact same doctor and slot result in
   exactly one 201 Created and one 409 Conflict.
2. The 409 Conflict adheres strictly to the APPOINTMENT_CONFLICT error contract.
3. The PostgreSQL exclusion constraint (exclude_overlapping_appointments) serves as
   the authoritative source of truth against race conditions.
4. Rescheduling into an overlapping slot is prevented and returns APPOINTMENT_CONFLICT.
"""

import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime, time, timedelta
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.db.session import get_sessionmaker
from app.db.transaction import transactional_session
from app.main import app
from app.models.appointment import Appointment, AppointmentStatus
from app.models.user import User, UserRole

client = TestClient(app)


def create_authenticated_user(role: UserRole) -> tuple[str, str, str]:
    """Helper to create user and return (user_id, email, token)."""
    email = f"{role.value.lower()}_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"

    reg = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password},
    )
    assert reg.status_code == 201
    user_id = reg.json()["data"]["user"]["id"]
    token = reg.json()["data"]["access_token"]

    if role != UserRole.PATIENT:
        with transactional_session() as session:
            user = session.scalar(select(User).where(User.email == email))
            assert user is not None
            user.role = role

        login_res = client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": password},
        )
        assert login_res.status_code == 200
        token = login_res.json()["data"]["access_token"]

    return user_id, email, token


def create_test_doctor(admin_token: str) -> tuple[str, str]:
    """Helper to create a doctor and set up availability for all days."""
    suffix = uuid.uuid4().hex[:6]
    doc_email = f"doc_{suffix}@example.com"
    res = client.post(
        "/api/v1/doctors",
        json={
            "email": doc_email,
            "first_name": "Arjun",
            "last_name": f"Verma_{suffix}",
            "specialization": "Cardiology",
            "qualification": "MBBS, MD",
            "license_number": f"MED-{suffix.upper()}",
            "consultation_fee": "750.00",
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res.status_code == 201
    doctor_id = res.json()["data"]["id"]

    # Log in as the doctor to add availability slots (0 = Sunday through 6 = Saturday)
    _, _, doc_token = create_authenticated_user(UserRole.DOCTOR)
    # Give doctor user profile ownership
    with transactional_session() as session:
        user = session.scalar(select(User).where(User.email == doc_email))
        assert user is not None
        user.role = UserRole.DOCTOR

    doc_login = client.post(
        "/api/v1/auth/login",
        json={"email": doc_email, "password": "SecurePassword123!"},
    )
    if doc_login.status_code == 200:
        doc_token = doc_login.json()["data"]["access_token"]

    # Configure availability for all days of the week 0..6
    for day in range(7):
        client.post(
            f"/api/v1/doctors/{doctor_id}/availability",
            json={
                "day_of_week": day,
                "start_time": "08:00:00",
                "end_time": "18:00:00",
                "slot_duration_minutes": 30,
                "is_active": True,
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )

    return doctor_id, doc_token


@pytest.mark.integration
def test_simultaneous_bookings_exactly_one_succeeds_and_one_conflicts():
    """Fire two simultaneous booking requests for the same slot; assert exactly one 201 and one 409."""
    _, _, admin_token = create_authenticated_user(UserRole.ADMIN)
    doctor_id, _ = create_test_doctor(admin_token)

    # Create two distinct patient users
    _, _, patient_a_token = create_authenticated_user(UserRole.PATIENT)
    _, _, patient_b_token = create_authenticated_user(UserRole.PATIENT)

    # Target a future date and time slot
    future_date = (datetime.now(UTC) + timedelta(days=5)).date()
    target_slot = {
        "doctor_id": doctor_id,
        "appointment_date": str(future_date),
        "start_time": "10:00:00",
        "end_time": "10:30:00",
        "reason": "Consultation",
    }

    # Execute concurrent requests using ThreadPoolExecutor
    def book_slot(token: str):
        # Use fresh TestClient per thread to ensure distinct transport connections
        thread_client = TestClient(app)
        return thread_client.post(
            "/api/v1/appointments",
            json=target_slot,
            headers={"Authorization": f"Bearer {token}"},
        )

    with ThreadPoolExecutor(max_workers=2) as executor:
        future_a = executor.submit(book_slot, patient_a_token)
        future_b = executor.submit(book_slot, patient_b_token)
        res_a = future_a.result()
        res_b = future_b.result()

    statuses = [res_a.status_code, res_b.status_code]
    assert sorted(statuses) == [201, 409], (
        f"Expected one 201 and one 409, got {statuses}"
    )

    # Verify the 409 response contract
    conflict_res = res_a if res_a.status_code == 409 else res_b
    conflict_body = conflict_res.json()
    assert conflict_body["error"]["code"] == "APPOINTMENT_CONFLICT"
    assert (
        "no longer available" in conflict_body["error"]["message"]
        or "conflicts" in conflict_body["error"]["message"]
    )

    # Verify the 201 response data
    success_res = res_a if res_a.status_code == 201 else res_b
    success_body = success_res.json()
    assert success_body["data"]["status"] == "SCHEDULED"
    assert success_body["data"]["doctor_id"] == doctor_id


@pytest.mark.integration
def test_db_exclusion_constraint_blocks_direct_overlapping_inserts():
    """Verify that PostgreSQL directly raises IntegrityError on overlapping appointments."""
    factory = get_sessionmaker()
    doctor_uuid = uuid.uuid4()
    patient1_uuid = uuid.uuid4()
    patient2_uuid = uuid.uuid4()
    creator_uuid = uuid.uuid4()

    with factory() as db:
        # Create distinct users for doctor and patients
        creator = User(
            id=creator_uuid,
            email=f"creator_{uuid.uuid4().hex[:6]}@example.com",
            password_hash="hash",
            role=UserRole.ADMIN,
            is_active=True,
        )
        user_doc = User(
            id=uuid.uuid4(),
            email=f"doc_{uuid.uuid4().hex[:6]}@example.com",
            password_hash="hash",
            role=UserRole.DOCTOR,
            is_active=True,
        )
        user_pat1 = User(
            id=uuid.uuid4(),
            email=f"pat1_{uuid.uuid4().hex[:6]}@example.com",
            password_hash="hash",
            role=UserRole.PATIENT,
            is_active=True,
        )
        user_pat2 = User(
            id=uuid.uuid4(),
            email=f"pat2_{uuid.uuid4().hex[:6]}@example.com",
            password_hash="hash",
            role=UserRole.PATIENT,
            is_active=True,
        )
        db.add_all([creator, user_doc, user_pat1, user_pat2])
        db.flush()

        from app.models.doctor import DoctorProfile
        from app.models.patient import PatientProfile

        doc = DoctorProfile(
            id=doctor_uuid,
            user_id=user_doc.id,
            doctor_code=f"DOC-{uuid.uuid4().hex[:4]}",
            first_name="Doc",
            last_name="Test",
            specialization="Cardiology",
            consultation_fee=Decimal(500),
        )
        pat1 = PatientProfile(
            id=patient1_uuid,
            user_id=user_pat1.id,
            patient_code=f"PAT-{uuid.uuid4().hex[:4]}",
            first_name="Pat1",
            last_name="Test",
        )
        pat2 = PatientProfile(
            id=patient2_uuid,
            user_id=user_pat2.id,
            patient_code=f"PAT-{uuid.uuid4().hex[:4]}",
            first_name="Pat2",
            last_name="Test",
        )
        db.add_all([doc, pat1, pat2])
        db.flush()

        apt_date = (datetime.now(UTC) + timedelta(days=10)).date()

        # First appointment
        apt1 = Appointment(
            id=uuid.uuid4(),
            appointment_code=f"APT-{uuid.uuid4().hex[:6]}",
            patient_id=pat1.id,
            doctor_id=doc.id,
            appointment_date=apt_date,
            start_time=time(14, 0),
            end_time=time(14, 30),
            status=AppointmentStatus.SCHEDULED,
            created_by=creator.id,
        )
        db.add(apt1)
        db.commit()

        # Second appointment overlapping by 15 minutes (14:15 - 14:45)
        apt2 = Appointment(
            id=uuid.uuid4(),
            appointment_code=f"APT-{uuid.uuid4().hex[:6]}",
            patient_id=pat2.id,
            doctor_id=doc.id,
            appointment_date=apt_date,
            start_time=time(14, 15),
            end_time=time(14, 45),
            status=AppointmentStatus.SCHEDULED,
            created_by=creator.id,
        )
        db.add(apt2)
        with pytest.raises(IntegrityError) as exc_info:
            db.commit()

        assert "exclude_overlapping_appointments" in str(exc_info.value)
        db.rollback()


@pytest.mark.integration
def test_reschedule_conflict_rejected_with_appointment_conflict_error():
    """Verify that rescheduling via PUT into an occupied slot returns 409 APPOINTMENT_CONFLICT."""
    _, _, admin_token = create_authenticated_user(UserRole.ADMIN)
    doctor_id, _ = create_test_doctor(admin_token)

    _, _, patient_a_token = create_authenticated_user(UserRole.PATIENT)
    _, _, patient_b_token = create_authenticated_user(UserRole.PATIENT)

    future_date = (datetime.now(UTC) + timedelta(days=6)).date()

    # Slot 1: 11:00 - 11:30 (Booked by Patient A)
    res_a = client.post(
        "/api/v1/appointments",
        json={
            "doctor_id": doctor_id,
            "appointment_date": str(future_date),
            "start_time": "11:00:00",
            "end_time": "11:30:00",
            "reason": "Consultation A",
        },
        headers={"Authorization": f"Bearer {patient_a_token}"},
    )
    assert res_a.status_code == 201

    # Slot 2: 11:30 - 12:00 (Booked by Patient B)
    res_b = client.post(
        "/api/v1/appointments",
        json={
            "doctor_id": doctor_id,
            "appointment_date": str(future_date),
            "start_time": "11:30:00",
            "end_time": "12:00:00",
            "reason": "Consultation B",
        },
        headers={"Authorization": f"Bearer {patient_b_token}"},
    )
    assert res_b.status_code == 201
    apt_b_id = res_b.json()["data"]["id"]

    # Receptionist attempts to reschedule Appointment B to Slot 1 (11:00 - 11:30)
    _, _, receptionist_token = create_authenticated_user(UserRole.RECEPTIONIST)
    reschedule_res = client.put(
        f"/api/v1/appointments/{apt_b_id}",
        json={
            "appointment_date": str(future_date),
            "start_time": "11:00:00",
            "end_time": "11:30:00",
        },
        headers={"Authorization": f"Bearer {receptionist_token}"},
    )

    assert reschedule_res.status_code == 409
    body = reschedule_res.json()
    assert body["error"]["code"] == "APPOINTMENT_CONFLICT"
