"""Unit tests for DoctorProfile model."""

import uuid
from decimal import Decimal

import pytest

from app.models.doctor import DoctorProfile


@pytest.mark.unit
def test_doctor_profile_instantiation():
    """Verify DoctorProfile model instantiates and preserves all clinical attributes."""
    doc_id = uuid.uuid4()
    user_id = uuid.uuid4()

    doctor = DoctorProfile(
        id=doc_id,
        user_id=user_id,
        doctor_code="DOC-00001",
        first_name="Pooja",
        last_name="Nambiar",
        specialization="Cardiology",
        qualification="MBBS, MD (Cardiology)",
        license_number="MCI-12345",
        phone="+919876543210",
        consultation_fee=Decimal("750.00"),
        bio="Senior Consultant Cardiologist with 15+ years of clinical practice.",
    )

    assert doctor.id == doc_id
    assert doctor.user_id == user_id
    assert doctor.doctor_code == "DOC-00001"
    assert doctor.first_name == "Pooja"
    assert doctor.last_name == "Nambiar"
    assert doctor.specialization == "Cardiology"
    assert doctor.qualification == "MBBS, MD (Cardiology)"
    assert doctor.license_number == "MCI-12345"
    assert doctor.phone == "+919876543210"
    assert doctor.consultation_fee == Decimal("750.00")
    assert "Cardiology" in repr(doctor)
