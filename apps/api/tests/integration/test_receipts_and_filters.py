"""Integration tests for payment receipts and list search/filters."""

import uuid
from datetime import UTC, date, datetime
from decimal import Decimal

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


def create_user(role: UserRole) -> tuple[uuid.UUID, str, str]:
    """Helper creating a test user with assigned role, returning (user_id, email, token)."""
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
def test_payment_receipt_generation_and_authorization():
    """Verify receipt generation for payments with role-based access control."""
    # 1. Create admin and two separate patients
    _, _, admin_token = create_user(UserRole.ADMIN)
    p1_user_id, _, p1_token = create_user(UserRole.PATIENT)
    _, _, p2_token = create_user(UserRole.PATIENT)

    # Get patient 1 profile ID
    with SessionLocal() as db:
        p1_profile = db.scalar(
            select(PatientProfile).where(PatientProfile.user_id == p1_user_id)
        )
        assert p1_profile is not None
        p1_id = p1_profile.id

    # 3. Create invoice for patient 1
    inv_res = client.post(
        "/api/v1/invoices",
        headers=auth_headers(admin_token),
        json={
            "patient_id": str(p1_id),
            "invoice_date": datetime.now(UTC).date().isoformat(),
            "items": [
                {"description": "Consultation", "quantity": 1, "unit_price": 500},
                {"description": "Lab Panel", "quantity": 1, "unit_price": 250},
            ],
            "discount": 50,
            "tax": 20,
        },
    )
    assert inv_res.status_code == 201
    inv = inv_res.json()["data"]
    inv_id = inv["id"]

    # 4. Issue invoice
    issue_res = client.post(
        f"/api/v1/invoices/{inv_id}/issue",
        headers=auth_headers(admin_token),
    )
    assert issue_res.status_code == 200

    # 5. Record partial payment
    pay_res = client.post(
        f"/api/v1/invoices/{inv_id}/payments",
        headers=auth_headers(admin_token),
        json={"amount": 400, "payment_method": "CASH", "reference": "REC-CASH-001"},
    )
    assert pay_res.status_code == 201
    payment_id = pay_res.json()["id"]

    # 6. Admin fetches receipt -> 200
    receipt_res = client.get(
        f"/api/v1/invoices/{inv_id}/payments/{payment_id}/receipt",
        headers=auth_headers(admin_token),
    )
    assert receipt_res.status_code == 200
    receipt = receipt_res.json()["data"]
    assert receipt["payment_id"] == payment_id
    assert receipt["invoice_id"] == inv_id
    assert Decimal(receipt["amount_paid"]) == Decimal(400)
    assert Decimal(receipt["invoice_balance"]) == Decimal(320)
    assert receipt["receipt_number"].startswith(f"REC-{inv['invoice_number']}")

    # 7. Owner patient fetches receipt -> 200
    p1_receipt = client.get(
        f"/api/v1/invoices/{inv_id}/payments/{payment_id}/receipt",
        headers=auth_headers(p1_token),
    )
    assert p1_receipt.status_code == 200

    # 8. Unrelated patient 2 attempts to fetch receipt -> 403 Forbidden
    p2_receipt = client.get(
        f"/api/v1/invoices/{inv_id}/payments/{payment_id}/receipt",
        headers=auth_headers(p2_token),
    )
    assert p2_receipt.status_code == 403

    # 9. Nonexistent payment -> 404
    fake_pid = str(uuid.uuid4())
    fake_receipt = client.get(
        f"/api/v1/invoices/{inv_id}/payments/{fake_pid}/receipt",
        headers=auth_headers(admin_token),
    )
    assert fake_receipt.status_code == 404


@pytest.mark.integration
def test_search_and_filtering_across_entities():
    """Verify q, status, and date range filters on medical records, prescriptions, and invoices."""
    _, _, admin_token = create_user(UserRole.ADMIN)
    doc_user_id, _, doc_token = create_user(UserRole.DOCTOR)
    p_user_id, _, p_token = create_user(UserRole.PATIENT)

    with SessionLocal() as db:
        p_profile = db.scalar(
            select(PatientProfile).where(PatientProfile.user_id == p_user_id)
        )
        assert p_profile is not None
        patient_id = p_profile.id

        doc_profile = DoctorProfile(
            user_id=doc_user_id,
            doctor_code=f"DOC-{uuid.uuid4().hex[:6].upper()}",
            first_name="Doctor",
            last_name="Search",
            specialization="General Medicine",
            consultation_fee=Decimal(500),
        )
        db.add(doc_profile)
        db.commit()
        doctor_id = doc_profile.id

    # Create medical records with distinct keywords and dates
    d1 = date(2026, 5, 1)
    d2 = date(2026, 6, 1)

    r1 = client.post(
        "/api/v1/medical-records",
        headers=auth_headers(doc_token),
        json={
            "patient_id": str(patient_id),
            "doctor_id": str(doctor_id),
            "record_date": d1.isoformat(),
            "chief_complaint": "Acute bronchitis and fever",
            "diagnosis": "Bronchitis",
        },
    )
    assert r1.status_code == 201

    r2 = client.post(
        "/api/v1/medical-records",
        headers=auth_headers(doc_token),
        json={
            "patient_id": str(patient_id),
            "doctor_id": str(doctor_id),
            "record_date": d2.isoformat(),
            "chief_complaint": "Hypertension routine check",
            "diagnosis": "Essential Hypertension",
        },
    )
    assert r2.status_code == 201

    # Test medical record q filter
    q_search = client.get(
        "/api/v1/medical-records?q=bronchitis",
        headers=auth_headers(admin_token),
    )
    assert q_search.status_code == 200
    assert any(
        "bronchitis" in r["chief_complaint"].lower() for r in q_search.json()["data"]
    )

    # Test medical record date range filter
    date_filter = client.get(
        "/api/v1/medical-records?start_date=2026-05-15&end_date=2026-06-15",
        headers=auth_headers(admin_token),
    )
    assert date_filter.status_code == 200
    assert all(r["record_date"] >= "2026-05-15" for r in date_filter.json()["data"])

    # Create prescription
    presc_res = client.post(
        "/api/v1/prescriptions",
        headers=auth_headers(doc_token),
        json={
            "patient_id": str(patient_id),
            "doctor_id": str(doctor_id),
            "prescription_date": d1.isoformat(),
            "instructions": "Take after meals",
            "items": [
                {
                    "medicine_name": "Amoxicillin 500mg",
                    "dosage": "500mg",
                    "frequency": "TID",
                    "duration": "7 days",
                }
            ],
        },
    )
    assert presc_res.status_code == 201

    # Test prescription q search
    presc_q = client.get(
        "/api/v1/prescriptions?q=Amoxicillin",
        headers=auth_headers(admin_token),
    )
    assert presc_q.status_code == 200
    assert any(
        any("amoxicillin" in it["medicine_name"].lower() for it in p["items"])
        for p in presc_q.json()["data"]
    )

    # Test prescription status filter
    presc_status = client.get(
        "/api/v1/prescriptions?status=ACTIVE",
        headers=auth_headers(admin_token),
    )
    assert presc_status.status_code == 200
    assert all(p["status"] == "ACTIVE" for p in presc_status.json()["data"])

    # Test invoice list q and status filter
    inv_res = client.post(
        "/api/v1/invoices",
        headers=auth_headers(admin_token),
        json={
            "patient_id": str(patient_id),
            "invoice_date": d1.isoformat(),
            "items": [
                {
                    "description": "Specialized Cardiac Consultation",
                    "quantity": 1,
                    "unit_price": 750,
                }
            ],
        },
    )
    assert inv_res.status_code == 201
    inv_num = inv_res.json()["data"]["invoice_number"]

    # Search by invoice number
    inv_search = client.get(
        f"/api/v1/invoices?q={inv_num}",
        headers=auth_headers(admin_token),
    )
    assert inv_search.status_code == 200
    assert any(i["invoice_number"] == inv_num for i in inv_search.json()["data"])

    # Search by item description
    item_search = client.get(
        "/api/v1/invoices?q=Cardiac",
        headers=auth_headers(admin_token),
    )
    assert item_search.status_code == 200
    assert any(
        any("cardiac" in it["description"].lower() for it in i["items"])
        for i in item_search.json()["data"]
    )

    # Scoped access: patient should only see invoices for their own patient_id
    pat_invoices = client.get(
        "/api/v1/invoices",
        headers=auth_headers(p_token),
    )
    assert pat_invoices.status_code == 200
    assert all(i["patient_id"] == str(patient_id) for i in pat_invoices.json()["data"])
