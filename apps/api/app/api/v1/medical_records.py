import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.medical_record import (
    MedicalRecordCreate,
    MedicalRecordUpdate,
    MedicalRecordResponse,
    MedicalRecordListResponse,
    MedicalRecordDetailResponse,
)
from app.services.medical_record import MedicalRecordService

router = APIRouter(prefix="/medical-records", tags=["Medical Records"])


@router.post(
    "",
    response_model=MedicalRecordDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a medical record",
)
def create_medical_record(
    data: MedicalRecordCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    record = MedicalRecordService.create_record(
        db=db,
        data=data,
        current_user=current_user,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.commit()

    return MedicalRecordDetailResponse(data=record)


@router.get(
    "",
    response_model=MedicalRecordListResponse,
    summary="List medical records",
)
def list_medical_records(
    patient_id: Optional[uuid.UUID] = Query(None, description="Filter by patient ID"),
    doctor_id: Optional[uuid.UUID] = Query(None, description="Filter by doctor ID"),
    appointment_id: Optional[uuid.UUID] = Query(None, description="Filter by appointment ID"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items, total = MedicalRecordService.list_records(
        db=db,
        current_user=current_user,
        patient_id=patient_id,
        doctor_id=doctor_id,
        appointment_id=appointment_id,
        page=page,
        page_size=page_size,
    )

    total_pages = (total + page_size - 1) // page_size

    return MedicalRecordListResponse(
        data=items,
        pagination={
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages,
        },
    )


@router.get(
    "/{record_id}",
    response_model=MedicalRecordDetailResponse,
    summary="Get medical record details",
)
def get_medical_record(
    record_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = MedicalRecordService.get_record(db, record_id, current_user)
    return MedicalRecordDetailResponse(data=record)


@router.put(
    "/{record_id}",
    response_model=MedicalRecordDetailResponse,
    summary="Update a medical record",
)
def update_medical_record(
    record_id: uuid.UUID,
    data: MedicalRecordUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    record = MedicalRecordService.update_record(
        db=db,
        record_id=record_id,
        data=data,
        current_user=current_user,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.commit()

    return MedicalRecordDetailResponse(data=record)
