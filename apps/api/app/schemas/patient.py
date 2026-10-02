"""Pydantic schemas for patient management domain."""

import uuid
from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class PaginationMeta(BaseModel):
    """Pagination metadata conforming to FRONTEND-BACKEND-CONTRACT Section 14."""

    page: int = Field(..., ge=1, description="Current page number (1-based)")
    page_size: int = Field(..., ge=1, le=100, description="Items per page")
    total: int = Field(..., ge=0, description="Total number of matching records")
    total_pages: int = Field(..., ge=0, description="Total number of pages")


class PatientBase(BaseModel):
    """Base demographic attributes for patient profiles."""

    first_name: str = Field(..., min_length=1, max_length=100, description="First name")
    last_name: str = Field(..., min_length=1, max_length=100, description="Last name")
    date_of_birth: date | None = Field(default=None, description="Date of birth")
    gender: str | None = Field(
        default=None, max_length=20, description="Gender (e.g. MALE, FEMALE, OTHER)"
    )
    phone: str | None = Field(
        default=None, max_length=20, description="Primary contact phone"
    )
    address: str | None = Field(default=None, description="Residential address")
    emergency_contact_name: str | None = Field(
        default=None, max_length=100, description="Emergency contact person"
    )
    emergency_contact_phone: str | None = Field(
        default=None, max_length=20, description="Emergency contact phone"
    )


class PatientCreate(PatientBase):
    """Payload to register a new patient."""

    email: EmailStr | None = Field(
        default=None,
        description="User email. If user account does not exist, one will be provisioned.",
    )
    user_id: uuid.UUID | None = Field(
        default=None,
        description="Associated user account ID if linking to an existing account.",
    )
    password: str | None = Field(
        default=None,
        min_length=8,
        description="Optional initial password if creating a new user account.",
    )


class PatientUpdate(BaseModel):
    """Payload to update an existing patient record."""

    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    date_of_birth: date | None = Field(default=None)
    gender: str | None = Field(default=None, max_length=20)
    phone: str | None = Field(default=None, max_length=20)
    address: str | None = Field(default=None)
    emergency_contact_name: str | None = Field(default=None, max_length=100)
    emergency_contact_phone: str | None = Field(default=None, max_length=20)


class PatientResponse(PatientBase):
    """Serialized patient profile returned by API."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    patient_code: str
    email: str | None = None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_orm_model(cls, profile: Any) -> "PatientResponse":
        return cls(
            id=profile.id,
            user_id=profile.user_id,
            patient_code=profile.patient_code,
            first_name=profile.first_name,
            last_name=profile.last_name,
            date_of_birth=profile.date_of_birth,
            gender=profile.gender,
            phone=profile.phone,
            address=profile.address,
            emergency_contact_name=profile.emergency_contact_name,
            emergency_contact_phone=profile.emergency_contact_phone,
            email=profile.user.email if getattr(profile, "user", None) else None,
            created_at=profile.created_at,
            updated_at=profile.updated_at,
        )


class PatientDetailResponse(BaseModel):
    """Standard envelope for a single patient."""

    data: PatientResponse
    message: str = "Patient profile retrieved successfully."


class PatientListResponse(BaseModel):
    """Standard envelope for paginated patient search results."""

    data: list[PatientResponse]
    pagination: PaginationMeta
    message: str = "Patients retrieved successfully."


class PatientSubresourceListResponse(BaseModel):
    """Generic envelope for patient retrieval integration (appointments, records, prescriptions, invoices)."""

    data: list[dict[str, Any]] = Field(default_factory=list)
    message: str = "Records retrieved successfully."
