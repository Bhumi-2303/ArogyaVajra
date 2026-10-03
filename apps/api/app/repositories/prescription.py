import uuid
from typing import Optional

from sqlalchemy.orm import Session

from app.models.prescription import Prescription


class PrescriptionRepository:
    @staticmethod
    def get_by_id(db: Session, prescription_id: uuid.UUID) -> Optional[Prescription]:
        return db.query(Prescription).filter(Prescription.id == prescription_id).first()

    @staticmethod
    def create(db: Session, prescription: Prescription) -> Prescription:
        db.add(prescription)
        db.flush()
        return prescription

    @staticmethod
    def search(
        db: Session,
        patient_id: Optional[uuid.UUID] = None,
        doctor_id: Optional[uuid.UUID] = None,
        appointment_id: Optional[uuid.UUID] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Prescription], int]:
        query = db.query(Prescription)

        if patient_id:
            query = query.filter(Prescription.patient_id == patient_id)
        if doctor_id:
            query = query.filter(Prescription.doctor_id == doctor_id)
        if appointment_id:
            query = query.filter(Prescription.appointment_id == appointment_id)

        total = query.count()
        items = query.order_by(Prescription.prescription_date.desc(), Prescription.created_at.desc()).offset(skip).limit(limit).all()

        return items, total
