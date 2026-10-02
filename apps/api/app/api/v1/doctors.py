"""Doctor management API routes conforming to FRONTEND-BACKEND-CONTRACT and PRD."""

import uuid

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session

from app.api.deps import (
    get_current_user,
    require_admin,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.doctor import (
    DoctorCreate,
    DoctorDetailResponse,
    DoctorListResponse,
    DoctorResponse,
    DoctorUpdate,
    PaginationMeta,
)
from app.services.doctor import DoctorService

router = APIRouter(prefix="/doctors", tags=["Doctors"])


@router.get("", response_model=DoctorListResponse, summary="List and search doctors")
def list_doctors(
    search: str | None = Query(
        None, description="Global search query across name, spec, code"
    ),
    specialization: str | None = Query(
        None, description="Filter by doctor specialization"
    ),
    code: str | None = Query(
        None, description="Search by doctor code (e.g. DOC-00001)"
    ),
    name: str | None = Query(None, description="Search by doctor first or last name"),
    is_active: bool | None = Query(None, description="Filter by active status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve paginated doctor profiles with search filtering across name, specialization, code."""
    items, total, total_pages = DoctorService.list_doctors(
        db=db,
        current_user=current_user,
        search=search,
        name=name,
        specialization=specialization,
        code=code,
        is_active=is_active,
        page=page,
        page_size=page_size,
    )

    serialized = [DoctorResponse.from_orm_model(d) for d in items]
    return DoctorListResponse(
        data=serialized,
        pagination=PaginationMeta(
            page=page,
            page_size=page_size,
            total=total,
            total_pages=total_pages,
        ),
        message="Doctors retrieved successfully.",
    )


@router.post(
    "",
    response_model=DoctorDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new doctor profile (Admin only)",
)
def create_doctor(
    data: DoctorCreate,
    request: Request,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Register a new doctor profile with auto-generated code DOC-00001 and audit trail."""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    doctor = DoctorService.create_doctor(
        db=db,
        data=data,
        current_user=current_user,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.commit()

    return DoctorDetailResponse(
        data=DoctorResponse.from_orm_model(doctor),
        message="Doctor profile created successfully.",
    )


@router.get(
    "/{doctor_id}",
    response_model=DoctorDetailResponse,
    summary="Get doctor profile details",
)
def get_doctor(
    doctor_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve doctor profile details by ID."""
    doctor = DoctorService.get_doctor(
        db=db, doctor_id=doctor_id, current_user=current_user
    )
    return DoctorDetailResponse(
        data=DoctorResponse.from_orm_model(doctor),
        message="Doctor profile retrieved successfully.",
    )


@router.put(
    "/{doctor_id}",
    response_model=DoctorDetailResponse,
    summary="Update doctor profile",
)
def update_doctor(
    doctor_id: uuid.UUID,
    data: DoctorUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update doctor profile details (Admin or self doctor only)."""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    updated = DoctorService.update_doctor(
        db=db,
        doctor_id=doctor_id,
        data=data,
        current_user=current_user,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.commit()

    return DoctorDetailResponse(
        data=DoctorResponse.from_orm_model(updated),
        message="Doctor profile updated successfully.",
    )


@router.delete(
    "/{doctor_id}",
    summary="Delete doctor profile (Admin only)",
)
def delete_doctor(
    doctor_id: uuid.UUID,
    request: Request,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Delete doctor profile (restricted to administrators only)."""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    DoctorService.delete_doctor(
        db=db,
        doctor_id=doctor_id,
        current_user=current_user,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.commit()

    return {"message": "Doctor profile deleted successfully."}
