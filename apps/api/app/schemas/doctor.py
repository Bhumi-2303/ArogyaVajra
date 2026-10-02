"""Pydantic schemas for doctor management domain."""

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.doctor import DoctorProfile
from app.schemas.patient import PaginationMeta


class DoctorBase(BaseModel):
    """Core professional and credential attributes for doctors."""

    first_name: str = Field(..., min_length=1, max_length=100, description="First name")
    last_name: str = Field(..., min_length=1, max_length=100, description="Last name")
    specialization: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Medical specialty (e.g. Cardiology, Neurology)",
    )
    qualification: str | None = Field(
        default=None, max_length=100, description="Degrees and clinical qualifications"
    )
    license_number: str | None = Field(
        default=None,
        max_length=50,
        description="Medical council registration or license number",
    )
    phone: str | None = Field(
        default=None, max_length=20, description="Professional contact phone number"
    )
    consultation_fee: Decimal = Field(
        default=Decimal("0.00"),
        ge=Decimal("0.00"),
        description="Standard consultation fee",
    )
    bio: str | None = Field(
        default=None, description="Professional summary and clinical experience"
    )


class DoctorCreate(DoctorBase):
    """Payload for provisioning or registering a new doctor profile."""

    user_id: uuid.UUID | None = Field(
        default=None, description="Optional existing user account ID to link"
    )
    email: EmailStr | None = Field(
        default=None, description="Email for user account provisioning"
    )
    password: str | None = Field(
        default=None,
        min_length=8,
        description="Initial password if provisioning new user account",
    )


class DoctorUpdate(BaseModel):
    """Payload for updating an existing doctor profile."""

    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    specialization: str | None = Field(default=None, min_length=1, max_length=100)
    qualification: str | None = Field(default=None, max_length=100)
    license_number: str | None = Field(default=None, max_length=50)
    phone: str | None = Field(default=None, max_length=20)
    consultation_fee: Decimal | None = Field(default=None, ge=Decimal("0.00"))
    bio: str | None = Field(default=None)
    is_active: bool | None = Field(default=None, description="Account active status")


class DoctorResponse(BaseModel):
    """Safe public representation of a DoctorProfile entity."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    doctor_code: str
    first_name: str
    last_name: str
    specialization: str
    qualification: str | None = None
    license_number: str | None = None
    phone: str | None = None
    consultation_fee: Decimal = Decimal("0.00")
    bio: str | None = None
    email: EmailStr | None = None
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_orm_model(cls, doctor: DoctorProfile) -> "DoctorResponse":
        """Factory mapping DoctorProfile ORM entity and associated User attributes."""
        email = doctor.user.email if doctor.user else None
        is_active = doctor.user.is_active if doctor.user else True
        return cls(
            id=doctor.id,
            user_id=doctor.user_id,
            doctor_code=doctor.doctor_code,
            first_name=doctor.first_name,
            last_name=doctor.last_name,
            specialization=doctor.specialization,
            qualification=doctor.qualification,
            license_number=doctor.license_number,
            phone=doctor.phone,
            consultation_fee=doctor.consultation_fee,
            bio=doctor.bio,
            email=email,
            is_active=is_active,
            created_at=doctor.created_at,
            updated_at=doctor.updated_at,
        )


class DoctorDetailResponse(BaseModel):
    """Standard envelope for single doctor profile responses."""

    data: DoctorResponse
    message: str = "Doctor retrieved successfully."


class DoctorListResponse(BaseModel):
    """Standard envelope for paginated doctor directory responses."""

    data: list[DoctorResponse]
    pagination: PaginationMeta
    message: str = "Doctors retrieved successfully."
