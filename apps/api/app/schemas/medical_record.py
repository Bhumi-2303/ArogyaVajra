import datetime
import uuid
from typing import Optional

from pydantic import BaseModel, ConfigDict


class MedicalRecordBase(BaseModel):
    patient_id: uuid.UUID
    doctor_id: uuid.UUID
    appointment_id: Optional[uuid.UUID] = None
    record_date: datetime.date
    chief_complaint: Optional[str] = None
    clinical_notes: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment_notes: Optional[str] = None
    follow_up_date: Optional[datetime.date] = None


class MedicalRecordCreate(MedicalRecordBase):
    pass


class MedicalRecordUpdate(BaseModel):
    chief_complaint: Optional[str] = None
    clinical_notes: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment_notes: Optional[str] = None
    follow_up_date: Optional[datetime.date] = None


class MedicalRecordResponse(MedicalRecordBase):
    id: uuid.UUID
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class MedicalRecordListResponse(BaseModel):
    data: list[MedicalRecordResponse]
    message: str = "Medical records retrieved successfully."
    pagination: dict


class MedicalRecordDetailResponse(BaseModel):
    data: MedicalRecordResponse
    message: str = "Medical record retrieved successfully."
