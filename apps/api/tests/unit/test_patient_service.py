"""Unit tests for patient schemas, code generation, and audit logging."""

import uuid
from datetime import UTC, date, datetime

from app.models.patient import PatientProfile
from app.models.user import User, UserRole
from app.schemas.patient import (
    PaginationMeta,
    PatientCreate,
    PatientResponse,
    PatientUpdate,
)


def test_patient_create_schema_validation():
    payload = PatientCreate(
        first_name="Bhumi",
        last_name="Patel",
        date_of_birth=date(1995, 8, 14),
        gender="FEMALE",
        phone="+919876543210",
        email="bhumi@example.com",
    )
    assert payload.first_name == "Bhumi"
    assert payload.phone == "+919876543210"


def test_patient_update_schema_partial():
    update_data = PatientUpdate(phone="+919999999999", address="New Clinical Address")
    dumped = update_data.model_dump(exclude_unset=True)
    assert "phone" in dumped
    assert "address" in dumped
    assert "first_name" not in dumped


def test_pagination_meta_calculation():
    meta = PaginationMeta(
        page=2,
        page_size=20,
        total=45,
        total_pages=3,
    )
    assert meta.page == 2
    assert meta.total == 45
    assert meta.total_pages == 3


def test_patient_response_serialization():
    user = User(
        id=uuid.uuid4(),
        email="patient@example.com",
        password_hash="hashed",
        role=UserRole.PATIENT,
    )
    patient = PatientProfile(
        id=uuid.uuid4(),
        user_id=user.id,
        patient_code="PAT-00001",
        first_name="John",
        last_name="Doe",
        date_of_birth=date(1980, 1, 1),
        gender="MALE",
        phone="555-0100",
        address="123 Hospital St",
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    patient.user = user

    res = PatientResponse.from_orm_model(patient)
    assert res.patient_code == "PAT-00001"
    assert res.email == "patient@example.com"
    assert res.first_name == "John"
