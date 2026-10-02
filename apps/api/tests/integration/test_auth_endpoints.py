"""Integration tests for authentication API endpoints with real database session."""

import uuid

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


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
