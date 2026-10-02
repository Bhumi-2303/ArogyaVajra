"""Unit tests for PatientProfile and AuditLog model definitions."""

import uuid
from datetime import date

from app.models.audit_log import AuditLog
from app.models.patient import PatientProfile
from app.models.user import User, UserRole


def test_patient_profile_instantiation():
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
        first_name="Bhumi",
        last_name="Patel",
        date_of_birth=date(1995, 5, 20),
        gender="FEMALE",
        phone="+919876543210",
        address="123 Health Ave",
        emergency_contact_name="Emergency Contact",
        emergency_contact_phone="+919876543211",
    )
    patient.user = user

    assert patient.full_name == "Bhumi Patel"
    assert patient.patient_code == "PAT-00001"
    assert patient.user.email == "patient@example.com"
    assert "PAT-00001" in repr(patient)


def test_audit_log_instantiation():
    user_id = uuid.uuid4()
    audit = AuditLog(
        id=uuid.uuid4(),
        user_id=user_id,
        action="PATIENT_CREATE",
        entity_type="patient_profile",
        entity_id="test-entity-id",
        old_values=None,
        new_values={"patient_code": "PAT-00001", "name": "Bhumi Patel"},
        ip_address="127.0.0.1",
        user_agent="Mozilla/5.0",
    )

    assert audit.action == "PATIENT_CREATE"
    assert audit.entity_type == "patient_profile"
    assert audit.new_values["patient_code"] == "PAT-00001"
    assert "PATIENT_CREATE" in repr(audit)
