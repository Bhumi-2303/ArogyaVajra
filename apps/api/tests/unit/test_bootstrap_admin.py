"""Unit tests for initial administrator bootstrap validations and logic."""

import uuid

import pytest
from sqlalchemy import select

from app.core.security import verify_password
from app.db.session import get_sessionmaker
from app.models.audit_log import AuditLog
from app.models.user import User, UserRole
from scripts.bootstrap_admin import (
    bootstrap_initial_admin,
    validate_bootstrap_secret,
    validate_email_format,
    validate_password_complexity,
)


def test_validate_password_complexity_valid():
    """Verify standard strong passwords pass complexity check."""
    validate_password_complexity("StrongP@ssw0rd!2026")
    validate_password_complexity("V@jraHealth#9981")


def test_validate_password_complexity_rejects_short():
    """Verify passwords shorter than 12 characters are rejected."""
    with pytest.raises(ValueError, match="at least 12 characters"):
        validate_password_complexity("Short1!Aa")


def test_validate_password_complexity_rejects_missing_char_types():
    """Verify passwords missing upper, lower, digit, or symbol are rejected."""
    with pytest.raises(ValueError, match="lowercase letter"):
        validate_password_complexity("UPPERCASE12345!@#")

    with pytest.raises(ValueError, match="uppercase letter"):
        validate_password_complexity("lowercase12345!@#")

    with pytest.raises(ValueError, match="numerical digit"):
        validate_password_complexity("NoDigitsHere!@#$")

    with pytest.raises(ValueError, match="special character"):
        validate_password_complexity("NoSymbolsHere12345")


def test_validate_password_complexity_rejects_forbidden_patterns():
    """Verify passwords containing forbidden substrings are rejected."""
    with pytest.raises(ValueError, match="forbidden pattern"):
        validate_password_complexity("AdminSecretPass!1234")

    with pytest.raises(ValueError, match="forbidden pattern"):
        validate_password_complexity("MyArogyavajraKey!1234")


def test_validate_bootstrap_secret():
    """Verify secret validation handles presence, length, and production invariants."""
    # Missing secret
    with pytest.raises(ValueError, match="BOOTSTRAP_SECRET is missing"):
        validate_bootstrap_secret("", "development")

    with pytest.raises(ValueError, match="BOOTSTRAP_SECRET is missing"):
        validate_bootstrap_secret(None, "production")

    # In development, non-empty secret is allowed
    validate_bootstrap_secret("dev-secret", "development")

    # In production, < 16 chars is rejected
    with pytest.raises(ValueError, match="at least 16 characters"):
        validate_bootstrap_secret("short-prod-key", "production")

    # In production, trivial values are rejected
    with pytest.raises(ValueError, match="cannot be a trivial or default value"):
        validate_bootstrap_secret("secretsecretsecret", "production")

    # In production, robust secret is accepted
    validate_bootstrap_secret("Enterprise#Operator#Key#2026!XyZ", "production")


def test_validate_email_format():
    """Verify email normalization and syntax validation."""
    assert validate_email_format("  Admin@Hospital.Org  ") == "admin@hospital.org"

    with pytest.raises(ValueError, match="Invalid email address"):
        validate_email_format("not-an-email")


def test_bootstrap_initial_admin_creation_and_audit():
    """Verify bootstrap creates a new admin user and records an audit log without secrets."""
    factory = get_sessionmaker()
    test_email = f"bootstrap.admin.{uuid.uuid4().hex[:8]}@example.com"
    test_password = "SecureChief#Pass123!"
    secret = "TestBootstrapSecret123"

    with factory() as db:
        # Ensure no active admin exists for this test context
        existing_admins = db.scalars(
            select(User).where(User.role == UserRole.ADMIN, User.is_active.is_(True))
        ).all()
        for adm in existing_admins:
            adm.is_active = False
        db.commit()

        try:
            admin_user, action_type = bootstrap_initial_admin(
                db=db,
                email=test_email,
                password=test_password,
                secret=secret,
                app_env="test",
            )

            assert action_type == "CREATED"
            assert admin_user.email == test_email
            assert admin_user.role == UserRole.ADMIN
            assert admin_user.is_active is True
            assert verify_password(test_password, admin_user.password_hash)

            # Verify audit log entry
            audit_entry = db.scalar(
                select(AuditLog)
                .where(
                    AuditLog.entity_id == str(admin_user.id),
                    AuditLog.action == "ADMIN_BOOTSTRAP_CREATED",
                )
            )
            assert audit_entry is not None
            assert audit_entry.user_id == admin_user.id
            assert audit_entry.new_values is not None
            assert audit_entry.new_values["role"] == "ADMIN"
            assert audit_entry.new_values["email"] == test_email
            # Ensure password and secret are never logged
            assert "password" not in str(audit_entry.new_values)
            assert "secret" not in str(audit_entry.new_values)

            # Attempting to bootstrap a SECOND time must be strictly rejected
            with pytest.raises(RuntimeError, match="already contains one or more active administrators"):
                bootstrap_initial_admin(
                    db=db,
                    email="another.admin@example.com",
                    password="AnotherChief#Pass123!",
                    secret=secret,
                    app_env="test",
                )
        finally:
            # Restore previous active admins
            for adm in existing_admins:
                adm.is_active = True
            db.commit()


def test_bootstrap_initial_admin_promotes_existing_user():
    """Verify bootstrap promotes an existing user when no active administrator exists."""
    factory = get_sessionmaker()
    existing_user_email = f"registered.patient.{uuid.uuid4().hex[:8]}@example.com"
    new_password = "PromotedChief#Pass456!"
    secret = "TestBootstrapSecret123"

    with factory() as db:
        # Create an existing patient user
        patient_user = User(
            id=uuid.uuid4(),
            email=existing_user_email,
            password_hash=UserRole.PATIENT,  # placeholder
            role=UserRole.PATIENT,
            is_active=True,
        )
        db.add(patient_user)
        db.commit()

        # Temporarily deactivate any existing active admins
        existing_admins = db.scalars(
            select(User).where(User.role == UserRole.ADMIN, User.is_active.is_(True))
        ).all()
        for adm in existing_admins:
            adm.is_active = False
        db.commit()

        try:
            promoted_user, action_type = bootstrap_initial_admin(
                db=db,
                email=existing_user_email,
                password=new_password,
                secret=secret,
                app_env="test",
            )

            assert action_type == "PROMOTED"
            assert promoted_user.id == patient_user.id
            assert promoted_user.email == existing_user_email
            assert promoted_user.role == UserRole.ADMIN
            assert verify_password(new_password, promoted_user.password_hash)

            # Verify audit log entry
            audit_entry = db.scalar(
                select(AuditLog)
                .where(
                    AuditLog.entity_id == str(promoted_user.id),
                    AuditLog.action == "ADMIN_BOOTSTRAP_PROMOTED",
                )
            )
            assert audit_entry is not None
            assert audit_entry.old_values == {"role": "PATIENT"}
            assert audit_entry.new_values == {"role": "ADMIN", "email": existing_user_email}
            assert "password" not in str(audit_entry.new_values)
            assert "secret" not in str(audit_entry.new_values)
        finally:
            for adm in existing_admins:
                adm.is_active = True
            db.commit()


def test_emergency_recovery_force_flag_with_existing_admins():
    """Verify that --force permits emergency recovery when an admin already exists."""
    factory = get_sessionmaker()
    recovery_email = f"recovery.admin.{uuid.uuid4().hex[:8]}@example.com"
    recovery_pass = "EmergencyRec0very!2026"
    secret = "TestBootstrapSecret123"

    with factory() as db:
        # Create an active admin
        active_admin = User(
            id=uuid.uuid4(),
            email=f"existing.admin.{uuid.uuid4().hex[:8]}@example.com",
            password_hash="hashed",
            role=UserRole.ADMIN,
            is_active=True,
        )
        db.add(active_admin)
        db.commit()

        try:
            # Without force, it must raise RuntimeError
            with pytest.raises(RuntimeError, match="already contains one or more active administrators"):
                bootstrap_initial_admin(
                    db=db,
                    email=recovery_email,
                    password=recovery_pass,
                    secret=secret,
                    app_env="test",
                    force=False,
                )

            # With force=True, it succeeds in emergency recovery mode
            recovered_user, action_type = bootstrap_initial_admin(
                db=db,
                email=recovery_email,
                password=recovery_pass,
                secret=secret,
                app_env="test",
                force=True,
            )
            assert action_type == "RECOVERED"
            assert recovered_user.email == recovery_email
            assert recovered_user.role == UserRole.ADMIN

            # Verify audit trail records ADMIN_EMERGENCY_RECOVERY
            audit_entry = db.scalar(
                select(AuditLog).where(
                    AuditLog.entity_id == str(recovered_user.id),
                    AuditLog.action == "ADMIN_EMERGENCY_RECOVERY",
                )
            )
            assert audit_entry is not None
            assert audit_entry.new_values.get("emergency_recovery") is True
        finally:
            db.delete(active_admin)
            recovered = db.scalar(select(User).where(User.email == recovery_email))
            if recovered:
                db.delete(recovered)
            db.commit()


def test_emergency_recovery_force_flag_cannot_bypass_safety_checks():
    """Verify that --force CANNOT bypass secret validation, password complexity, or email checks."""
    factory = get_sessionmaker()
    with factory() as db:
        # Weak password check fails even with force=True
        with pytest.raises(ValueError, match="at least 12 characters"):
            bootstrap_initial_admin(
                db=db,
                email="admin@hospital.org",
                password="short",
                secret="ValidSecret123456",
                app_env="test",
                force=True,
            )

        # Missing secret fails even with force=True
        with pytest.raises(ValueError, match="BOOTSTRAP_SECRET is missing"):
            bootstrap_initial_admin(
                db=db,
                email="admin@hospital.org",
                password="StrongP@ssw0rd!2026",
                secret="",
                app_env="test",
                force=True,
            )

        # Production trivial secret fails even with force=True
        with pytest.raises(ValueError, match="cannot be a trivial or default value"):
            bootstrap_initial_admin(
                db=db,
                email="admin@hospital.org",
                password="StrongP@ssw0rd!2026",
                secret="secretsecretsecret",
                app_env="production",
                force=True,
            )

        # Malformed email fails even with force=True
        with pytest.raises(ValueError, match="Invalid email address format"):
            bootstrap_initial_admin(
                db=db,
                email="not-an-email",
                password="StrongP@ssw0rd!2026",
                secret="ValidSecret123456",
                app_env="test",
                force=True,
            )
