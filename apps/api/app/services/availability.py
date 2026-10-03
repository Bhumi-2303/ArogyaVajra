import uuid
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.doctor import DoctorAvailability
from app.models.user import User, UserRole
from app.repositories.availability import AvailabilityRepository
from app.repositories.doctor import DoctorRepository
from app.schemas.availability import DoctorAvailabilityCreate, DoctorAvailabilityUpdate
from app.services.audit import record_audit_event


class AvailabilityService:
    """Service orchestrating doctor availability operations."""

    @staticmethod
    def _authorize_doctor_access(db: Session, doctor_id: uuid.UUID, current_user: User):
        """Ensure current user is an Admin or the specific doctor."""
        doctor = DoctorRepository.get_by_id(db, doctor_id)
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor profile not found.",
            )
        
        if current_user.role != UserRole.ADMIN and doctor.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access availability for this doctor.",
            )
        return doctor

    @classmethod
    def list_availability(
        cls,
        db: Session,
        doctor_id: uuid.UUID,
        current_user: User,
    ) -> list[DoctorAvailability]:
        """List availability slots for a doctor."""
        cls._authorize_doctor_access(db, doctor_id, current_user)
        return AvailabilityRepository.get_by_doctor_id(db, doctor_id)

    @classmethod
    def create_availability(
        cls,
        db: Session,
        doctor_id: uuid.UUID,
        data: DoctorAvailabilityCreate,
        current_user: User,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> DoctorAvailability:
        """Create a new availability slot."""
        cls._authorize_doctor_access(db, doctor_id, current_user)

        availability = DoctorAvailability(
            id=uuid.uuid4(),
            doctor_id=doctor_id,
            day_of_week=data.day_of_week,
            start_time=data.start_time,
            end_time=data.end_time,
            slot_duration_minutes=data.slot_duration_minutes,
            is_active=data.is_active,
        )

        AvailabilityRepository.create(db, availability)

        record_audit_event(
            db=db,
            action="AVAILABILITY_CREATE",
            entity_type="AVAILABILITY",
            entity_id=str(availability.id),
            user_id=current_user.id,
            new_values={
                "doctor_id": str(doctor_id),
                "day_of_week": availability.day_of_week,
                "start_time": str(availability.start_time),
                "end_time": str(availability.end_time),
                "slot_duration_minutes": availability.slot_duration_minutes,
                "is_active": availability.is_active,
            },
            ip_address=ip_address,
            user_agent=user_agent,
        )

        return availability

    @classmethod
    def update_availability(
        cls,
        db: Session,
        doctor_id: uuid.UUID,
        slot_id: uuid.UUID,
        data: DoctorAvailabilityUpdate,
        current_user: User,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> DoctorAvailability:
        """Update an availability slot."""
        cls._authorize_doctor_access(db, doctor_id, current_user)

        availability = AvailabilityRepository.get_by_id(db, slot_id)
        if not availability or availability.doctor_id != doctor_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Availability slot not found.",
            )

        old_values = {
            "day_of_week": availability.day_of_week,
            "start_time": str(availability.start_time),
            "end_time": str(availability.end_time),
            "slot_duration_minutes": availability.slot_duration_minutes,
            "is_active": availability.is_active,
        }

        # Custom validation for end_time after start_time if only one is updated
        new_start = data.start_time if data.start_time is not None else availability.start_time
        new_end = data.end_time if data.end_time is not None else availability.end_time
        if new_start >= new_end:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="end_time must be after start_time"
            )

        if data.day_of_week is not None:
            availability.day_of_week = data.day_of_week
        if data.start_time is not None:
            availability.start_time = data.start_time
        if data.end_time is not None:
            availability.end_time = data.end_time
        if data.slot_duration_minutes is not None:
            availability.slot_duration_minutes = data.slot_duration_minutes
        if data.is_active is not None:
            availability.is_active = data.is_active

        db.add(availability)
        db.flush()

        new_values = {
            "day_of_week": availability.day_of_week,
            "start_time": str(availability.start_time),
            "end_time": str(availability.end_time),
            "slot_duration_minutes": availability.slot_duration_minutes,
            "is_active": availability.is_active,
        }

        record_audit_event(
            db=db,
            action="AVAILABILITY_UPDATE",
            entity_type="AVAILABILITY",
            entity_id=str(availability.id),
            user_id=current_user.id,
            old_values=old_values,
            new_values=new_values,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        return availability

    @classmethod
    def delete_availability(
        cls,
        db: Session,
        doctor_id: uuid.UUID,
        slot_id: uuid.UUID,
        current_user: User,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> None:
        """Delete an availability slot."""
        cls._authorize_doctor_access(db, doctor_id, current_user)

        availability = AvailabilityRepository.get_by_id(db, slot_id)
        if not availability or availability.doctor_id != doctor_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Availability slot not found.",
            )

        old_values = {
            "doctor_id": str(availability.doctor_id),
            "day_of_week": availability.day_of_week,
            "start_time": str(availability.start_time),
            "end_time": str(availability.end_time),
        }

        AvailabilityRepository.delete(db, availability)

        record_audit_event(
            db=db,
            action="AVAILABILITY_DELETE",
            entity_type="AVAILABILITY",
            entity_id=str(slot_id),
            user_id=current_user.id,
            old_values=old_values,
            ip_address=ip_address,
            user_agent=user_agent,
        )
