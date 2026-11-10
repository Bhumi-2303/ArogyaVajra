"""Integration tests verifying trusted proxy handling, real client IP extraction,
rate limiting bucketing, and audit logging.

Test coverage:
1. Two different X-Forwarded-For clients from a trusted proxy get separate rate-limit buckets.
2. The same header from an untrusted caller is ignored (rate-limited by direct peer IP,
   cannot bypass rate limiting via spoofed headers).
3. Audit logs store the real client IP extracted from X-Forwarded-For via trusted proxy.
"""

import uuid
from datetime import UTC, datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.core.config import settings
from app.db.session import SessionLocal
from app.main import app
from app.models.audit_log import AuditLog
from app.models.doctor import DoctorProfile
from app.models.patient import PatientProfile
from app.models.user import User, UserRole


def create_test_user(email_prefix: str, role: UserRole = UserRole.PATIENT) -> User:
    """Create test user directly in DB."""
    with SessionLocal() as db:
        user = User(
            id=uuid.uuid4(),
            email=f"{email_prefix}_{uuid.uuid4().hex[:8]}@example.com",
            password_hash="hashed_placeholder_pwd",
            role=role,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user


@pytest.mark.integration
def test_two_different_forwarded_clients_from_trusted_proxy_get_separate_rate_limit_buckets(
    monkeypatch,
):
    """Integration test (i): Two different X-Forwarded-For clients connecting via

    a trusted proxy receive independent rate-limit counters.
    """
    # Configure Render private network range as trusted proxy and enforce rate limiting
    monkeypatch.setattr(settings, "TRUSTED_PROXIES", "10.0.0.0/8, 127.0.0.1")
    monkeypatch.setattr(settings, "APP_ENV", "production")

    user_a = create_test_user("client_a")
    user_b = create_test_user("client_b")

    # Both clients connect through the same trusted web proxy IP on the 10.0.0.0/8 network
    proxy_client = TestClient(app, client=("10.0.1.50", 44321))

    client_ip_a = "198.51.100.11"
    client_ip_b = "198.51.100.22"

    # Client A consumes 5 allowed password-reset requests within 60s window
    for _ in range(5):
        res_a = proxy_client.post(
            "/api/v1/auth/forgot-password",
            json={"email": user_a.email},
            headers={"X-Forwarded-For": client_ip_a},
        )
        assert res_a.status_code == 200

    # 6th request from Client A must be rate-limited (429)
    res_a_blocked = proxy_client.post(
        "/api/v1/auth/forgot-password",
        json={"email": user_a.email},
        headers={"X-Forwarded-For": client_ip_a},
    )
    assert res_a_blocked.status_code == 429
    assert "Rate limit exceeded" in res_a_blocked.json()["detail"]

    # Client B connecting through the exact same proxy must NOT be blocked,
    # because it resolves to a separate rate limit bucket
    res_b = proxy_client.post(
        "/api/v1/auth/forgot-password",
        json={"email": user_b.email},
        headers={"X-Forwarded-For": client_ip_b},
    )
    assert res_b.status_code == 200


@pytest.mark.integration
def test_forwarded_headers_from_untrusted_caller_are_ignored(monkeypatch):
    """Integration test (ii): An untrusted caller attempting to spoof X-Forwarded-For

    is rate-limited by its direct connection IP, preventing spoofing bypasses.
    """
    monkeypatch.setattr(settings, "TRUSTED_PROXIES", "10.0.0.0/8")
    monkeypatch.setattr(settings, "APP_ENV", "production")

    # Direct connection from untrusted public IP (NOT in 10.0.0.0/8)
    untrusted_ip = "203.0.113.88"
    untrusted_client = TestClient(app, client=(untrusted_ip, 54321))

    # Untrusted attacker rotates spoofed X-Forwarded-For headers
    for i in range(5):
        spoofed_header_ip = f"198.51.100.{100 + i}"
        res = untrusted_client.post(
            "/api/v1/auth/forgot-password",
            json={"email": f"target_{i}@example.com"},
            headers={"X-Forwarded-For": spoofed_header_ip},
        )
        assert res.status_code == 200

    # 6th request attempts another new spoofed IP header; must STILL be blocked (429)
    # because rate limiter tracked the attacker's direct socket IP (203.0.113.88)
    blocked_res = untrusted_client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "target_final@example.com"},
        headers={"X-Forwarded-For": "198.51.100.200"},
    )
    assert blocked_res.status_code == 429
    assert "Rate limit exceeded" in blocked_res.json()["detail"]


@pytest.mark.integration
def test_audit_logs_store_real_client_ip_from_trusted_proxy(monkeypatch):
    """Integration test (iii): Mutating endpoints persist the real client IP

    from X-Forwarded-For into the audit_logs table when called through a trusted proxy.
    """
    monkeypatch.setattr(settings, "TRUSTED_PROXIES", "10.0.0.0/8")

    user = create_test_user("audit_test_user")
    trusted_proxy_ip = "10.0.2.15"
    real_client_ip = "198.51.100.77"

    proxy_client = TestClient(app, client=(trusted_proxy_ip, 49152))

    res = proxy_client.post(
        "/api/v1/auth/forgot-password",
        json={"email": user.email},
        headers={"X-Forwarded-For": real_client_ip},
    )
    assert res.status_code == 200

    # Inspect audit_logs table to verify real_client_ip was stored
    with SessionLocal() as db:
        log_entry = db.scalar(
            select(AuditLog)
            .where(
                AuditLog.user_id == user.id,
                AuditLog.action == "REQUEST_PASSWORD_RESET",
            )
            .order_by(AuditLog.created_at.desc())
        )
        assert log_entry is not None
        assert log_entry.ip_address == real_client_ip
        assert log_entry.ip_address != trusted_proxy_ip


@pytest.mark.integration
def test_audit_logs_untrusted_caller_stores_direct_host_not_spoofed_ip(monkeypatch):
    """Integration test: Untrusted caller attempting to spoof X-Forwarded-For

    has its direct socket IP recorded in audit_logs, NOT the spoofed header.
    """
    monkeypatch.setattr(settings, "TRUSTED_PROXIES", "10.0.0.0/8")

    user = create_test_user("untrusted_audit_user")
    untrusted_direct_ip = "203.0.113.99"
    spoofed_ip = "192.0.2.1"

    untrusted_client = TestClient(app, client=(untrusted_direct_ip, 50123))

    res = untrusted_client.post(
        "/api/v1/auth/forgot-password",
        json={"email": user.email},
        headers={"X-Forwarded-For": spoofed_ip},
    )
    assert res.status_code == 200

    with SessionLocal() as db:
        log_entry = db.scalar(
            select(AuditLog)
            .where(
                AuditLog.user_id == user.id,
                AuditLog.action == "REQUEST_PASSWORD_RESET",
            )
            .order_by(AuditLog.created_at.desc())
        )
        assert log_entry is not None
        assert log_entry.ip_address == untrusted_direct_ip
        assert log_entry.ip_address != spoofed_ip


@pytest.mark.integration
def test_appointment_creation_audit_log_stores_real_client_ip(monkeypatch):
    """Integration test: Creating an appointment through a trusted proxy logs

    the client's real IP address from X-Forwarded-For into the AuditLog entry.
    """
    monkeypatch.setattr(settings, "TRUSTED_PROXIES", "10.0.0.0/8")

    # Set up doctor and patient
    default_client = TestClient(app)
    admin_email = f"admin_{uuid.uuid4().hex[:8]}@example.com"
    pwd = "SecurePassword123!"
    reg = default_client.post(
        "/api/v1/auth/register",
        json={"email": admin_email, "password": pwd, "role": "PATIENT"},
    )
    admin_uid = uuid.UUID(reg.json()["data"]["user"]["id"])
    with SessionLocal() as db:
        u = db.scalar(select(User).where(User.id == admin_uid))
        u.role = UserRole.ADMIN
        db.commit()

    login_res = default_client.post(
        "/api/v1/auth/login",
        json={"email": admin_email, "password": pwd},
    )
    admin_token = login_res.json()["data"]["access_token"]

    # Register patient
    pat_email = f"patient_{uuid.uuid4().hex[:8]}@example.com"
    pat_reg = default_client.post(
        "/api/v1/auth/register",
        json={"email": pat_email, "password": pwd, "role": "PATIENT"},
    )
    pat_uid = uuid.UUID(pat_reg.json()["data"]["user"]["id"])
    pat_login = default_client.post(
        "/api/v1/auth/login",
        json={"email": pat_email, "password": pwd},
    )
    pat_token = pat_login.json()["data"]["access_token"]

    # Provision doctor
    doc_uid = create_test_user("appt_doc", UserRole.DOCTOR).id
    suffix = uuid.uuid4().hex[:6]
    with SessionLocal() as db:
        doc = DoctorProfile(
            user_id=doc_uid,
            doctor_code=f"DOC-{suffix.upper()}",
            first_name="Proxy",
            last_name="Doctor",
            specialization="General",
            consultation_fee=500,
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        doctor_id = doc.id

        patient = db.scalar(
            select(PatientProfile).where(PatientProfile.user_id == pat_uid)
        )
        patient_id = patient.id

    # Create doctor availability
    for d in range(7):
        default_client.post(
            f"/api/v1/doctors/{doctor_id}/availability",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "day_of_week": d,
                "start_time": "08:00:00",
                "end_time": "18:00:00",
                "slot_duration_minutes": 30,
            },
        )

    trusted_proxy_ip = "10.0.3.40"
    real_client_ip = "198.51.100.95"
    proxy_client = TestClient(app, client=(trusted_proxy_ip, 40000))

    appt_date = (datetime.now(UTC) + timedelta(days=2)).date().isoformat()
    appt_res = proxy_client.post(
        "/api/v1/appointments",
        headers={
            "Authorization": f"Bearer {pat_token}",
            "X-Forwarded-For": real_client_ip,
        },
        json={
            "patient_id": str(patient_id),
            "doctor_id": str(doctor_id),
            "appointment_date": appt_date,
            "start_time": "10:00:00",
            "end_time": "10:30:00",
            "notes": "Testing trusted proxy client IP logging",
        },
    )
    assert appt_res.status_code == 201
    appt_id = appt_res.json()["data"]["id"]

    # Assert audit log entry stored real_client_ip
    with SessionLocal() as db:
        audit = db.scalar(
            select(AuditLog)
            .where(
                AuditLog.entity_id == str(appt_id),
                AuditLog.action == "APPOINTMENT_CREATE",
            )
            .order_by(AuditLog.created_at.desc())
        )
        assert audit is not None
        assert audit.ip_address == real_client_ip
        assert audit.ip_address != trusted_proxy_ip
