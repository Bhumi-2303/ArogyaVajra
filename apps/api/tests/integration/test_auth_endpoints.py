"""Integration tests for authentication API endpoints with real database session."""

import uuid
from datetime import UTC, datetime

import pytest
from fastapi import Depends
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.api.deps import require_roles
from app.db.transaction import transactional_session
from app.main import app
from app.models.patient import PatientProfile
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
    assert "refresh_token" not in reg_data["data"]
    assert "refresh_token" in reg_response.cookies
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
    assert "refresh_token" not in login_data["data"]
    assert "refresh_token" in login_response.cookies
    access_token = login_data["data"]["access_token"]

    # 4. Get Current User profile (/me)
    headers = {"Authorization": f"Bearer {access_token}"}
    me_response = client.get("/api/v1/auth/me", headers=headers)
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["data"]["email"] == unique_email
    assert me_data["data"]["role"] == "PATIENT"

    # 5. Token Refresh (/refresh) using httpOnly cookie
    refresh_response = client.post("/api/v1/auth/refresh")
    assert refresh_response.status_code == 200
    new_tokens = refresh_response.json()
    assert "access_token" in new_tokens["data"]
    assert "refresh_token" not in new_tokens["data"]
    assert "refresh_token" in refresh_response.cookies

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
        json={"email": doctor_email, "password": "Password123!"},
    )
    assert reg_doctor.status_code == 201

    with transactional_session() as session:
        user = session.scalar(select(User).where(User.email == doctor_email))
        assert user is not None
        user.role = UserRole.DOCTOR

    login_doctor = client.post(
        "/api/v1/auth/login",
        json={"email": doctor_email, "password": "Password123!"},
    )
    doctor_token = login_doctor.json()["data"]["access_token"]

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


@pytest.mark.integration
def test_register_with_profile_and_age():
    """Verify that registering with full_name, age, and requested_role provisions PatientProfile."""
    unique_email = f"patient_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"
    full_name = "Arjun Varma"
    age = 35

    reg_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "password": password,
            "full_name": full_name,
            "age": age,
            "requested_role": "DOCTOR",  # Public registration should NOT grant DOCTOR
        },
    )
    assert reg_response.status_code == 201
    data = reg_response.json()
    assert data["data"]["user"]["role"] == "PATIENT"
    user_id = uuid.UUID(data["data"]["user"]["id"])

    # Verify PatientProfile was created in the database atomically
    with transactional_session() as session:
        profile = session.scalar(
            select(PatientProfile).where(PatientProfile.user_id == user_id)
        )
        assert profile is not None
        assert profile.first_name == "Arjun"
        assert profile.last_name == "Varma"
        assert profile.patient_code.startswith("PAT-")
        assert profile.date_of_birth is not None
        assert profile.date_of_birth.year == datetime.now(UTC).date().year - age


@pytest.mark.integration
def test_register_age_validation():
    """Verify invalid age values are rejected with 422 Unprocessable Entity."""
    unique_email = f"patient_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"

    # Age 0
    res_zero = client.post(
        "/api/v1/auth/register",
        json={"email": unique_email, "password": password, "age": 0},
    )
    assert res_zero.status_code == 422

    # Negative age
    res_neg = client.post(
        "/api/v1/auth/register",
        json={"email": unique_email, "password": password, "age": -5},
    )
    assert res_neg.status_code == 422

    # Excessive age (>125)
    res_high = client.post(
        "/api/v1/auth/register",
        json={"email": unique_email, "password": password, "age": 150},
    )
    assert res_high.status_code == 422


@pytest.mark.integration
def test_no_refresh_token_in_body_browser_vs_non_browser():
    """Verify that browser clients never receive refresh_token in response body,

    while non-browser clients opting in receive the token in the body.
    """
    email_browser = f"browser_{uuid.uuid4().hex[:8]}@example.com"
    email_non_browser = f"nonbrowser_{uuid.uuid4().hex[:8]}@example.com"
    pwd = "SecurePassword123!"

    # 1. BROWSER CLIENT (Default):
    # Register: body has no refresh_token; cookie is set
    reg_b = client.post(
        "/api/v1/auth/register",
        json={"email": email_browser, "password": pwd, "role": "PATIENT"},
    )
    assert reg_b.status_code == 201
    assert "refresh_token" not in reg_b.json()["data"]
    assert "refresh_token" in reg_b.cookies

    # Login: body has no refresh_token; cookie is set
    login_b = client.post(
        "/api/v1/auth/login",
        json={"email": email_browser, "password": pwd},
    )
    assert login_b.status_code == 200
    assert "refresh_token" not in login_b.json()["data"]
    assert "refresh_token" in login_b.cookies
    cookie_val = login_b.cookies["refresh_token"]

    # Browser client without cookie sending body refresh token -> 401
    isolated_client = TestClient(app)
    unauth_b = isolated_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": cookie_val},
    )
    assert unauth_b.status_code == 401
    assert "Invalid or expired" in unauth_b.json()["detail"]

    # Browser client with cookie -> 200, body has NO refresh_token, cookie is rotated
    cookie_client = TestClient(app, cookies={"refresh_token": cookie_val})
    ref_b = cookie_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": "spoofed_ignored_body_token"},
    )
    assert ref_b.status_code == 200
    assert "refresh_token" not in ref_b.json()["data"]
    assert "access_token" in ref_b.json()["data"]
    assert "refresh_token" in ref_b.cookies

    # 2. NON-BROWSER CLIENT (Explicit Opt-In via X-Client-Type: non-browser):
    nb_headers = {"X-Client-Type": "non-browser"}
    nb_client = TestClient(app)

    # Register: body HAS refresh_token
    reg_nb = nb_client.post(
        "/api/v1/auth/register",
        headers=nb_headers,
        json={"email": email_non_browser, "password": pwd, "role": "PATIENT"},
    )
    assert reg_nb.status_code == 201
    assert "refresh_token" in reg_nb.json()["data"]
    nb_rt = reg_nb.json()["data"]["refresh_token"]
    assert isinstance(nb_rt, str) and len(nb_rt) > 20

    # Login: body HAS refresh_token
    login_nb = nb_client.post(
        "/api/v1/auth/login",
        headers=nb_headers,
        json={"email": email_non_browser, "password": pwd},
    )
    assert login_nb.status_code == 200
    assert "refresh_token" in login_nb.json()["data"]
    nb_login_rt = login_nb.json()["data"]["refresh_token"]

    # Refresh via body payload without cookie -> 200, body HAS refresh_token
    isolated_nb = TestClient(app)
    ref_nb = isolated_nb.post(
        "/api/v1/auth/refresh",
        headers=nb_headers,
        json={"refresh_token": nb_login_rt},
    )
    assert ref_nb.status_code == 200
    assert "refresh_token" in ref_nb.json()["data"]
    assert "access_token" in ref_nb.json()["data"]
