"""Unit tests for development demo account seeding and safety guards."""

import os
from unittest.mock import patch

import pytest
from sqlalchemy import select

from app.core.security import verify_password
from app.db.session import get_sessionmaker
from app.models.doctor import DoctorProfile
from app.models.patient import PatientProfile
from app.models.user import User, UserRole
from scripts.seed_dev_accounts import seed_accounts


def test_seed_accounts_safety_blocks_production():
    """Verify that seed_accounts refuses to run when APP_ENV=production."""
    with (
        patch.dict(os.environ, {"APP_ENV": "production"}),
        pytest.raises(
            RuntimeError, match="strictly prohibited when APP_ENV=production"
        ),
    ):
        seed_accounts()


def test_seed_accounts_safety_blocks_render_cloud_database_url():
    """Verify that seed_accounts refuses to run against a Render production database URL."""
    fake_render_url = (
        "postgresql+psycopg://user:pass@dpg-abc1234-a.oregon-postgres.render.com/arogyavajra_prod"
    )
    with (
        patch.dict(os.environ, {"DATABASE_URL": fake_render_url, "APP_ENV": "development"}),
        pytest.raises(
            RuntimeError, match="strictly prohibited against a production or Render cloud database"
        ),
    ):
        seed_accounts()


def test_seed_accounts_idempotency_and_completeness():
    """Verify that seed_accounts provisions all 5 roles and is completely idempotent."""
    factory = get_sessionmaker()
    with factory() as db:  # type: Session
        result = seed_accounts(db=db)

        assert result["admin"] == "admin@arogyavajra.com"
        assert result["doctor"] == "doctor@arogyavajra.com"
        assert result["receptionist"] == "receptionist@arogyavajra.com"
        assert result["billing"] == "billing@arogyavajra.com"
        assert result["patient"] == "patient@arogyavajra.com"

        # Verify User records and roles
        admin = db.scalar(select(User).where(User.email == "admin@arogyavajra.com"))
        assert admin is not None
        assert admin.role == UserRole.ADMIN
        assert admin.is_active is True

        doctor = db.scalar(select(User).where(User.email == "doctor@arogyavajra.com"))
        assert doctor is not None
        assert doctor.role == UserRole.DOCTOR
        assert doctor.is_active is True
        doc_profile = db.scalar(select(DoctorProfile).where(DoctorProfile.user_id == doctor.id))
        assert doc_profile is not None
        assert doc_profile.doctor_code.startswith("DOC-")

        receptionist = db.scalar(select(User).where(User.email == "receptionist@arogyavajra.com"))
        assert receptionist is not None
        assert receptionist.role == UserRole.RECEPTIONIST

        billing = db.scalar(select(User).where(User.email == "billing@arogyavajra.com"))
        assert billing is not None
        assert billing.role == UserRole.BILLING_STAFF

        patient = db.scalar(select(User).where(User.email == "patient@arogyavajra.com"))
        assert patient is not None
        assert patient.role == UserRole.PATIENT
        pat_profile = db.scalar(select(PatientProfile).where(PatientProfile.user_id == patient.id))
        assert pat_profile is not None
        assert pat_profile.patient_code.startswith("PAT-")

        # Rerun seed_accounts on the exact same database to confirm idempotency
        rerun_result = seed_accounts(db=db)
        assert rerun_result == result


def test_seed_accounts_custom_password():
    """Verify that seed_accounts respects custom password override without mutating shared test DB."""
    factory = get_sessionmaker()
    custom_pwd = "CustomDevPassword123!"
    with factory() as db, patch.object(db, "commit"):
        seed_accounts(db=db, password=custom_pwd)
        admin = db.scalar(select(User).where(User.email == "admin@arogyavajra.com"))
        assert admin is not None
        assert verify_password(custom_pwd, admin.password_hash)
        db.rollback()
