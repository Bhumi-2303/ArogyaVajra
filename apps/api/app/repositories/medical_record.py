import uuid
from datetime import date

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.medical_record import MedicalRecord


class MedicalRecordRepository:
    @staticmethod
    def get_by_id(db: Session, record_id: uuid.UUID) -> MedicalRecord | None:
        return db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()

    @staticmethod
    def create(db: Session, record: MedicalRecord) -> MedicalRecord:
        db.add(record)
        db.flush()
        return record

    @staticmethod
    def search(
        db: Session,
        q: str | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
        patient_id: uuid.UUID | None = None,
        doctor_id: uuid.UUID | None = None,
        appointment_id: uuid.UUID | None = None,
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
        if start_date:
            query = query.filter(MedicalRecord.record_date >= start_date)
        if end_date:
            query = query.filter(MedicalRecord.record_date <= end_date)
        if q and q.strip():
            search_pattern = f"%{q.strip()}%"
            query = query.filter(
                or_(
                    MedicalRecord.chief_complaint.ilike(search_pattern),
                    MedicalRecord.diagnosis.ilike(search_pattern),
                    MedicalRecord.clinical_notes.ilike(search_pattern),
                    MedicalRecord.treatment_notes.ilike(search_pattern),
                )
            )

        total = query.count()
        items = (
            query.order_by(
                MedicalRecord.record_date.desc(),
                MedicalRecord.created_at.desc(),
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

        return items, total
