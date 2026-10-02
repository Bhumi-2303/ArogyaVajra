"""Unit tests for RBAC permissions model and capability matrix."""

from app.core.permissions import (
    ROLE_PERMISSIONS,
    Permission,
    get_role_permissions,
    has_all_permissions,
    has_any_permission,
    has_permission,
)
from app.models.user import UserRole


def test_all_five_roles_mapped_in_matrix():
    assert len(ROLE_PERMISSIONS) == 5
    for role in UserRole:
        assert role in ROLE_PERMISSIONS


def test_admin_has_all_permissions():
    admin_perms = get_role_permissions(UserRole.ADMIN)
    assert admin_perms == set(Permission)
    assert has_permission(UserRole.ADMIN, Permission.USERS_WRITE)
    assert has_permission(UserRole.ADMIN, Permission.AUDIT_LOGS_READ)


def test_doctor_clinical_permissions():
    assert has_permission(UserRole.DOCTOR, Permission.RECORDS_WRITE)
    assert has_permission(UserRole.DOCTOR, Permission.PRESCRIPTIONS_WRITE)
    assert has_permission(UserRole.DOCTOR, Permission.AVAILABILITY_WRITE)

    # Doctor cannot manage users or write invoices
    assert not has_permission(UserRole.DOCTOR, Permission.USERS_WRITE)
    assert not has_permission(UserRole.DOCTOR, Permission.INVOICES_WRITE)
    assert not has_permission(UserRole.DOCTOR, Permission.AUDIT_LOGS_READ)


def test_billing_staff_permissions():
    assert has_permission(UserRole.BILLING_STAFF, Permission.INVOICES_WRITE)
    assert has_permission(UserRole.BILLING_STAFF, Permission.PAYMENTS_WRITE)

    # Billing staff cannot write medical records or change doctor availability
    assert not has_permission(UserRole.BILLING_STAFF, Permission.RECORDS_WRITE)
    assert not has_permission(UserRole.BILLING_STAFF, Permission.AVAILABILITY_WRITE)
    assert not has_permission(UserRole.BILLING_STAFF, Permission.USERS_WRITE)


def test_patient_permissions():
    assert has_permission(UserRole.PATIENT, Permission.APPOINTMENTS_READ)
    assert has_permission(UserRole.PATIENT, Permission.APPOINTMENTS_WRITE)
    assert has_permission(UserRole.PATIENT, Permission.RECORDS_READ)
    assert has_permission(UserRole.PATIENT, Permission.INVOICES_READ)

    # Patient cannot write clinical records, write invoices, or manage doctors
    assert not has_permission(UserRole.PATIENT, Permission.RECORDS_WRITE)
    assert not has_permission(UserRole.PATIENT, Permission.INVOICES_WRITE)
    assert not has_permission(UserRole.PATIENT, Permission.DOCTORS_WRITE)
    assert not has_permission(UserRole.PATIENT, Permission.USERS_READ)


def test_has_all_and_any_permissions_helpers():
    clinical_write = [Permission.RECORDS_WRITE, Permission.PRESCRIPTIONS_WRITE]

    # Doctor has all clinical write permissions
    assert has_all_permissions(UserRole.DOCTOR, clinical_write)
    # Patient does not have all clinical write permissions
    assert not has_all_permissions(UserRole.PATIENT, clinical_write)

    mixed = [Permission.INVOICES_WRITE, Permission.RECORDS_WRITE]
    # Doctor has at least one (RECORDS_WRITE)
    assert has_any_permission(UserRole.DOCTOR, mixed)
    # Billing staff has at least one (INVOICES_WRITE)
    assert has_any_permission(UserRole.BILLING_STAFF, mixed)
    # Patient has neither
    assert not has_any_permission(UserRole.PATIENT, mixed)
