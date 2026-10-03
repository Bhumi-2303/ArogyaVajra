import datetime
import uuid
from pydantic import BaseModel, ConfigDict, Field, model_validator


class DoctorAvailabilityBase(BaseModel):
    day_of_week: int = Field(..., ge=0, le=6, description="0 = Sunday, 6 = Saturday")
    start_time: datetime.time = Field(..., description="Start time of the slot window")
    end_time: datetime.time = Field(..., description="End time of the slot window")
    slot_duration_minutes: int = Field(..., gt=0, description="Duration of each appointment slot in minutes")
    is_active: bool = Field(True, description="Whether this availability window is active")

    @model_validator(mode="after")
    def validate_times(self) -> "DoctorAvailabilityBase":
        if self.start_time >= self.end_time:
            raise ValueError("end_time must be after start_time")
        return self


class DoctorAvailabilityCreate(DoctorAvailabilityBase):
    pass


class DoctorAvailabilityUpdate(BaseModel):
    day_of_week: int | None = Field(None, ge=0, le=6)
    start_time: datetime.time | None = None
    end_time: datetime.time | None = None
    slot_duration_minutes: int | None = Field(None, gt=0)
    is_active: bool | None = None

    @model_validator(mode="after")
    def validate_times(self) -> "DoctorAvailabilityUpdate":
        if self.start_time and self.end_time:
            if self.start_time >= self.end_time:
                raise ValueError("end_time must be after start_time")
        return self


class DoctorAvailabilityResponse(DoctorAvailabilityBase):
    id: uuid.UUID
    doctor_id: uuid.UUID
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class DoctorAvailabilityListResponse(BaseModel):
    data: list[DoctorAvailabilityResponse]
    message: str = "Availability slots retrieved successfully."


class DoctorAvailabilityDetailResponse(BaseModel):
    data: DoctorAvailabilityResponse
    message: str = "Availability slot retrieved successfully."
