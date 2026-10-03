import uuid
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.availability import (
    DoctorAvailabilityCreate,
    DoctorAvailabilityDetailResponse,
    DoctorAvailabilityListResponse,
    DoctorAvailabilityUpdate,
)
from app.services.availability import AvailabilityService


router = APIRouter(prefix="/doctors/{doctor_id}/availability", tags=["Doctor Availability"])


@router.get("", response_model=DoctorAvailabilityListResponse, summary="List doctor availability slots")
def list_availability(
    doctor_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve all weekly availability slots for a given doctor."""
    slots = AvailabilityService.list_availability(db, doctor_id, current_user)
    return DoctorAvailabilityListResponse(data=slots)


@router.post(
    "",
    response_model=DoctorAvailabilityDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a doctor availability slot",
)
def create_availability(
    doctor_id: uuid.UUID,
    data: DoctorAvailabilityCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new recurring availability slot for a doctor."""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    slot = AvailabilityService.create_availability(
        db=db,
        doctor_id=doctor_id,
        data=data,
        current_user=current_user,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.commit()
    return DoctorAvailabilityDetailResponse(
        data=slot,
        message="Availability slot created successfully."
    )


@router.put(
    "/{slot_id}",
    response_model=DoctorAvailabilityDetailResponse,
    summary="Update a doctor availability slot",
)
def update_availability(
    doctor_id: uuid.UUID,
    slot_id: uuid.UUID,
    data: DoctorAvailabilityUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update an existing recurring availability slot."""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    slot = AvailabilityService.update_availability(
        db=db,
        doctor_id=doctor_id,
        slot_id=slot_id,
        data=data,
        current_user=current_user,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.commit()
    return DoctorAvailabilityDetailResponse(
        data=slot,
        message="Availability slot updated successfully."
    )


@router.delete(
    "/{slot_id}",
    summary="Delete a doctor availability slot",
)
def delete_availability(
    doctor_id: uuid.UUID,
    slot_id: uuid.UUID,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete an availability slot."""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    AvailabilityService.delete_availability(
        db=db,
        doctor_id=doctor_id,
        slot_id=slot_id,
        current_user=current_user,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.commit()
    return {"message": "Availability slot deleted successfully."}
