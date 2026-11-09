import datetime
import uuid

from pydantic import BaseModel, ConfigDict

from app.models.appointment import AppointmentStatus


class AppointmentBase(BaseModel):
    doctor_id: uuid.UUID
    appointment_date: datetime.date
    start_time: datetime.time
    end_time: datetime.time
    patient_id: uuid.UUID | None = None
    reason: str | None = None
    notes: str | None = None


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    status: AppointmentStatus | None = None
    notes: str | None = None
    reason: str | None = None
    appointment_date: datetime.date | None = None
    start_time: datetime.time | None = None
    end_time: datetime.time | None = None


class AppointmentResponse(AppointmentBase):
    id: uuid.UUID
    appointment_code: str
    patient_id: uuid.UUID
    status: AppointmentStatus
    doctor_name: str | None = None
    doctor_specialization: str | None = None
    patient_name: str | None = None
    patient_code_display: str | None = None
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
