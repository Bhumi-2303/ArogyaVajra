import datetime
import uuid

from pydantic import BaseModel, ConfigDict

from app.models.prescription import PrescriptionStatus


class PrescriptionItemBase(BaseModel):
    medicine_name: str
    dosage: str
    frequency: str
    duration: str
    route: str | None = None
    instructions: str | None = None


class PrescriptionItemCreate(PrescriptionItemBase):
    pass


class PrescriptionItemResponse(PrescriptionItemBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


class PrescriptionBase(BaseModel):
    patient_id: uuid.UUID
    doctor_id: uuid.UUID
    appointment_id: uuid.UUID | None = None
    prescription_date: datetime.date
    instructions: str | None = None
    status: PrescriptionStatus = PrescriptionStatus.ACTIVE


class PrescriptionCreate(PrescriptionBase):
    items: list[PrescriptionItemCreate]


class PrescriptionUpdate(BaseModel):
    instructions: str | None = None
    status: PrescriptionStatus | None = None
    # Assuming updating items means replacing the whole list of items or we just
    # keep it simple.
    items: list[PrescriptionItemCreate] | None = None


class PrescriptionResponse(PrescriptionBase):
    id: uuid.UUID
    created_at: datetime.datetime
    updated_at: datetime.datetime
    items: list[PrescriptionItemResponse]

    model_config = ConfigDict(from_attributes=True)


class PrescriptionListResponse(BaseModel):
    data: list[PrescriptionResponse]
    message: str = "Prescriptions retrieved successfully."
    pagination: dict


class PrescriptionDetailResponse(BaseModel):
    data: PrescriptionResponse
    message: str = "Prescription retrieved successfully."
