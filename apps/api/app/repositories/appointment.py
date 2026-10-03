import datetime
import uuid
from typing import Optional

from sqlalchemy import or_, and_
from sqlalchemy.orm import Session

from app.models.appointment import Appointment, AppointmentStatus


class AppointmentRepository:
    @staticmethod
    def get_by_id(db: Session, appointment_id: uuid.UUID) -> Optional[Appointment]:
        return db.query(Appointment).filter(Appointment.id == appointment_id).first()

    @staticmethod
    def check_overlap(
        db: Session,
        doctor_id: uuid.UUID,
        appointment_date: datetime.date,
        start_time: datetime.time,
        end_time: datetime.time,
        exclude_appointment_id: Optional[uuid.UUID] = None,
    ) -> bool:
        """Check if an active appointment overlaps with the given time slot."""
        query = db.query(Appointment).filter(
            Appointment.doctor_id == doctor_id,
            Appointment.appointment_date == appointment_date,
            Appointment.status.in_([AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]),
            or_(
                and_(Appointment.start_time < end_time, Appointment.end_time > start_time)
            )
        )
        if exclude_appointment_id:
            query = query.filter(Appointment.id != exclude_appointment_id)
        
        return query.first() is not None

    @staticmethod
    def create(db: Session, appointment: Appointment) -> Appointment:
        db.add(appointment)
        db.flush()
        return appointment

    @staticmethod
    def search(
        db: Session,
        patient_id: Optional[uuid.UUID] = None,
        doctor_id: Optional[uuid.UUID] = None,
        date: Optional[datetime.date] = None,
        status: Optional[AppointmentStatus] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Appointment], int]:
        query = db.query(Appointment)

        if patient_id:
            query = query.filter(Appointment.patient_id == patient_id)
        if doctor_id:
            query = query.filter(Appointment.doctor_id == doctor_id)
        if date:
            query = query.filter(Appointment.appointment_date == date)
        if status:
            query = query.filter(Appointment.status == status)

        total = query.count()
        items = query.order_by(Appointment.appointment_date.desc(), Appointment.start_time.desc()).offset(skip).limit(limit).all()

        return items, total

    @staticmethod
    def generate_appointment_code(db: Session) -> str:
        # A simple generation logic, could be improved.
        import random
        import string
        while True:
            code = "APT-" + "".join(random.choices(string.digits, k=5))
            if not db.query(Appointment).filter(Appointment.appointment_code == code).first():
                return code
