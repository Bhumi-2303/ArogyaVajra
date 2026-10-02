"""Unit tests for doctor domain schemas, validation, and serialization."""

from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.schemas.doctor import (
    DoctorCreate,
    DoctorUpdate,
)


@pytest.mark.unit
def test_doctor_create_schema_validation():
    """Verify DoctorCreate enforces mandatory fields and types."""
    # Valid schema with minimum required fields
    doc = DoctorCreate(
        first_name="Anita",
        last_name="Roy",
        specialization="Pediatrics",
        email="anita.roy@example.com",
    )
    assert doc.first_name == "Anita"
    assert doc.specialization == "Pediatrics"
    assert doc.consultation_fee == Decimal("0.00")

    # Missing specialization raises ValidationError
    with pytest.raises(ValidationError):
        DoctorCreate(
            first_name="Anita",
            last_name="Roy",
            email="anita.roy@example.com",
        )  # type: ignore[call-arg]

    # Negative consultation fee rejected
    with pytest.raises(ValidationError):
        DoctorCreate(
            first_name="Anita",
            last_name="Roy",
            specialization="Pediatrics",
            consultation_fee=Decimal("-50.00"),
        )


@pytest.mark.unit
def test_doctor_update_partial_fields():
    """Verify DoctorUpdate supports partial updates."""
    up = DoctorUpdate(
        specialization="Cardiology",
        consultation_fee=Decimal("1200.00"),
    )
    assert up.specialization == "Cardiology"
    assert up.consultation_fee == Decimal("1200.00")
    assert up.first_name is None
    assert up.phone is None
