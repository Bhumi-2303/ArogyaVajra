"""Integration tests for invoice status transitions, partial/full payments, overpayment, and cancel rules."""

import uuid
from datetime import UTC, datetime
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.db.session import SessionLocal
from app.main import app
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


@pytest.mark.integration
def test_invoice_issue_payment_overpayment_and_immutability():
    """Verify invoice issuance, partial payment, overpayment rejection, full payment, and cancel rules."""
    create_user_with_role(UserRole.ADMIN)
    _, _, billing_token = create_user_with_role(UserRole.BILLING_STAFF)
    patient_user_id, _, patient_token = create_user_with_role(UserRole.PATIENT)

    with SessionLocal() as db:
        patient = db.scalar(
            select(PatientProfile).where(PatientProfile.user_id == patient_user_id)
        )
        patient_id = patient.id

    today_str = datetime.now(UTC).date().isoformat()

    # 1. Billing creates draft invoice: Subtotal 1000, Discount 100, Tax 50 = Total 950
    inv_res = client.post(
        "/api/v1/invoices",
        headers=auth_headers(billing_token),
        json={
            "patient_id": str(patient_id),
            "invoice_date": today_str,
            "items": [
                {
                    "description": "General Surgery Consultation",
                    "quantity": 1,
                    "unit_price": 600,
                },
                {"description": "Dressing and Kit", "quantity": 2, "unit_price": 200},
            ],
            "discount": 100,
            "tax": 50,
        },
    )
    assert inv_res.status_code == 201
    inv = inv_res.json()["data"]
    inv_id = inv["id"]
    assert inv["status"] == "DRAFT"
    assert Decimal(str(inv["total"])) == Decimal("950.00")
    assert Decimal(str(inv["balance"])) == Decimal("950.00")

    # 2. Issue invoice (DRAFT -> ISSUED)
    issue_res = client.post(
        f"/api/v1/invoices/{inv_id}/issue",
        headers=auth_headers(billing_token),
    )
    assert issue_res.status_code == 200
    assert issue_res.json()["data"]["status"] == "ISSUED"

    # 3. Record partial payment of 500
    part_pay = client.post(
        f"/api/v1/invoices/{inv_id}/payments",
        headers=auth_headers(billing_token),
        json={
            "amount": 500,
            "payment_method": "UPI",
            "reference": "UPI-PART-001",
        },
    )
    assert part_pay.status_code == 201

    # Check updated invoice status and balance
    inv_get = client.get(
        f"/api/v1/invoices/{inv_id}",
        headers=auth_headers(patient_token),
    )
    assert inv_get.status_code == 200
    inv_data = inv_get.json()["data"]
    assert inv_data["status"] == "PARTIALLY_PAID"
    assert Decimal(str(inv_data["paid_amount"])) == Decimal("500.00")
    assert Decimal(str(inv_data["balance"])) == Decimal("450.00")

    # 4. Overpayment rejection: Attempt to pay 500 when remaining balance is only 450
    overpay_res = client.post(
        f"/api/v1/invoices/{inv_id}/payments",
        headers=auth_headers(billing_token),
        json={
            "amount": 500,
            "payment_method": "CASH",
        },
    )
    assert overpay_res.status_code == 400
    assert "exceeds remaining balance" in overpay_res.json()["detail"]

    # 5. Cancel rules: Cannot cancel invoice when payments are already recorded
    cancel_fail = client.post(
        f"/api/v1/invoices/{inv_id}/cancel",
        headers=auth_headers(billing_token),
    )
    assert cancel_fail.status_code == 400
    assert (
        "Cannot cancel an invoice with recorded payments"
        in cancel_fail.json()["detail"]
    )

    # 6. Complete remaining balance (450) -> Status becomes PAID
    full_pay = client.post(
        f"/api/v1/invoices/{inv_id}/payments",
        headers=auth_headers(billing_token),
        json={
            "amount": 450,
            "payment_method": "CARD",
            "reference": "CARD-TXN-002",
        },
    )
    assert full_pay.status_code == 201

    # Check fully paid state
    inv_paid = client.get(
        f"/api/v1/invoices/{inv_id}",
        headers=auth_headers(billing_token),
    )
    assert inv_paid.status_code == 200
    assert inv_paid.json()["data"]["status"] == "PAID"
    assert Decimal(str(inv_paid.json()["data"]["balance"])) == Decimal("0.00")

    # 7. Reject payment on already fully paid invoice
    post_paid_fail = client.post(
        f"/api/v1/invoices/{inv_id}/payments",
        headers=auth_headers(billing_token),
        json={
            "amount": 50,
            "payment_method": "CASH",
        },
    )
    assert post_paid_fail.status_code == 400
    assert "already fully paid" in post_paid_fail.json()["detail"]

    # 8. Create another invoice and cancel it cleanly with no payments
    inv_unpaid = client.post(
        "/api/v1/invoices",
        headers=auth_headers(billing_token),
        json={
            "patient_id": str(patient_id),
            "invoice_date": today_str,
            "items": [{"description": "Minor service", "quantity": 1, "unit_price": 100}],
        },
    )
    assert inv_unpaid.status_code == 201
    unpaid_id = inv_unpaid.json()["data"]["id"]

    cancel_ok = client.post(
        f"/api/v1/invoices/{unpaid_id}/cancel",
        headers=auth_headers(billing_token),
    )
    assert cancel_ok.status_code == 200
    assert cancel_ok.json()["data"]["status"] == "CANCELLED"
