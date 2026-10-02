"""Comprehensive integration tests for RBAC, resource ownership, and untrusted client inputs.

Verifies:
1. Unauthenticated users cannot reach protected routes (401).
2. Authenticated users resolve role and permissions correctly.
3. Backend rejects unauthorized roles (403).
4. Resource relationship authorization (patient ownership and clinical bypass).
5. Backend NEVER trusts frontend role claims in headers, query params, or body payloads.
"""

import uuid

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models.user import UserRole

client = TestClient(app)


def create_user_with_role(role: UserRole) -> tuple[str, str]:
    """Helper creating a test user and returning (email, access_token)."""
    email = f"{role.value.lower()}_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"

    reg = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "role": role.value},
    )
    assert reg.status_code == 201
    token = reg.json()["data"]["access_token"]
    return email, token


@pytest.mark.integration
def test_unauthenticated_request_rejected():
    res = client.get("/api/v1/authz/admin")
    assert res.status_code == 401
    assert (
        "missing" in res.json()["detail"].lower()
        or "credentials" in res.json()["detail"].lower()
    )


@pytest.mark.integration
def test_rbac_role_enforcement():
    _, patient_token = create_user_with_role(UserRole.PATIENT)
    _, doctor_token = create_user_with_role(UserRole.DOCTOR)
    _, receptionist_token = create_user_with_role(UserRole.RECEPTIONIST)
    _, billing_token = create_user_with_role(UserRole.BILLING_STAFF)
    _, admin_token = create_user_with_role(UserRole.ADMIN)

    # 1. Admin only endpoint (/api/v1/authz/admin)
    assert (
        client.get(
            "/api/v1/authz/admin",
            headers={"Authorization": f"Bearer {admin_token}"},
        ).status_code
        == 200
    )
    assert (
        client.get(
            "/api/v1/authz/admin",
            headers={"Authorization": f"Bearer {doctor_token}"},
        ).status_code
        == 403
    )
    assert (
        client.get(
            "/api/v1/authz/admin",
            headers={"Authorization": f"Bearer {patient_token}"},
        ).status_code
        == 403
    )

    # 2. Doctor only endpoint (/api/v1/authz/doctor)
    assert (
        client.get(
            "/api/v1/authz/doctor",
            headers={"Authorization": f"Bearer {doctor_token}"},
        ).status_code
        == 200
    )
    assert (
        client.get(
            "/api/v1/authz/doctor",
            headers={"Authorization": f"Bearer {receptionist_token}"},
        ).status_code
        == 403
    )
    assert (
        client.get(
            "/api/v1/authz/doctor",
            headers={"Authorization": f"Bearer {billing_token}"},
        ).status_code
        == 403
    )

    # 3. Clinical staff endpoint (/api/v1/authz/clinical-staff: Doctor, Receptionist, Admin)
    assert (
        client.get(
            "/api/v1/authz/clinical-staff",
            headers={"Authorization": f"Bearer {doctor_token}"},
        ).status_code
        == 200
    )
    assert (
        client.get(
            "/api/v1/authz/clinical-staff",
            headers={"Authorization": f"Bearer {receptionist_token}"},
        ).status_code
        == 200
    )
    assert (
        client.get(
            "/api/v1/authz/clinical-staff",
            headers={"Authorization": f"Bearer {admin_token}"},
        ).status_code
        == 200
    )
    assert (
        client.get(
            "/api/v1/authz/clinical-staff",
            headers={"Authorization": f"Bearer {patient_token}"},
        ).status_code
        == 403
    )
    assert (
        client.get(
            "/api/v1/authz/clinical-staff",
            headers={"Authorization": f"Bearer {billing_token}"},
        ).status_code
        == 403
    )


@pytest.mark.integration
def test_permission_based_authorization():
    _, billing_token = create_user_with_role(UserRole.BILLING_STAFF)
    _, admin_token = create_user_with_role(UserRole.ADMIN)
    _, doctor_token = create_user_with_role(UserRole.DOCTOR)
    _, patient_token = create_user_with_role(UserRole.PATIENT)

    # INVOICES_WRITE granted to BILLING_STAFF and ADMIN
    assert (
        client.get(
            "/api/v1/authz/invoices-write",
            headers={"Authorization": f"Bearer {billing_token}"},
        ).status_code
        == 200
    )
    assert (
        client.get(
            "/api/v1/authz/invoices-write",
            headers={"Authorization": f"Bearer {admin_token}"},
        ).status_code
        == 200
    )

    # INVOICES_WRITE rejected for DOCTOR and PATIENT
    assert (
        client.get(
            "/api/v1/authz/invoices-write",
            headers={"Authorization": f"Bearer {doctor_token}"},
        ).status_code
        == 403
    )
    assert (
        client.get(
            "/api/v1/authz/invoices-write",
            headers={"Authorization": f"Bearer {patient_token}"},
        ).status_code
        == 403
    )


@pytest.mark.integration
def test_user_permissions_endpoint_resolution():
    _, doctor_token = create_user_with_role(UserRole.DOCTOR)
    res = client.get(
        "/api/v1/authz/permissions",
        headers={"Authorization": f"Bearer {doctor_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "DOCTOR"
    assert "records:write" in data["permissions"]
    assert "invoices:write" not in data["permissions"]


@pytest.mark.integration
def test_resource_ownership_and_clinical_relationship():
    _, patient_a_token = create_user_with_role(UserRole.PATIENT)
    _, patient_b_token = create_user_with_role(UserRole.PATIENT)
    _, doctor_token = create_user_with_role(UserRole.DOCTOR)

    me_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {patient_a_token}"},
    )
    patient_a_id = me_res.json()["data"]["id"]

    # 1. Patient A accessing own record -> 200
    res_a_self = client.get(
        f"/api/v1/authz/patient-record/{patient_a_id}",
        headers={"Authorization": f"Bearer {patient_a_token}"},
    )
    assert res_a_self.status_code == 200

    # 2. Patient B accessing Patient A's record -> 403 Forbidden
    res_b_a = client.get(
        f"/api/v1/authz/patient-record/{patient_a_id}",
        headers={"Authorization": f"Bearer {patient_b_token}"},
    )
    assert res_b_a.status_code == 403

    # 3. Doctor accessing Patient A's record -> 200 OK (clinical relationship)
    res_doc_a = client.get(
        f"/api/v1/authz/patient-record/{patient_a_id}",
        headers={"Authorization": f"Bearer {doctor_token}"},
    )
    assert res_doc_a.status_code == 200


@pytest.mark.integration
def test_backend_does_not_trust_frontend_role_claims():
    # Patient user attempts to spoof ADMIN role
    _, patient_token = create_user_with_role(UserRole.PATIENT)

    spoof_res = client.post(
        "/api/v1/authz/untrusted-client-role?role=ADMIN",
        headers={
            "Authorization": f"Bearer {patient_token}",
            "X-User-Role": "ADMIN",
        },
        json={"role": "ADMIN", "permissions": ["all"]},
    )
    # Backend must completely ignore spoofed query, header, and body, rejecting with 403
    assert spoof_res.status_code == 403
    assert "Operation not permitted" in spoof_res.json()["detail"]

    # Also verify that a user cannot elevate their role through profile update
    update_res = client.put(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {patient_token}"},
        json={"role": "ADMIN"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["data"]["role"] == "PATIENT"

    me_check = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert me_check.json()["data"]["role"] == "PATIENT"
