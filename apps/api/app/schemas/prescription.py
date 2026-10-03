import datetime
import uuid
from typing import Optional, List

from pydantic import BaseModel, ConfigDict
from app.models.prescription import PrescriptionStatus


class PrescriptionItemBase(BaseModel):
    medicine_name: str
    dosage: str
    frequency: str
    duration: str
    route: Optional[str] = None
    instructions: Optional[str] = None


class PrescriptionItemCreate(PrescriptionItemBase):
    pass


class PrescriptionItemResponse(PrescriptionItemBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


class PrescriptionBase(BaseModel):
    patient_id: uuid.UUID
    doctor_id: uuid.UUID
    appointment_id: Optional[uuid.UUID] = None
    prescription_date: datetime.date
    instructions: Optional[str] = None
    status: PrescriptionStatus = PrescriptionStatus.ACTIVE


class PrescriptionCreate(PrescriptionBase):
    items: List[PrescriptionItemCreate]


class PrescriptionUpdate(BaseModel):
    instructions: Optional[str] = None
    status: Optional[PrescriptionStatus] = None
    # Assuming updating items means replacing the whole list of items or we just keep it simple.
    items: Optional[List[PrescriptionItemCreate]] = None


class PrescriptionResponse(PrescriptionBase):
    id: uuid.UUID
    created_at: datetime.datetime
    updated_at: datetime.datetime
    items: List[PrescriptionItemResponse]

    model_config = ConfigDict(from_attributes=True)


class PrescriptionListResponse(BaseModel):
    data: List[PrescriptionResponse]
    message: str = "Prescriptions retrieved successfully."
    pagination: dict


class PrescriptionDetailResponse(BaseModel):
    data: PrescriptionResponse
    message: str = "Prescription retrieved successfully."
