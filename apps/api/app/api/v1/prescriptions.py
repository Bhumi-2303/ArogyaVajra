import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.prescription import (
    PrescriptionCreate,
    PrescriptionUpdate,
    PrescriptionResponse,
    PrescriptionListResponse,
    PrescriptionDetailResponse,
)
from app.services.prescription import PrescriptionService

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])


@router.post(
    "",
    response_model=PrescriptionDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a prescription",
)
def create_prescription(
    data: PrescriptionCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    prescription = PrescriptionService.create_prescription(
        db=db,
        data=data,
        current_user=current_user,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.commit()

    return PrescriptionDetailResponse(data=prescription)


@router.get(
    "",
    response_model=PrescriptionListResponse,
    summary="List prescriptions",
)
def list_prescriptions(
    patient_id: Optional[uuid.UUID] = Query(None, description="Filter by patient ID"),
    doctor_id: Optional[uuid.UUID] = Query(None, description="Filter by doctor ID"),
    appointment_id: Optional[uuid.UUID] = Query(None, description="Filter by appointment ID"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items, total = PrescriptionService.list_prescriptions(
        db=db,
        current_user=current_user,
        patient_id=patient_id,
        doctor_id=doctor_id,
        appointment_id=appointment_id,
        page=page,
        page_size=page_size,
    )

    total_pages = (total + page_size - 1) // page_size

    return PrescriptionListResponse(
        data=items,
        pagination={
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages,
        },
    )


@router.get(
    "/{prescription_id}",
    response_model=PrescriptionDetailResponse,
    summary="Get prescription details",
)
def get_prescription(
    prescription_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prescription = PrescriptionService.get_prescription(db, prescription_id, current_user)
    return PrescriptionDetailResponse(data=prescription)


@router.put(
    "/{prescription_id}",
    response_model=PrescriptionDetailResponse,
    summary="Update a prescription",
)
def update_prescription(
    prescription_id: uuid.UUID,
    data: PrescriptionUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    prescription = PrescriptionService.update_prescription(
        db=db,
        prescription_id=prescription_id,
        data=data,
        current_user=current_user,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.commit()

    return PrescriptionDetailResponse(data=prescription)


@router.post("/{prescription_id}/cancel", response_model=PrescriptionDetailResponse, summary="Cancel a prescription")
def cancel_prescription(
    prescription_id: uuid.UUID,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    from app.schemas.prescription import PrescriptionUpdate
    from app.models.prescription import PrescriptionStatus
    
    updated = PrescriptionService.update_prescription(
        db=db,
        prescription_id=prescription_id,
        data=PrescriptionUpdate(status=PrescriptionStatus.CANCELLED),
        current_user=current_user,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.commit()
    return PrescriptionDetailResponse(data=updated, message="Prescription cancelled.")
