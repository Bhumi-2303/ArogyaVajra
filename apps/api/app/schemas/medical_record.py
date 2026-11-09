import datetime
import uuid

from pydantic import BaseModel, ConfigDict


class MedicalRecordBase(BaseModel):
    patient_id: uuid.UUID
    doctor_id: uuid.UUID
    appointment_id: uuid.UUID | None = None
    record_date: datetime.date
    chief_complaint: str | None = None
    clinical_notes: str | None = None
    diagnosis: str | None = None
    treatment_notes: str | None = None
    follow_up_date: datetime.date | None = None


class MedicalRecordCreate(MedicalRecordBase):
    pass


class MedicalRecordUpdate(BaseModel):
    chief_complaint: str | None = None
    clinical_notes: str | None = None
    diagnosis: str | None = None
    treatment_notes: str | None = None
    follow_up_date: datetime.date | None = None


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
