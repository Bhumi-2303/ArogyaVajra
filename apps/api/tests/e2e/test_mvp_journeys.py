"""E2E journeys testing core MVP requirements and isolation boundaries."""

import uuid
from datetime import UTC, datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.db.transaction import transactional_session
from app.main import app
from app.models.user import User, UserRole

client = TestClient(app)

def create_authenticated_user(role: UserRole) -> tuple[str, str]:
    """Helper to create user and return (email, token)."""
    email = f"{role.value.lower()}_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"

    reg = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password},
    )
    assert reg.status_code == 201

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
        return email, login_res.json()["data"]["access_token"]

    return email, reg.json()["data"]["access_token"]


@pytest.mark.integration
def test_unauthorized_access():
    """Test that unauthorized users cannot access protected endpoints."""
    # Attempt to access patients without token
    res = client.get("/api/v1/patients")
    assert res.status_code == 401

    # Create patient (role PATIENT)
    _, patient_token = create_authenticated_user(UserRole.PATIENT)

    # Patient tries to access admin-only users management endpoint
    res = client.get("/api/v1/users", headers={"Authorization": f"Bearer {patient_token}"})
    assert res.status_code == 403


@pytest.mark.integration
def test_role_isolation():
    """Test that receptionist cannot create medical records (role isolation)."""
    _, recep_token = create_authenticated_user(UserRole.RECEPTIONIST)
    _, admin_token = create_authenticated_user(UserRole.ADMIN)

    # 0. Admin provisions doctor profile and account
    doc_email = f"doc_{uuid.uuid4().hex[:8]}@example.com"
    doc_res = client.post(
        "/api/v1/doctors",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "email": doc_email,
            "first_name": "Test",
            "last_name": "Doctor",
            "specialization": "General",
            "license_number": f"LIC-{uuid.uuid4().hex[:6].upper()}",
            "password": "SecurePassword123!",
        },
    )
    assert doc_res.status_code == 201
    doctor_id = doc_res.json()["data"]["id"]

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": doc_email, "password": "SecurePassword123!"},
    )
    assert login_res.status_code == 200
    doctor_token = login_res.json()["data"]["access_token"]

    # 1. Receptionist creates patient
    p_email = f"pat_{uuid.uuid4().hex[:8]}@example.com"
    res = client.post(
        "/api/v1/patients",
        headers={"Authorization": f"Bearer {recep_token}"},
        json={
            "email": p_email,
            "first_name": "Test",
            "last_name": "Patient",
        },
    )
    assert res.status_code == 201
    patient_id = res.json()["data"]["id"]

    # 2. Receptionist attempts to create medical record -> 403
    mr_payload = {
        "patient_id": patient_id,
        "doctor_id": doctor_id,
        "record_date": datetime.now(UTC).strftime("%Y-%m-%d"),
        "diagnosis": "Fever",
        "chief_complaint": "High temp",
    }
    mr_res = client.post(
        "/api/v1/medical-records",
        headers={"Authorization": f"Bearer {recep_token}"},
        json=mr_payload,
    )
    assert mr_res.status_code == 403

    # 3. Doctor attempts to create medical record -> 201
    mr_res_doc = client.post(
        "/api/v1/medical-records",
        headers={"Authorization": f"Bearer {doctor_token}"},
        json=mr_payload,
    )
    assert mr_res_doc.status_code == 201


@pytest.mark.integration
def test_patient_isolation():
    """Test patient isolation (patient can only see own records)."""
    p1_email, p1_token = create_authenticated_user(UserRole.PATIENT)
    p2_email, _p2_token = create_authenticated_user(UserRole.PATIENT)
    _, _doc_token = create_authenticated_user(UserRole.DOCTOR)

    # In a real flow, a patient is linked to a Patient profile.
    # We will simulate fetching medical records. 
    # Patient 1 tries to fetch Patient 2's medical records

    # First, receptionist creates patient profiles. 
    _, recep_token = create_authenticated_user(UserRole.RECEPTIONIST)

    res1 = client.post("/api/v1/patients", headers={"Authorization": f"Bearer {recep_token}"}, json={"email": p1_email, "first_name": "P1", "last_name": "One"})
    p1_id = res1.json()["data"]["id"]

    res2 = client.post("/api/v1/patients", headers={"Authorization": f"Bearer {recep_token}"}, json={"email": p2_email, "first_name": "P2", "last_name": "Two"})
    p2_id = res2.json()["data"]["id"]

    # P1 trying to view P2's records
    res = client.get(f"/api/v1/patients/{p2_id}/medical-records", headers={"Authorization": f"Bearer {p1_token}"})
    assert res.status_code == 403

    # P1 viewing own records
    res_own = client.get(f"/api/v1/patients/{p1_id}/medical-records", headers={"Authorization": f"Bearer {p1_token}"})
    assert res_own.status_code == 200


@pytest.mark.integration
def test_appointment_lifecycle_and_conflicts():
    """Test appointment conflicts, cancellation, and reschedule rules."""
    _, recep_token = create_authenticated_user(UserRole.RECEPTIONIST)
    _, admin_token = create_authenticated_user(UserRole.ADMIN)

    # 1. Create doctor
    doc_res = client.post(
        "/api/v1/doctors",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "first_name": "Dr",
            "last_name": "House",
            "specialization": "Diagnostician",
            "license_number": uuid.uuid4().hex[:10],
            "email": f"dr_{uuid.uuid4().hex[:8]}@example.com",
        },
    )
    assert doc_res.status_code == 201
    doctor_id = doc_res.json()["data"]["id"]

    # 1b. Create recurring availability for this doctor
    appt_date = (datetime.now(UTC) + timedelta(days=1)).date()
    day_of_week = appt_date.isoweekday() % 7

    avail_res = client.post(
        f"/api/v1/doctors/{doctor_id}/availability",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "day_of_week": day_of_week,
            "start_time": "08:00:00",
            "end_time": "18:00:00",
            "slot_duration_minutes": 30,
            "is_active": True,
        },
    )
    assert avail_res.status_code == 201

    # 2. Create patient
    pat_res = client.post(
        "/api/v1/patients",
        headers={"Authorization": f"Bearer {recep_token}"},
        json={
            "email": f"pat_{uuid.uuid4().hex[:8]}@example.com",
            "first_name": "Sick",
            "last_name": "Guy",
        },
    )
    patient_id = pat_res.json()["data"]["id"]

    # 3. Book appointment
    appt1_payload = {
        "patient_id": patient_id,
        "doctor_id": doctor_id,
        "appointment_date": appt_date.isoformat(),
        "start_time": "10:00:00",
        "end_time": "10:30:00",
        "reason": "Checkup",
    }

    appt1_res = client.post("/api/v1/appointments", headers={"Authorization": f"Bearer {recep_token}"}, json=appt1_payload)
    assert appt1_res.status_code == 201
    appt1_id = appt1_res.json()["data"]["id"]

    # 4. Appointment conflict (book same time for same doctor)
    appt2_payload = {
        "patient_id": patient_id,
        "doctor_id": doctor_id,
        "appointment_date": appt_date.isoformat(),
        "start_time": "10:00:00",
        "end_time": "10:30:00",
        "reason": "Conflict",
    }
    appt2_res = client.post("/api/v1/appointments", headers={"Authorization": f"Bearer {recep_token}"}, json=appt2_payload)
    assert appt2_res.status_code == 409
    assert "conflict" in appt2_res.json()["detail"].lower()

    # 5. Cancel appointment
    cancel_res = client.put(f"/api/v1/appointments/{appt1_id}", headers={"Authorization": f"Bearer {recep_token}"}, json={"status": "CANCELLED"})
    assert cancel_res.status_code == 200

    # 6. Cancelled appointment cannot be completed
    complete_res = client.put(f"/api/v1/appointments/{appt1_id}", headers={"Authorization": f"Bearer {recep_token}"}, json={"status": "COMPLETED"})
    assert complete_res.status_code == 400
    assert "cancelled" in complete_res.json()["detail"].lower()

    # 7. Create another, complete it, try to reschedule
    appt3_res = client.post("/api/v1/appointments", headers={"Authorization": f"Bearer {recep_token}"}, json={
        "patient_id": patient_id,
        "doctor_id": doctor_id,
        "appointment_date": appt_date.isoformat(),
        "start_time": "11:00:00",
        "end_time": "11:30:00",
        "reason": "Another checkup",
    })
    assert appt3_res.status_code == 201
    appt3_id = appt3_res.json()["data"]["id"]

    comp_res = client.put(f"/api/v1/appointments/{appt3_id}", headers={"Authorization": f"Bearer {recep_token}"}, json={"status": "COMPLETED"})
    assert comp_res.status_code == 200

    # completed appointment cannot be directly rescheduled
    reschedule_res = client.put(f"/api/v1/appointments/{appt3_id}", headers={"Authorization": f"Bearer {recep_token}"}, json={"status": "SCHEDULED"})
    assert reschedule_res.status_code == 400
    assert "cannot reschedule a completed" in reschedule_res.json()["detail"].lower()


@pytest.mark.integration
def test_billing_calculations():
    """Test invoice total calculation and payment status recalculation."""
    _, recep_token = create_authenticated_user(UserRole.RECEPTIONIST)
    _, billing_token = create_authenticated_user(UserRole.BILLING_STAFF)

    # Create patient
    pat_res = client.post(
        "/api/v1/patients",
        headers={"Authorization": f"Bearer {recep_token}"},
        json={
            "email": f"bill_{uuid.uuid4().hex[:8]}@example.com",
            "first_name": "Bill",
            "last_name": "Payer",
        },
    )
    patient_id = pat_res.json()["data"]["id"]

    # Create Invoice
    invoice_payload = {
        "patient_id": patient_id,
        "invoice_date": datetime.now(UTC).strftime("%Y-%m-%d"),
        "status": "ISSUED",
        "items": [
            {"description": "Consultation", "quantity": 1, "unit_price": 500},
            {"description": "X-Ray", "quantity": 2, "unit_price": 250},
        ],
    }

    inv_res = client.post("/api/v1/invoices", headers={"Authorization": f"Bearer {billing_token}"}, json=invoice_payload)
    assert inv_res.status_code == 201
    invoice = inv_res.json()["data"]

    # Test invoice total calculation (1*500 + 2*250 = 1000)
    assert float(invoice["total"]) == 1000.0
    assert float(invoice["balance"]) == 1000.0
    assert float(invoice["paid_amount"]) == 0.0
    assert invoice["status"] == "ISSUED"

    invoice_id = invoice["id"]

    # Record payment (Partial)
    pay_res = client.post(
        f"/api/v1/invoices/{invoice_id}/payments",
        headers={"Authorization": f"Bearer {billing_token}"},
        json={
            "amount": 400.0,
            "payment_method": "CARD",
        },
    )
    assert pay_res.status_code == 201

    # Test payment status recalculation
    get_inv = client.get(f"/api/v1/invoices/{invoice_id}", headers={"Authorization": f"Bearer {billing_token}"})
    updated_invoice = get_inv.json()["data"]
    assert float(updated_invoice["paid_amount"]) == 400.0
    assert float(updated_invoice["balance"]) == 600.0
    assert updated_invoice["status"] == "PARTIALLY_PAID"

    # Record payment (Full)
    pay2_res = client.post(
        f"/api/v1/invoices/{invoice_id}/payments",
        headers={"Authorization": f"Bearer {billing_token}"},
        json={
            "amount": 600.0,
            "payment_method": "CASH",
        },
    )
    assert pay2_res.status_code == 201

    get_inv_final = client.get(f"/api/v1/invoices/{invoice_id}", headers={"Authorization": f"Bearer {billing_token}"})
    final_invoice = get_inv_final.json()["data"]
    assert float(final_invoice["paid_amount"]) == 1000.0
    assert float(final_invoice["balance"]) == 0.0
    assert final_invoice["status"] == "PAID"

    # Attempt overpayment
    pay3_res = client.post(
        f"/api/v1/invoices/{invoice_id}/payments",
        headers={"Authorization": f"Bearer {billing_token}"},
        json={
            "amount": 100.0,
            "payment_method": "CASH",
        },
    )
    assert pay3_res.status_code == 400
    assert (
        "already fully paid" in pay3_res.json()["detail"].lower()
        or "exceeds" in pay3_res.json()["detail"].lower()
    )
