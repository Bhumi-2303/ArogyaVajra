"""Unit tests for resource-relationship authorization primitives."""

import uuid

import pytest
from fastapi import HTTPException

from app.core.authorization import (
    check_resource_ownership,
    verify_billing_resource_access,
    verify_doctor_resource_access,
    verify_patient_resource_access,
    verify_resource_ownership,
)
from app.models.user import User, UserRole


def make_user(role: UserRole, user_id: uuid.UUID | None = None) -> User:
    user = User()
    user.id = user_id or uuid.uuid4()
    user.email = f"{role.value.lower()}_{user.id.hex[:6]}@example.com"
    user.role = role
    user.is_active = True
    return user


def test_resource_ownership_matching():
    owner_id = uuid.uuid4()
    owner_user = make_user(UserRole.PATIENT, user_id=owner_id)
    other_user = make_user(UserRole.PATIENT)
    admin_user = make_user(UserRole.ADMIN)

    # Owner has access
    assert check_resource_ownership(owner_user, owner_id) is True
    verify_resource_ownership(owner_user, owner_id)

    # Admin bypasses
    assert check_resource_ownership(admin_user, owner_id) is True
    verify_resource_ownership(admin_user, owner_id)

    # Other patient is rejected
    assert check_resource_ownership(other_user, owner_id) is False
    with pytest.raises(HTTPException) as exc_info:
        verify_resource_ownership(other_user, owner_id)
    assert exc_info.value.status_code == 403
    assert "Access to the requested resource is denied" in exc_info.value.detail


def test_patient_resource_access_rules():
    patient_id = uuid.uuid4()
    patient_user = make_user(UserRole.PATIENT, user_id=patient_id)
    other_patient = make_user(UserRole.PATIENT)
    doctor_user = make_user(UserRole.DOCTOR)
    receptionist_user = make_user(UserRole.RECEPTIONIST)
    admin_user = make_user(UserRole.ADMIN)
    billing_user = make_user(UserRole.BILLING_STAFF)

    # Permitted: Patient himself, Doctor, Receptionist, Admin
    verify_patient_resource_access(patient_user, patient_id)
    verify_patient_resource_access(doctor_user, patient_id)
    verify_patient_resource_access(receptionist_user, patient_id)
    verify_patient_resource_access(admin_user, patient_id)

    # Forbidden: Other patient
    with pytest.raises(HTTPException) as exc1:
        verify_patient_resource_access(other_patient, patient_id)
    assert exc1.value.status_code == 403

    # Forbidden: Billing staff for clinical record context
    with pytest.raises(HTTPException) as exc2:
        verify_patient_resource_access(billing_user, patient_id)
    assert exc2.value.status_code == 403


def test_doctor_resource_access_rules():
    doctor_id = uuid.uuid4()
    doctor_user = make_user(UserRole.DOCTOR, user_id=doctor_id)
    other_doctor = make_user(UserRole.DOCTOR)
    receptionist_user = make_user(UserRole.RECEPTIONIST)
    admin_user = make_user(UserRole.ADMIN)
    patient_user = make_user(UserRole.PATIENT)

    # Permitted: The doctor themselves, Receptionist, Admin
    verify_doctor_resource_access(doctor_user, doctor_id)
    verify_doctor_resource_access(receptionist_user, doctor_id)
    verify_doctor_resource_access(admin_user, doctor_id)

    # Forbidden: Another doctor attempting to manage/mutate doctor availability/profile
    with pytest.raises(HTTPException) as exc1:
        verify_doctor_resource_access(other_doctor, doctor_id)
    assert exc1.value.status_code == 403

    # Forbidden: Patient attempting to access doctor-management resource
    with pytest.raises(HTTPException) as exc2:
        verify_doctor_resource_access(patient_user, doctor_id)
    assert exc2.value.status_code == 403


def test_billing_resource_access_rules():
    patient_id = uuid.uuid4()
    patient_user = make_user(UserRole.PATIENT, user_id=patient_id)
    other_patient = make_user(UserRole.PATIENT)
    billing_user = make_user(UserRole.BILLING_STAFF)
    admin_user = make_user(UserRole.ADMIN)
    doctor_user = make_user(UserRole.DOCTOR)

    # Permitted: Patient viewing own billing, Billing staff, Admin
    verify_billing_resource_access(patient_user, patient_id)
    verify_billing_resource_access(billing_user, patient_id)
    verify_billing_resource_access(admin_user, patient_id)

    # Forbidden: Another patient
    with pytest.raises(HTTPException) as exc1:
        verify_billing_resource_access(other_patient, patient_id)
    assert exc1.value.status_code == 403

    # Forbidden: Doctor (billing is not clinical domain)
    with pytest.raises(HTTPException) as exc2:
        verify_billing_resource_access(doctor_user, patient_id)
    assert exc2.value.status_code == 403
