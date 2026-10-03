"""Patient management API routes conforming to FRONTEND-BACKEND-CONTRACT and TRD."""

import uuid

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session

from app.api.deps import (
    get_current_user,
    verify_billing_resource_access,
    verify_patient_resource_access,
)
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.patient import (
    PaginationMeta,
    PatientCreate,
    PatientDetailResponse,
    PatientListResponse,
    PatientResponse,
    PatientSubresourceListResponse,
    PatientUpdate,
)

from app.repositories.appointment import AppointmentRepository
from app.repositories.medical_record import MedicalRecordRepository
from app.repositories.prescription import PrescriptionRepository
from app.repositories.invoice import InvoiceRepository
from app.schemas.appointment import AppointmentResponse
from app.schemas.medical_record import MedicalRecordResponse
from app.schemas.prescription import PrescriptionResponse
from app.schemas.invoice import InvoiceResponse

from app.services.patient import PatientService

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.get("", response_model=PatientListResponse, summary="List and search patients")
def list_patients(
    search: str | None = Query(None, description="Global search query"),
    code: str | None = Query(None, description="Search by patient code"),
    name: str | None = Query(None, description="Search by first or last name"),
    phone: str | None = Query(None, description="Search by phone number"),
    email: str | None = Query(None, description="Search by user email"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve paginated patient profiles with search filtering across code, name, phone, email."""
    items, total, total_pages = PatientService.list_patients(
        db=db,
        current_user=current_user,
        search=search,
        code=code,
        name=name,
        phone=phone,
        email=email,
        page=page,
        page_size=page_size,
    )

    serialized = [PatientResponse.from_orm_model(p) for p in items]
    return PatientListResponse(
        data=serialized,
        pagination=PaginationMeta(
            page=page,
            page_size=page_size,
            total=total,
            total_pages=total_pages,
        ),
        message="Patients retrieved successfully.",
    )


@router.post(
    "",
    response_model=PatientDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new patient profile",
)
def create_patient(
    data: PatientCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Register a new patient profile with auto-generated patient code (e.g., PAT-00001)."""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    patient = PatientService.create_patient(
        db=db,
        data=data,
        current_user=current_user,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.commit()

    return PatientDetailResponse(
        data=PatientResponse.from_orm_model(patient),
        message="Patient created successfully.",
    )


@router.get(
    "/{patient_id}",
    response_model=PatientDetailResponse,
    summary="Get patient profile by ID",
)
def get_patient(
    patient_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve detailed demographics for a single patient enforcing relationship security."""
    patient = PatientService.get_patient(
        db=db,
        patient_id=patient_id,
        current_user=current_user,
    )
    return PatientDetailResponse(
        data=PatientResponse.from_orm_model(patient),
        message="Patient profile retrieved successfully.",
    )


@router.put(
    "/{patient_id}",
    response_model=PatientDetailResponse,
    summary="Update patient profile",
)
def update_patient(
    patient_id: uuid.UUID,
    data: PatientUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update patient demographic information and log audit event."""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    updated = PatientService.update_patient(
        db=db,
        patient_id=patient_id,
        data=data,
        current_user=current_user,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.commit()

    return PatientDetailResponse(
        data=PatientResponse.from_orm_model(updated),
        message="Patient profile updated successfully.",
    )


@router.delete("/{patient_id}", summary="Delete patient profile (admin restricted)")
def delete_patient(
    patient_id: uuid.UUID,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete patient profile (restricted to administrators only)."""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    PatientService.delete_patient(
        db=db,
        patient_id=patient_id,
        current_user=current_user,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.commit()

    return {"message": "Patient profile deleted successfully."}


# --- Subresource Retrieval Integration Endpoints ---


@router.get(
    "/{patient_id}/appointments",
    response_model=PatientSubresourceListResponse,
    summary="Get patient appointments",
)
def get_patient_appointments(
    patient_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieval integration for patient appointments."""
    patient = PatientService.get_patient(
        db=db, patient_id=patient_id, current_user=current_user
    )
    verify_patient_resource_access(
        user=current_user,
        patient_user_id=patient.user_id,
        allowed_clinical_roles=(
            UserRole.DOCTOR,
            UserRole.RECEPTIONIST,
            UserRole.BILLING_STAFF,
            UserRole.ADMIN,
        ),
    )
    appointments, _ = AppointmentRepository.search(db=db, patient_id=patient_id, skip=0, limit=100)
    return PatientSubresourceListResponse(
        data=[AppointmentResponse.model_validate(a).model_dump(mode="json") for a in appointments],
        message="Patient appointments retrieved successfully.",
    )


@router.get(
    "/{patient_id}/medical-records",
    response_model=PatientSubresourceListResponse,
    summary="Get patient medical records",
)
def get_patient_medical_records(
    patient_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieval integration for patient medical records."""
    patient = PatientService.get_patient(
        db=db, patient_id=patient_id, current_user=current_user
    )
    # Billing staff cannot view medical records
    verify_patient_resource_access(
        user=current_user,
        patient_user_id=patient.user_id,
        allowed_clinical_roles=(
            UserRole.DOCTOR,
            UserRole.RECEPTIONIST,
            UserRole.ADMIN,
        ),
    )
    records, _ = MedicalRecordRepository.search(db=db, patient_id=patient_id, skip=0, limit=100)
    return PatientSubresourceListResponse(
        data=[MedicalRecordResponse.model_validate(r).model_dump(mode="json") for r in records],
        message="Patient medical records retrieved successfully.",
    )


@router.get(
    "/{patient_id}/prescriptions",
    response_model=PatientSubresourceListResponse,
    summary="Get patient prescriptions",
)
def get_patient_prescriptions(
    patient_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieval integration for patient prescriptions."""
    patient = PatientService.get_patient(
        db=db, patient_id=patient_id, current_user=current_user
    )
    verify_patient_resource_access(
        user=current_user,
        patient_user_id=patient.user_id,
        allowed_clinical_roles=(
            UserRole.DOCTOR,
            UserRole.RECEPTIONIST,
            UserRole.ADMIN,
        ),
    )
    prescriptions, _ = PrescriptionRepository.search(db=db, patient_id=patient_id, skip=0, limit=100)
    return PatientSubresourceListResponse(
        data=[PrescriptionResponse.model_validate(p).model_dump(mode="json") for p in prescriptions],
        message="Patient prescriptions retrieved successfully.",
    )


@router.get(
    "/{patient_id}/invoices",
    response_model=PatientSubresourceListResponse,
    summary="Get patient invoices",
)
def get_patient_invoices(
    patient_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieval integration for patient invoices."""
    patient = PatientService.get_patient(
        db=db, patient_id=patient_id, current_user=current_user
    )
    verify_billing_resource_access(
        user=current_user,
        patient_user_id=patient.user_id,
    )
    invoices, _ = InvoiceRepository.search(db=db, patient_id=patient_id, skip=0, limit=100)
    return PatientSubresourceListResponse(
        data=[InvoiceResponse.model_validate(i).model_dump(mode="json") for i in invoices],
        message="Patient invoices retrieved successfully.",
    )
