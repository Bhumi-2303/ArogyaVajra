import uuid
from sqlalchemy.orm import Session
from app.models.doctor import DoctorAvailability, DoctorProfile

class AvailabilityRepository:
    """Repository for managing doctor availability slots."""

    @staticmethod
    def get_by_doctor_id(db: Session, doctor_id: uuid.UUID) -> list[DoctorAvailability]:
        return (
            db.query(DoctorAvailability)
            .filter(DoctorAvailability.doctor_id == doctor_id)
            .order_by(DoctorAvailability.day_of_week, DoctorAvailability.start_time)
            .all()
        )

    @staticmethod
    def get_by_id(db: Session, slot_id: uuid.UUID) -> DoctorAvailability | None:
        return db.query(DoctorAvailability).filter(DoctorAvailability.id == slot_id).first()

    @staticmethod
    def create(db: Session, availability: DoctorAvailability) -> DoctorAvailability:
        db.add(availability)
        db.flush()
        return availability

    @staticmethod
    def delete(db: Session, availability: DoctorAvailability) -> None:
        db.delete(availability)
        db.flush()
