"""Role-based access control (RBAC) permission definitions and mapping matrix.

Conforms strictly to Arogyavajra TRD Section 10/11 and APP-FLOW Section 21.
"""

from collections.abc import Iterable
from enum import Enum

from app.models.user import UserRole


class Permission(str, Enum):
    """Granular system permissions covering clinical, administrative, and billing actions."""

    # Administration & Audit
    USERS_READ = "users:read"
    USERS_WRITE = "users:write"
    AUDIT_LOGS_READ = "audit_logs:read"

    # Profile & Dashboard
    DASHBOARD_READ = "dashboard:read"
    PROFILE_READ = "profile:read"
    PROFILE_WRITE = "profile:write"

    # Clinical Patient & Doctor Management
    PATIENTS_READ = "patients:read"
    PATIENTS_WRITE = "patients:write"
    DOCTORS_READ = "doctors:read"
    DOCTORS_WRITE = "doctors:write"

    # Appointments & Scheduling
    APPOINTMENTS_READ = "appointments:read"
    APPOINTMENTS_WRITE = "appointments:write"
    AVAILABILITY_READ = "availability:read"
    AVAILABILITY_WRITE = "availability:write"

    # Clinical Documentation
    RECORDS_READ = "records:read"
    RECORDS_WRITE = "records:write"
    PRESCRIPTIONS_READ = "prescriptions:read"
    PRESCRIPTIONS_WRITE = "prescriptions:write"

    # Financial & Billing
    INVOICES_READ = "invoices:read"
    INVOICES_WRITE = "invoices:write"
    PAYMENTS_READ = "payments:read"
    PAYMENTS_WRITE = "payments:write"


# Authoritative mapping between the 5 clinical roles and permitted capabilities
ROLE_PERMISSIONS: dict[UserRole, set[Permission]] = {
    UserRole.ADMIN: set(Permission),
    UserRole.DOCTOR: {
        Permission.DASHBOARD_READ,
        Permission.PROFILE_READ,
        Permission.PROFILE_WRITE,
        Permission.PATIENTS_READ,
        Permission.DOCTORS_READ,
        Permission.APPOINTMENTS_READ,
        Permission.APPOINTMENTS_WRITE,
        Permission.AVAILABILITY_READ,
        Permission.AVAILABILITY_WRITE,
        Permission.RECORDS_READ,
        Permission.RECORDS_WRITE,
        Permission.PRESCRIPTIONS_READ,
        Permission.PRESCRIPTIONS_WRITE,
    },
    UserRole.RECEPTIONIST: {
        Permission.DASHBOARD_READ,
        Permission.PROFILE_READ,
        Permission.PROFILE_WRITE,
        Permission.PATIENTS_READ,
        Permission.PATIENTS_WRITE,
        Permission.DOCTORS_READ,
        Permission.APPOINTMENTS_READ,
        Permission.APPOINTMENTS_WRITE,
        Permission.AVAILABILITY_READ,
        Permission.RECORDS_READ,
        Permission.PRESCRIPTIONS_READ,
    },
    UserRole.BILLING_STAFF: {
        Permission.DASHBOARD_READ,
        Permission.PROFILE_READ,
        Permission.PROFILE_WRITE,
        Permission.PATIENTS_READ,
        Permission.DOCTORS_READ,
        Permission.APPOINTMENTS_READ,
        Permission.INVOICES_READ,
        Permission.INVOICES_WRITE,
        Permission.PAYMENTS_READ,
        Permission.PAYMENTS_WRITE,
    },
    UserRole.PATIENT: {
        Permission.DASHBOARD_READ,
        Permission.PROFILE_READ,
        Permission.PROFILE_WRITE,
        Permission.DOCTORS_READ,
        Permission.APPOINTMENTS_READ,
        Permission.APPOINTMENTS_WRITE,
        Permission.RECORDS_READ,
        Permission.PRESCRIPTIONS_READ,
        Permission.INVOICES_READ,
        Permission.PAYMENTS_READ,
    },
}


def get_role_permissions(role: UserRole) -> set[Permission]:
    """Retrieve all granted permissions for a given UserRole."""
    return ROLE_PERMISSIONS.get(role, set()).copy()


def has_permission(role: UserRole, permission: Permission) -> bool:
    """Check if a UserRole possesses a specific permission."""
    return permission in ROLE_PERMISSIONS.get(role, set())


def has_all_permissions(role: UserRole, permissions: Iterable[Permission]) -> bool:
    """Check if a UserRole possesses every permission in the given collection."""
    granted = ROLE_PERMISSIONS.get(role, set())
    return all(p in granted for p in permissions)


def has_any_permission(role: UserRole, permissions: Iterable[Permission]) -> bool:
    """Check if a UserRole possesses at least one permission from the given collection."""
    granted = ROLE_PERMISSIONS.get(role, set())
    return any(p in granted for p in permissions)
