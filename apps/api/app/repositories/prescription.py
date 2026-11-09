import uuid
from datetime import date

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.prescription import Prescription, PrescriptionItem, PrescriptionStatus


class PrescriptionRepository:
    @staticmethod
    def get_by_id(db: Session, prescription_id: uuid.UUID) -> Prescription | None:
        return db.query(Prescription).filter(Prescription.id == prescription_id).first()

    @staticmethod
    def create(db: Session, prescription: Prescription) -> Prescription:
        db.add(prescription)
        db.flush()
        return prescription

    @staticmethod
    def search(
        db: Session,
        q: str | None = None,
        status: PrescriptionStatus | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
        patient_id: uuid.UUID | None = None,
        doctor_id: uuid.UUID | None = None,
        appointment_id: uuid.UUID | None = None,
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
        if status:
            query = query.filter(Prescription.status == status)
        if start_date:
            query = query.filter(Prescription.prescription_date >= start_date)
        if end_date:
            query = query.filter(Prescription.prescription_date <= end_date)
        if q and q.strip():
            search_pattern = f"%{q.strip()}%"
            query = query.filter(
                or_(
                    Prescription.instructions.ilike(search_pattern),
                    Prescription.items.any(
                        PrescriptionItem.medicine_name.ilike(search_pattern)
                    ),
                )
            )

        total = query.count()
        items = (
            query.order_by(
                Prescription.prescription_date.desc(),
                Prescription.created_at.desc(),
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

        return items, total
