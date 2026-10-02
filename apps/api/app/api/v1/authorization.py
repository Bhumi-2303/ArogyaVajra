"""Authorization inspection and verification endpoints for testing and runtime RBAC validation."""

from typing import Any

from fastapi import APIRouter, Depends, Header, Query

from app.api.deps import (
    get_current_user,
    require_admin,
    require_clinical_staff,
    require_doctor,
    require_permissions,
    verify_patient_resource_access,
)
from app.core.permissions import Permission, get_role_permissions
from app.models.user import User

router = APIRouter(prefix="/authz", tags=["Authorization"])


@router.get("/admin", summary="Admin authorization check")
def check_admin(user: User = Depends(require_admin)):
    """Only users with verified ADMIN role in the database can access."""
    return {"message": "Admin authorization verified", "role": user.role.value}


@router.get("/doctor", summary="Doctor authorization check")
def check_doctor(user: User = Depends(require_doctor)):
    """Only users with verified DOCTOR role can access."""
    return {"message": "Doctor authorization verified", "role": user.role.value}


@router.get("/clinical-staff", summary="Clinical staff authorization check")
def check_clinical_staff(user: User = Depends(require_clinical_staff)):
    """Only DOCTOR, RECEPTIONIST, or ADMIN users can access."""
    return {"message": "Clinical staff authorization verified", "role": user.role.value}


@router.get("/permissions", summary="Current user resolved permissions")
def get_user_permissions(user: User = Depends(get_current_user)):
    """Resolve and return granted permissions for current authenticated user."""
    perms = get_role_permissions(user.role)
    return {
        "role": user.role.value,
        "permissions": sorted(p.value for p in perms),
    }


@router.get("/invoices-write", summary="Invoice write permission check")
def check_invoice_write(
    user: User = Depends(require_permissions(Permission.INVOICES_WRITE)),
):
    """Requires INVOICES_WRITE permission (granted to BILLING_STAFF and ADMIN)."""
    return {"message": "Invoice write authorization verified", "role": user.role.value}


@router.get("/patient-record/{patient_id}", summary="Patient resource access check")
def check_patient_resource(
    patient_id: str,
    user: User = Depends(get_current_user),
):
    """Requires patient to own the resource or user to have clinical staff bypass role."""
    verify_patient_resource_access(user, patient_id)
    return {"message": "Patient resource access verified", "patient_id": patient_id}


@router.post("/untrusted-client-role", summary="Verify immunity to client role claims")
def check_untrusted_client_role(
    payload: dict[str, Any] | None = None,
    claimed_role: str | None = Query(None, alias="role"),
    header_role: str | None = Header(None, alias="X-User-Role"),
    user: User = Depends(require_admin),
):
    """Strictly enforces that query param, header, or body claims cannot elevate privileges."""
    return {
        "verified_role": user.role.value,
        "claimed_role_query": claimed_role,
        "claimed_role_header": header_role,
        "claimed_role_body": payload.get("role") if payload else None,
    }
