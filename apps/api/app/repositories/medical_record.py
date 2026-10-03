import datetime
import uuid
from typing import Optional

from sqlalchemy.orm import Session

from app.models.medical_record import MedicalRecord


class MedicalRecordRepository:
    @staticmethod
    def get_by_id(db: Session, record_id: uuid.UUID) -> Optional[MedicalRecord]:
        return db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()

    @staticmethod
    def create(db: Session, record: MedicalRecord) -> MedicalRecord:
        db.add(record)
        db.flush()
        return record

    @staticmethod
    def search(
        db: Session,
        patient_id: Optional[uuid.UUID] = None,
        doctor_id: Optional[uuid.UUID] = None,
        appointment_id: Optional[uuid.UUID] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[MedicalRecord], int]:
        query = db.query(MedicalRecord)

        if patient_id:
            query = query.filter(MedicalRecord.patient_id == patient_id)
        if doctor_id:
            query = query.filter(MedicalRecord.doctor_id == doctor_id)
        if appointment_id:
            query = query.filter(MedicalRecord.appointment_id == appointment_id)

        total = query.count()
        items = query.order_by(MedicalRecord.record_date.desc(), MedicalRecord.created_at.desc()).offset(skip).limit(limit).all()

        return items, total
