"""Integration tests for forgot/reset password flows and cookie-based refresh."""

import uuid
from datetime import UTC, datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.core.security import hash_token
from app.db.session import SessionLocal
from app.main import app
from app.models.audit_log import AuditLog
from app.models.password_reset import PasswordResetToken
from app.models.refresh_token import RefreshToken
from app.services.email import EmailSender, set_email_sender

client = TestClient(app)


class MockEmailSender(EmailSender):
    def __init__(self) -> None:
        self.sent_emails: list[tuple[str, str]] = []

    def send_password_reset_email(self, to_email: str, reset_url: str) -> None:
        self.sent_emails.append((to_email, reset_url))


@pytest.mark.integration
def test_forgot_password_and_reset_password_lifecycle():
    """Verify forgot password generates single-use token, emails link, and resets
    password.
    """
    mock_sender = MockEmailSender()
    set_email_sender(mock_sender)

    email = f"pwd_reset_{uuid.uuid4().hex[:8]}@example.com"
    old_password = "OldPassword123!"
    new_password = "NewPassword123!"

    # 1. Register user
    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": old_password, "role": "PATIENT"},
    )
    assert reg_res.status_code == 201
    user_id = uuid.UUID(reg_res.json()["data"]["user"]["id"])
    initial_rt = reg_res.cookies["refresh_token"]
    assert "refresh_token" not in reg_res.json()["data"]

    # 2. Forgot password for existing email
    forgot_res = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": email},
    )
    assert forgot_res.status_code == 200
    assert (
        forgot_res.json()["message"]
        == "If the email is registered, a password reset link has been sent."
    )

    # Verify mock sender received email
    assert len(mock_sender.sent_emails) == 1
    sent_to, reset_link = mock_sender.sent_emails[0]
    assert sent_to == email
    assert "/reset-password?token=" in reset_link
    raw_token = reset_link.split("token=")[1]

    # Verify audit log recorded REQUEST_PASSWORD_RESET
    with SessionLocal() as db:
        audit = db.scalar(
            select(AuditLog)
            .where(
                AuditLog.action == "REQUEST_PASSWORD_RESET",
                AuditLog.entity_id == str(user_id),
            )
            .order_by(AuditLog.created_at.desc())
        )
        assert audit is not None

        # Verify DB token hash matches
        token_record = db.scalar(
            select(PasswordResetToken)
            .where(PasswordResetToken.user_id == user_id)
            .order_by(PasswordResetToken.created_at.desc())
        )
        assert token_record is not None
        assert token_record.token_hash == hash_token(raw_token)
        assert token_record.is_used is False

    # 3. Non-enumerating test: forgot-password with non-existent email returns
    # same message
    unknown_email = f"unknown_{uuid.uuid4().hex[:8]}@example.com"
    unknown_res = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": unknown_email},
    )
    assert unknown_res.status_code == 200
    assert (
        unknown_res.json()["message"]
        == "If the email is registered, a password reset link has been sent."
    )
    # No extra email sent
    assert len(mock_sender.sent_emails) == 1

    # 4. Attempt reset password with invalid token -> 400
    bad_reset = client.post(
        "/api/v1/auth/reset-password",
        json={"token": "invalid_fake_token", "new_password": new_password},
    )
    assert bad_reset.status_code == 400
    assert "Invalid or expired" in bad_reset.json()["detail"]

    # 5. Complete password reset with valid token
    reset_res = client.post(
        "/api/v1/auth/reset-password",
        json={"token": raw_token, "new_password": new_password},
    )
    assert reset_res.status_code == 200
    assert "Password has been reset successfully" in reset_res.json()["message"]

    # Verify token is now marked used
    with SessionLocal() as db:
        token_record = db.scalar(
            select(PasswordResetToken)
            .where(PasswordResetToken.user_id == user_id)
            .order_by(PasswordResetToken.created_at.desc())
        )
        assert token_record is not None
        assert token_record.is_used is True
        assert token_record.used_at is not None

        # Verify all refresh tokens are revoked
        tokens = db.scalars(
            select(RefreshToken).where(RefreshToken.user_id == user_id)
        ).all()
        assert all(t.is_revoked for t in tokens)

        # Verify audit log recorded RESET_PASSWORD
        reset_audit = db.scalar(
            select(AuditLog)
            .where(
                AuditLog.action == "RESET_PASSWORD",
                AuditLog.entity_id == str(user_id),
            )
            .order_by(AuditLog.created_at.desc())
        )
        assert reset_audit is not None

    # 6. Reusing single-use token fails -> 400
    reuse_res = client.post(
        "/api/v1/auth/reset-password",
        json={"token": raw_token, "new_password": "AnotherPassword123!"},
    )
    assert reuse_res.status_code == 400
    assert "Invalid or expired" in reuse_res.json()["detail"]

    # 7. Old password fails
    old_login = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": old_password},
    )
    assert old_login.status_code == 401

    # 8. New password succeeds
    new_login = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": new_password},
    )
    assert new_login.status_code == 200

    # 9. Prior refresh token is revoked
    refresh_attempt = client.post(
        "/api/v1/auth/refresh",
        cookies={"refresh_token": initial_rt},
    )
    assert refresh_attempt.status_code == 401


@pytest.mark.integration
def test_reset_password_expired_token():
    """Verify an expired password reset token is rejected."""
    email = f"expired_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"

    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "role": "PATIENT"},
    )
    assert reg_res.status_code == 201
    user_id = uuid.UUID(reg_res.json()["data"]["user"]["id"])

    # Insert expired token record in DB
    raw_token = f"expired_tok_{uuid.uuid4().hex}"
    past_time = datetime.now(UTC) - timedelta(hours=2)
    with SessionLocal() as db:
        record = PasswordResetToken(
            id=uuid.uuid4(),
            user_id=user_id,
            token_hash=hash_token(raw_token),
            expires_at=past_time,
            is_used=False,
        )
        db.add(record)
        db.commit()

    res = client.post(
        "/api/v1/auth/reset-password",
        json={"token": raw_token, "new_password": "BrandNewPassword123!"},
    )
    assert res.status_code == 400
    assert "Invalid or expired" in res.json()["detail"]


@pytest.mark.integration
def test_cookie_based_refresh_and_logout():
    """Verify refresh token is set in httpOnly cookie and can be used for
    rotation and logout.
    """
    email = f"cookie_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"

    # 1. Register and verify Set-Cookie header and no refresh_token in response body
    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "role": "PATIENT"},
    )
    assert reg_res.status_code == 201
    assert "refresh_token" in reg_res.cookies
    assert "refresh_token" not in reg_res.json()["data"]

    # 2. Login and verify cookie and no refresh_token in response body
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_res.status_code == 200
    assert "refresh_token" in login_res.cookies
    assert "refresh_token" not in login_res.json()["data"]
    initial_cookie = login_res.cookies["refresh_token"]

    # 3. Call refresh without body, passing cookie
    cookie_client = TestClient(app, cookies={"refresh_token": initial_cookie})
    ref_res = cookie_client.post("/api/v1/auth/refresh")
    assert ref_res.status_code == 200
    assert "access_token" in ref_res.json()["data"]
    assert "refresh_token" not in ref_res.json()["data"]
    assert "refresh_token" in ref_res.cookies
    new_cookie = ref_res.cookies["refresh_token"]
    assert new_cookie != initial_cookie

    # 4. Logout clears cookie
    at = ref_res.json()["data"]["access_token"]
    logout_res = cookie_client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {at}"},
    )
    assert logout_res.status_code == 200
