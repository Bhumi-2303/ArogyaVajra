import datetime
import uuid
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.appointment import AppointmentStatus


class AppointmentBase(BaseModel):
    patient_id: uuid.UUID
    doctor_id: uuid.UUID
    appointment_date: datetime.date
    start_time: datetime.time
    end_time: datetime.time
    reason: Optional[str] = None
    notes: Optional[str] = None


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    status: Optional[AppointmentStatus] = None
    notes: Optional[str] = None
    reason: Optional[str] = None


class AppointmentResponse(AppointmentBase):
    id: uuid.UUID
    appointment_code: str
    status: AppointmentStatus
    created_by: uuid.UUID
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class AppointmentListResponse(BaseModel):
    data: list[AppointmentResponse]
    message: str = "Appointments retrieved successfully."
    pagination: dict


class AppointmentDetailResponse(BaseModel):
    data: AppointmentResponse
    message: str = "Appointment retrieved successfully."
