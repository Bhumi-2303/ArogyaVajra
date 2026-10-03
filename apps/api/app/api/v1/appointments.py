import datetime
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.appointment import AppointmentStatus
from app.models.user import User
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentDetailResponse,
    AppointmentListResponse,
    AppointmentUpdate,
)
from app.services.appointment import AppointmentService

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.post(
    "",
    response_model=AppointmentDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create an appointment",
)
def create_appointment(
    data: AppointmentCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    appointment = AppointmentService.create_appointment(
        db=db,
        data=data,
        current_user=current_user,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.commit()

    return AppointmentDetailResponse(data=appointment)


@router.get(
    "",
    response_model=AppointmentListResponse,
    summary="List appointments",
)
def list_appointments(
    patient_id: Optional[uuid.UUID] = Query(None, description="Filter by patient ID"),
    doctor_id: Optional[uuid.UUID] = Query(None, description="Filter by doctor ID"),
    date: Optional[datetime.date] = Query(None, description="Filter by date"),
    status: Optional[AppointmentStatus] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items, total = AppointmentService.list_appointments(
        db=db,
        current_user=current_user,
        patient_id=patient_id,
        doctor_id=doctor_id,
        date=date,
        status_filter=status,
        page=page,
        page_size=page_size,
    )

    total_pages = (total + page_size - 1) // page_size

    return AppointmentListResponse(
        data=items,
        pagination={
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages,
        },
    )


@router.get(
    "/{appointment_id}",
    response_model=AppointmentDetailResponse,
    summary="Get appointment details",
)
def get_appointment(
    appointment_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appointment = AppointmentService.get_appointment(db, appointment_id, current_user)
    return AppointmentDetailResponse(data=appointment)


@router.put(
    "/{appointment_id}",
    response_model=AppointmentDetailResponse,
    summary="Update an appointment",
)
def update_appointment(
    appointment_id: uuid.UUID,
    data: AppointmentUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    appointment = AppointmentService.update_appointment(
        db=db,
        appointment_id=appointment_id,
        data=data,
        current_user=current_user,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.commit()

    return AppointmentDetailResponse(data=appointment)
