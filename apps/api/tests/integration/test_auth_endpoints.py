"""Integration tests for authentication API endpoints with real database session."""

import uuid

import pytest
from fastapi import Depends
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.api.deps import require_roles
from app.db.transaction import transactional_session
from app.main import app
from app.models.user import User, UserRole

client = TestClient(app)


# Dummy endpoint to test role authorization dependency
@app.get("/api/v1/test-doctor-only", tags=["Testing"])
def doctor_only_route(user: User = Depends(require_roles(UserRole.DOCTOR))):
    return {"message": f"Welcome doctor {user.email}"}


@pytest.mark.integration
def test_register_and_login_lifecycle():
    unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"

    # 1. Register new patient user
    reg_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "password": password,
            "role": "PATIENT",
        },
    )
    assert reg_response.status_code == 201
    reg_data = reg_response.json()
    assert reg_data["message"] == "Registration successful."
    assert reg_data["data"]["user"]["email"] == unique_email
    assert reg_data["data"]["user"]["role"] == "PATIENT"
    assert "access_token" in reg_data["data"]
    assert "refresh_token" in reg_data["data"]
    assert "password_hash" not in reg_data["data"]["user"]

    # 2. Duplicate registration with same email should return 409 Conflict
    dup_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "password": "AnotherPassword123!",
            "role": "PATIENT",
        },
    )
    assert dup_response.status_code == 409

    # 3. Successful Login
    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": unique_email,
            "password": password,
        },
    )
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert login_data["message"] == "Login successful."
    assert login_data["data"]["user"]["email"] == unique_email
    access_token = login_data["data"]["access_token"]
    refresh_token = login_data["data"]["refresh_token"]

    # 4. Get Current User profile (/me)
    headers = {"Authorization": f"Bearer {access_token}"}
    me_response = client.get("/api/v1/auth/me", headers=headers)
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["data"]["email"] == unique_email
    assert me_data["data"]["role"] == "PATIENT"

    # 5. Token Refresh (/refresh)
    refresh_response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_response.status_code == 200
    new_tokens = refresh_response.json()
    assert "access_token" in new_tokens["data"]
    assert "refresh_token" in new_tokens["data"]

    # 6. Change Password (/change-password)
    new_password = "BrandNewStrongPassword456!"
    change_pw_res = client.put(
        "/api/v1/auth/change-password",
        headers=headers,
        json={
            "current_password": password,
            "new_password": new_password,
        },
    )
    assert change_pw_res.status_code == 200
    assert change_pw_res.json()["message"] == "Password changed successfully."

    # 7. Old password should fail login
    old_login_res = client.post(
        "/api/v1/auth/login",
        json={"email": unique_email, "password": password},
    )
    assert old_login_res.status_code == 401

    # 8. New password should succeed login
    new_login_res = client.post(
        "/api/v1/auth/login",
        json={"email": unique_email, "password": new_password},
    )
    assert new_login_res.status_code == 200

    # 9. Logout
    logout_res = client.post("/api/v1/auth/logout", headers=headers)
    assert logout_res.status_code == 200
    assert logout_res.json()["message"] == "Logout successful."


@pytest.mark.integration
def test_login_invalid_credentials():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@example.com", "password": "wrong"},
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


@pytest.mark.integration
def test_unauthorized_access_to_protected_endpoint():
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401

    response_bad_token = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid_garbage_token"},
    )
    assert response_bad_token.status_code == 401


@pytest.mark.integration
def test_registration_validation_rules():
    # Password too short (< 8 chars)
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "valid@test.com", "password": "short"},
    )
    assert response.status_code == 422

    # Invalid email format
    response_email = client.post(
        "/api/v1/auth/register",
        json={"email": "not-an-email", "password": "ValidPassword123!"},
    )
    assert response_email.status_code == 422


@pytest.mark.integration
def test_change_password_invalid_cases():
    unique_email = f"changepw_{uuid.uuid4().hex[:8]}@example.com"
    password = "InitialPassword123!"

    reg = client.post(
        "/api/v1/auth/register",
        json={"email": unique_email, "password": password},
    )
    token = reg.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Case 1: Wrong current password
    res_wrong = client.put(
        "/api/v1/auth/change-password",
        headers=headers,
        json={
            "current_password": "WrongPassword123!",
            "new_password": "NewValidPassword456!",
        },
    )
    assert res_wrong.status_code == 400
    assert "Current password is incorrect" in res_wrong.json()["detail"]

    # Case 2: Same new password as current
    res_same = client.put(
        "/api/v1/auth/change-password",
        headers=headers,
        json={"current_password": password, "new_password": password},
    )
    assert res_same.status_code == 400
    assert "different from current password" in res_same.json()["detail"]


@pytest.mark.integration
def test_role_authorization_enforcement():
    # Patient role attempting to access doctor-only endpoint
    patient_email = f"patient_{uuid.uuid4().hex[:8]}@example.com"
    reg_patient = client.post(
        "/api/v1/auth/register",
        json={"email": patient_email, "password": "Password123!", "role": "PATIENT"},
    )
    patient_token = reg_patient.json()["data"]["access_token"]

    forbidden_res = client.get(
        "/api/v1/test-doctor-only",
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert forbidden_res.status_code == 403
    assert "Operation not permitted" in forbidden_res.json()["detail"]

    # Doctor role accessing doctor-only endpoint
    doctor_email = f"doctor_{uuid.uuid4().hex[:8]}@example.com"
    reg_doctor = client.post(
        "/api/v1/auth/register",
        json={"email": doctor_email, "password": "Password123!", "role": "DOCTOR"},
    )
    doctor_token = reg_doctor.json()["data"]["access_token"]

    allowed_res = client.get(
        "/api/v1/test-doctor-only",
        headers={"Authorization": f"Bearer {doctor_token}"},
    )
    assert allowed_res.status_code == 200
    assert "Welcome doctor" in allowed_res.json()["message"]


@pytest.mark.integration
def test_inactive_user_access_rejection():
    email = f"inactive_{uuid.uuid4().hex[:8]}@example.com"
    password = "Password123!"

    reg = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password},
    )
    token = reg.json()["data"]["access_token"]

    # Manually deactivate user in database
    with transactional_session() as session:
        user = session.scalar(select(User).where(User.email == email))
        assert user is not None
        user.is_active = False

    # Login should be rejected
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_res.status_code == 401
    assert "deactivated" in login_res.json()["detail"]

    # Accessing protected endpoint should be rejected
    me_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 401
    assert "inactive" in me_res.json()["detail"]
