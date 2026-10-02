"""Resource-relationship authorization primitives and ownership verification engine.

Implements TRD Section 10 and FRONTEND-BACKEND-CONTRACT Section 40:
Request -> Authenticate User -> Resolve Role -> Check Permission -> Check Resource Relationship -> Execute Service.
"""

import uuid
from collections.abc import Iterable

from fastapi import HTTPException, status

from app.models.user import User, UserRole


def check_resource_ownership(
    user: User,
    resource_owner_id: uuid.UUID | str,
    bypass_roles: Iterable[UserRole] = (UserRole.ADMIN,),
) -> bool:
    """Evaluate whether the authenticated user owns the resource or has an authorized bypass role."""
    if user.role in bypass_roles:
        return True
    return str(user.id) == str(resource_owner_id)


def verify_resource_ownership(
    user: User,
    resource_owner_id: uuid.UUID | str,
    bypass_roles: Iterable[UserRole] = (UserRole.ADMIN,),
) -> None:
    """Enforce that the authenticated user owns the resource or has an authorized bypass role.

    Raises:
        HTTPException: 403 Forbidden if the user is neither owner nor granted bypass role.
    """
    if not check_resource_ownership(user, resource_owner_id, bypass_roles):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access to the requested resource is denied.",
        )


def verify_patient_resource_access(
    user: User,
    patient_user_id: uuid.UUID | str,
    allowed_clinical_roles: Iterable[UserRole] = (
        UserRole.DOCTOR,
        UserRole.RECEPTIONIST,
        UserRole.ADMIN,
    ),
) -> None:
    """Enforce that the user is the patient themselves or has an authorized clinical role.

    Raises:
        HTTPException: 403 Forbidden if unauthorized.
    """
    if str(user.id) == str(patient_user_id):
        return

    if user.role in allowed_clinical_roles:
        return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Unauthorized access to patient resource.",
    )


def verify_doctor_resource_access(
    user: User,
    doctor_user_id: uuid.UUID | str,
    allowed_staff_roles: Iterable[UserRole] = (
        UserRole.RECEPTIONIST,
        UserRole.ADMIN,
    ),
) -> None:
    """Enforce that the user is the doctor themselves or has an authorized staff role.

    Raises:
        HTTPException: 403 Forbidden if unauthorized.
    """
    if str(user.id) == str(doctor_user_id):
        return

    if user.role in allowed_staff_roles:
        return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Unauthorized access to doctor resource.",
    )


def verify_billing_resource_access(
    user: User,
    patient_user_id: uuid.UUID | str,
) -> None:
    """Enforce that the user is the patient viewing their own billing, or billing staff / admin.

    Raises:
        HTTPException: 403 Forbidden if unauthorized.
    """
    if str(user.id) == str(patient_user_id):
        return

    if user.role in (UserRole.BILLING_STAFF, UserRole.ADMIN):
        return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Unauthorized access to billing resource.",
    )
