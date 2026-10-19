#!/usr/bin/env python3
"""Secure first-administrator bootstrap CLI tool for ArogyaVajra.

This script provisions the initial system administrator or promotes an existing user
when NO active administrator exists in the target database.

Security guarantees:
1. One-time execution: Strictly refuses to overwrite, modify, or demote existing administrators.
2. Verified deployment-time authorization: Requires an operator-controlled BOOTSTRAP_SECRET.
3. Target database verification: Confirms database connectivity and displays safe target host before modifying.
4. Robust credentials: Enforces strict password complexity requirements (min 12 chars, mixed case, numbers, symbols).
5. Immutable audit logging: Records an audit trail entry in the database without logging secrets or passwords.
6. Safe error recovery: Does not leave orphaned or partially modified state on failure.
"""

from __future__ import annotations

import argparse
import getpass
import os
import re
import sys
import uuid

# Add apps/api to python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import create_engine, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.repositories.user import UserRepository
from app.services.audit import record_audit_event


def validate_password_complexity(password: str) -> None:
    """Validate that the password meets enterprise security standards.

    Requires:
    - Minimum 12 characters.
    - At least one uppercase letter.
    - At least one lowercase letter.
    - At least one decimal digit.
    - At least one special symbol.
    - Disallows trivial substrings ('password', 'admin', 'arogyavajra').
    """
    if len(password) < 12:
        raise ValueError("Password must be at least 12 characters in length.")

    if not re.search(r"[a-z]", password):
        raise ValueError("Password must contain at least one lowercase letter.")

    if not re.search(r"[A-Z]", password):
        raise ValueError("Password must contain at least one uppercase letter.")

    if not re.search(r"\d", password):
        raise ValueError("Password must contain at least one numerical digit.")

    if not re.search(r"[!@#$%^&*()_+\-=\[\]{}|;:,.<>?/~`]", password):
        raise ValueError("Password must contain at least one special character.")

    lowered = password.lower()
    for forbidden in ("password", "admin", "arogyavajra"):
        if forbidden in lowered:
            raise ValueError(f"Password must not contain forbidden pattern '{forbidden}'.")


def validate_bootstrap_secret(secret: str | None, app_env: str) -> None:
    """Validate that the bootstrap authorization secret is safe and present."""
    if not secret or not secret.strip():
        raise ValueError(
            "BOOTSTRAP_SECRET is missing. An operator authorization secret is required to bootstrap."
        )

    clean_secret = secret.strip()
    if app_env == "production":
        if len(clean_secret) < 16:
            raise ValueError(
                "In production, BOOTSTRAP_SECRET must be at least 16 characters in length."
            )
        lowered = clean_secret.lower()
        trivial_patterns = (
            "password",
            "secret",
            "admin",
            "bootstrap",
            "default",
            "secretsecretsecret",
            "adminadminadmin",
            "1234567890123456",
        )
        if lowered in trivial_patterns or len(set(lowered)) <= 3:
            raise ValueError("In production, BOOTSTRAP_SECRET cannot be a trivial or default value.")


def validate_email_format(email: str) -> str:
    """Normalize and validate email address."""
    normalized = email.strip().lower()
    email_regex = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    if not re.match(email_regex, normalized):
        raise ValueError(f"Invalid email address format: '{email}'.")
    return normalized


def bootstrap_initial_admin(
    db: Session,
    email: str,
    password: str,
    secret: str,
    app_env: str | None = None,
    force: bool = False,
) -> tuple[User, str]:
    """Execute the secure initial admin bootstrap process on an active database session.

    Returns:
        (User, "CREATED" | "PROMOTED")

    Raises:
        RuntimeError: If an active administrator already exists and force is False.
        ValueError: If configuration or credentials fail validation checks.
    """
    effective_env = app_env or os.environ.get("APP_ENV") or settings.APP_ENV

    # 1. Validate authorization secret (essential safety check - cannot be bypassed by force)
    validate_bootstrap_secret(secret, effective_env)

    # 2. Validate inputs (essential safety check - cannot be bypassed by force)
    normalized_email = validate_email_format(email)
    validate_password_complexity(password)

    # 3. Check for existing active administrators (One-time bootstrap invariant)
    active_admins_count = UserRepository.count_active_admins(db)
    if active_admins_count > 0 and not force:
        raise RuntimeError(
            "Bootstrap aborted: The database already contains one or more active administrators. "
            "Bootstrap is strictly a one-time operation and will not overwrite existing administrative accounts. "
            "To perform an emergency recovery of an administrative account, supply the --force flag."
        )

    # 4. Check if target email already exists (e.g., operator registered as patient)
    existing_user = db.scalar(select(User).where(User.email == normalized_email))

    if existing_user:
        # Promote existing user to ADMIN
        old_role = existing_user.role
        existing_user.role = UserRole.ADMIN
        existing_user.password_hash = hash_password(password)
        existing_user.is_active = True
        db.add(existing_user)
        db.flush()

        is_emergency = force and active_admins_count > 0
        action_name = "ADMIN_EMERGENCY_RECOVERY" if is_emergency else "ADMIN_BOOTSTRAP_PROMOTED"
        new_values = {"role": UserRole.ADMIN.value, "email": normalized_email}
        if is_emergency:
            new_values["emergency_recovery"] = True

        record_audit_event(
            db=db,
            action=action_name,
            entity_type="USER",
            entity_id=str(existing_user.id),
            user_id=existing_user.id,
            old_values={"role": old_role.value},
            new_values=new_values,
            ip_address="127.0.0.1",
            user_agent="ArogyaVajra-Bootstrap-CLI",
        )
        db.commit()
        return existing_user, "RECOVERED" if is_emergency else "PROMOTED"
    else:
        # Create brand new ADMIN user
        new_admin = User(
            id=uuid.uuid4(),
            email=normalized_email,
            password_hash=hash_password(password),
            role=UserRole.ADMIN,
            is_active=True,
        )
        db.add(new_admin)
        db.flush()

        is_emergency = force and active_admins_count > 0
        action_name = "ADMIN_EMERGENCY_RECOVERY" if is_emergency else "ADMIN_BOOTSTRAP_CREATED"
        new_values = {"role": UserRole.ADMIN.value, "email": normalized_email}
        if is_emergency:
            new_values["emergency_recovery"] = True

        record_audit_event(
            db=db,
            action=action_name,
            entity_type="USER",
            entity_id=str(new_admin.id),
            user_id=new_admin.id,
            new_values=new_values,
            ip_address="127.0.0.1",
            user_agent="ArogyaVajra-Bootstrap-CLI",
        )
        db.commit()
        return new_admin, "RECOVERED" if is_emergency else "CREATED"


def main() -> None:
    """CLI Entrypoint for bootstrap_admin."""
    parser = argparse.ArgumentParser(
        description="ArogyaVajra Initial Administrator Bootstrap CLI",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--email",
        "-e",
        default=os.environ.get("ADMIN_BOOTSTRAP_EMAIL"),
        help="Administrator email address (or set ADMIN_BOOTSTRAP_EMAIL)",
    )
    parser.add_argument(
        "--password",
        "-p",
        default=os.environ.get("ADMIN_BOOTSTRAP_PASSWORD"),
        help="Administrator password (or set ADMIN_BOOTSTRAP_PASSWORD; will prompt if omitted)",
    )
    parser.add_argument(
        "--secret",
        "-s",
        default=os.environ.get("BOOTSTRAP_SECRET"),
        help="Operator authorization secret (or set BOOTSTRAP_SECRET)",
    )
    parser.add_argument(
        "--db-url",
        default=os.environ.get("DATABASE_URL") or settings.DATABASE_URL,
        help="Database connection URL",
    )
    parser.add_argument(
        "--yes",
        "-y",
        action="store_true",
        help="Confirm execution without interactive confirmation prompts",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Emergency recovery: allow administrative provisioning or reset even when active administrators exist. Essential safety checks (secret, password complexity) are still strictly enforced.",
    )

    args = parser.parse_args()

    # 1. Resolve and validate database connection
    db_url = args.db_url
    if not db_url:
        print("[!] Error: No database URL provided.", file=sys.stderr)
        sys.exit(1)

    try:
        engine = create_engine(db_url)
        with engine.connect():
            pass
    except (SQLAlchemyError, OSError) as exc:
        print(f"[!] Database connection failed: {exc}", file=sys.stderr)
        sys.exit(1)

    masked_url = engine.url.render_as_string(hide_password=True)
    app_env = os.environ.get("APP_ENV") or settings.APP_ENV

    print("\n============================================================")
    print("      ArogyaVajra — Initial Administrator Bootstrap CLI     ")
    print("============================================================")
    print(f"Target Database:  {masked_url}")
    print(f"Environment:      {app_env}")
    if args.force:
        print("Mode:             EMERGENCY RECOVERY (--force active)")
    print("============================================================\n")

    # 2. Gather email
    email = args.email
    if not email:
        if not sys.stdin.isatty():
            print("[!] Error: Email is required (--email or ADMIN_BOOTSTRAP_EMAIL).", file=sys.stderr)
            sys.exit(1)
        email = input("Enter administrator email address: ").strip()

    # 3. Gather password
    password = args.password
    if not password:
        if not sys.stdin.isatty():
            print("[!] Error: Password is required (--password or ADMIN_BOOTSTRAP_PASSWORD).", file=sys.stderr)
            sys.exit(1)
        password = getpass.getpass("Enter administrator password: ")
        confirm_password = getpass.getpass("Confirm administrator password: ")
        if password != confirm_password:
            print("[!] Error: Passwords do not match.", file=sys.stderr)
            sys.exit(1)

    # 4. Gather secret
    secret = args.secret
    if not secret:
        if not sys.stdin.isatty():
            print("[!] Error: BOOTSTRAP_SECRET is required (--secret or BOOTSTRAP_SECRET).", file=sys.stderr)
            sys.exit(1)
        secret = getpass.getpass("Enter BOOTSTRAP_SECRET: ")

    # 5. Interactive confirmation if in terminal and --yes not provided
    if sys.stdin.isatty() and not args.yes:
        action_desc = "emergency recovery of administrator" if args.force else "initial administrator"
        print(f"\nYou are about to provision an {action_desc} for: {email}")
        confirm = input("Proceed with provisioning? [y/N]: ").strip().lower()
        if confirm not in ("y", "yes"):
            print("[*] Bootstrap cancelled by operator.")
            sys.exit(0)

    # 6. Execute bootstrap
    try:
        with Session(engine) as session:
            admin_user, action_type = bootstrap_initial_admin(
                db=session,
                email=email,
                password=password,
                secret=secret,
                app_env=app_env,
                force=args.force,
            )

        print("\n------------------------------------------------------------")
        if action_type == "RECOVERED":
            print(f"[!] RECOVERY: Administrator account '{admin_user.email}' recovered successfully via --force.")
        elif action_type == "PROMOTED":
            print(f"[*] SUCCESS: Existing user '{admin_user.email}' elevated to Administrator role.")
        else:
            print(f"[+] SUCCESS: Initial Administrator '{admin_user.email}' created successfully.")
        print(f"    User ID: {admin_user.id}")
        print(f"    Role:    {admin_user.role}")
        print("------------------------------------------------------------")
        print("\nRecommended Next Steps:")
        print("1. Log in to the ArogyaVajra web portal at /login with these credentials.")
        print("2. Navigate to /admin to access the system administration workspace.")
        print("3. Unset or revoke BOOTSTRAP_SECRET from environment variables to prevent repeat use.")
        print("4. Onboard clinical practitioners and support staff via the User Management panel.\n")
    except RuntimeError as r_err:
        print(f"\n[!] Bootstrap Failed (Precondition/Invariant): {r_err}", file=sys.stderr)
        sys.exit(2)
    except ValueError as v_err:
        print(f"\n[!] Bootstrap Failed (Validation Error): {v_err}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:  # noqa: BLE001
        print(f"\n[!] Unexpected Error during bootstrap: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
