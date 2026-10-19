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


def test_validate_bootstrap_secret_missing_trusted():
    """Verify missing trusted secret fails closed in production and errors in other envs."""
    # In production, missing trusted secret fails closed
    with pytest.raises(ValueError, match="Trusted bootstrap secret is not configured in the environment"):
        validate_bootstrap_secret("supplied-secret", None, "production")

    with pytest.raises(ValueError, match="Trusted bootstrap secret is not configured in the environment"):
        validate_bootstrap_secret("supplied-secret", "", "production")

    # In development, missing trusted secret raises error
    with pytest.raises(ValueError, match="Trusted bootstrap secret is missing or not configured"):
        validate_bootstrap_secret("supplied-secret", None, "development")


def test_validate_bootstrap_secret_production_invariants():
    """Verify production checks for trusted secret length, trivial values, and entropy."""
    # Under 16 chars is rejected
    with pytest.raises(ValueError, match="at least 16 characters"):
        validate_bootstrap_secret("short-prod-key", "short-prod-key", "production")

    # Trivial values are rejected
    with pytest.raises(ValueError, match="cannot be a trivial or default value"):
        validate_bootstrap_secret("secretsecretsecret", "secretsecretsecret", "production")

    # Low entropy (<= 3 distinct lowercase chars) is rejected
    with pytest.raises(ValueError, match="cannot be a trivial or default value"):
        validate_bootstrap_secret("aaaaaaaaaaaaaaaa", "aaaaaaaaaaaaaaaa", "production")


def test_validate_bootstrap_secret_missing_supplied():
    """Verify missing or empty supplied secret is rejected."""
    trusted = "Enterprise#Operator#Key#2026!XyZ"
    with pytest.raises(ValueError, match="Operator authorization secret is missing"):
        validate_bootstrap_secret("", trusted, "production")

    with pytest.raises(ValueError, match="Operator authorization secret is missing"):
        validate_bootstrap_secret(None, trusted, "production")


def test_validate_bootstrap_secret_mismatch():
    """Verify mismatched secrets are rejected via constant-time comparison."""
    trusted = "Enterprise#Operator#Key#2026!XyZ"
    with pytest.raises(ValueError, match="Invalid bootstrap authorization secret"):
        validate_bootstrap_secret("WrongSecretSupplied#2026!XyZ", trusted, "production")

    with pytest.raises(ValueError, match="Invalid bootstrap authorization secret"):
        validate_bootstrap_secret("wrong-dev-secret", "dev-secret-trusted", "development")


def test_validate_bootstrap_secret_success():
    """Verify valid matching secrets pass in production and development."""
    trusted_prod = "Enterprise#Operator#Key#2026!XyZ"
    validate_bootstrap_secret(trusted_prod, trusted_prod, "production")

    validate_bootstrap_secret("dev-key-1234", "dev-key-1234", "development")


def test_bootstrap_initial_admin_authorization_failure():
    """Verify bootstrap_initial_admin rejects missing or mismatched authorization secret."""
    factory = get_sessionmaker()
    with factory() as db:
        # Fails closed when trusted secret is missing in production
        with pytest.raises(ValueError, match="Trusted bootstrap secret is not configured in the environment"):
            bootstrap_initial_admin(
                db=db,
                email="admin@hospital.org",
                password="StrongP@ssw0rd!2026",
                secret="SuppliedKey#12345678",
                app_env="production",
                expected_secret=None,
            )

        # Rejects mismatched authorization secret
        with pytest.raises(ValueError, match="Invalid bootstrap authorization secret"):
            bootstrap_initial_admin(
                db=db,
                email="admin@hospital.org",
                password="StrongP@ssw0rd!2026",
                secret="IncorrectSuppliedKey#123",
                app_env="test",
                expected_secret="ExpectedSecretKey#123456",
            )


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
                expected_secret=secret,
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
                    expected_secret=secret,
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
                expected_secret=secret,
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
                    expected_secret=secret,
                )

            # With force=True, it succeeds in emergency recovery mode
            recovered_user, action_type = bootstrap_initial_admin(
                db=db,
                email=recovery_email,
                password=recovery_pass,
                secret=secret,
                app_env="test",
                force=True,
                expected_secret=secret,
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
    """Verify that --force CANNOT bypass authorization, password complexity, or email checks."""
    factory = get_sessionmaker()
    valid_key = "Enterprise#Operator#Key#2026!XyZ"
    with factory() as db:
        # Weak password check fails even with force=True
        with pytest.raises(ValueError, match="at least 12 characters"):
            bootstrap_initial_admin(
                db=db,
                email="admin@hospital.org",
                password="short",
                secret=valid_key,
                app_env="test",
                force=True,
                expected_secret=valid_key,
            )

        # Missing supplied secret fails even with force=True
        with pytest.raises(ValueError, match="Operator authorization secret is missing"):
            bootstrap_initial_admin(
                db=db,
                email="admin@hospital.org",
                password="StrongP@ssw0rd!2026",
                secret="",
                app_env="test",
                force=True,
                expected_secret=valid_key,
            )

        # Mismatched authorization secret fails even with force=True
        with pytest.raises(ValueError, match="Invalid bootstrap authorization secret"):
            bootstrap_initial_admin(
                db=db,
                email="admin@hospital.org",
                password="StrongP@ssw0rd!2026",
                secret="WrongSuppliedSecret#123!",
                app_env="test",
                force=True,
                expected_secret=valid_key,
            )

        # Missing trusted secret in production fails closed even with force=True
        with pytest.raises(ValueError, match="Trusted bootstrap secret is not configured in the environment"):
            bootstrap_initial_admin(
                db=db,
                email="admin@hospital.org",
                password="StrongP@ssw0rd!2026",
                secret=valid_key,
                app_env="production",
                force=True,
                expected_secret=None,
            )

        # Production trivial trusted secret fails even with force=True
        with pytest.raises(ValueError, match="cannot be a trivial or default value"):
            bootstrap_initial_admin(
                db=db,
                email="admin@hospital.org",
                password="StrongP@ssw0rd!2026",
                secret="secretsecretsecret",
                app_env="production",
                force=True,
                expected_secret="secretsecretsecret",
            )

        # Malformed email fails even with force=True
        with pytest.raises(ValueError, match="Invalid email address format"):
            bootstrap_initial_admin(
                db=db,
                email="not-an-email",
                password="StrongP@ssw0rd!2026",
                secret=valid_key,
                app_env="test",
                force=True,
                expected_secret=valid_key,
            )
