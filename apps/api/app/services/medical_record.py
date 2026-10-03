import uuid
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.medical_record import MedicalRecord
from app.models.user import User, UserRole
from app.repositories.medical_record import MedicalRecordRepository
from app.repositories.doctor import DoctorRepository
from app.repositories.patient import PatientRepository
from app.repositories.appointment import AppointmentRepository
from app.schemas.medical_record import MedicalRecordCreate, MedicalRecordUpdate
from app.services.audit import record_audit_event


class MedicalRecordService:
    @classmethod
    def create_record(
        cls,
        db: Session,
        data: MedicalRecordCreate,
        current_user: User,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> MedicalRecord:
        # Authorization: Doctor may create/manage authorized consultation records
        if current_user.role != UserRole.DOCTOR:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only doctors can create medical records.",
            )

        doctor = DoctorRepository.get_by_id(db, data.doctor_id)
        if not doctor or doctor.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only create records for yourself.",
            )

        patient = PatientRepository.get_by_id(db, data.patient_id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found.",
            )

        if data.appointment_id:
            appointment = AppointmentRepository.get_by_id(db, data.appointment_id)
            if not appointment:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Appointment not found.",
                )
            if appointment.doctor_id != doctor.id or appointment.patient_id != patient.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Appointment does not match patient and doctor.",
                )

        record = MedicalRecord(
            id=uuid.uuid4(),
            patient_id=data.patient_id,
            doctor_id=data.doctor_id,
            appointment_id=data.appointment_id,
            record_date=data.record_date,
            chief_complaint=data.chief_complaint,
            clinical_notes=data.clinical_notes,
            diagnosis=data.diagnosis,
            treatment_notes=data.treatment_notes,
            follow_up_date=data.follow_up_date,
        )

        MedicalRecordRepository.create(db, record)

        record_audit_event(
            db=db,
            action="MEDICAL_RECORD_CREATE",
            entity_type="MEDICAL_RECORD",
            entity_id=str(record.id),
            user_id=current_user.id,
            new_values={
                "patient_id": str(record.patient_id),
                "doctor_id": str(record.doctor_id),
                "appointment_id": str(record.appointment_id) if record.appointment_id else None,
                "record_date": str(record.record_date),
            },
            ip_address=ip_address,
            user_agent=user_agent,
        )

        return record

    @classmethod
    def get_record(cls, db: Session, record_id: uuid.UUID, current_user: User) -> MedicalRecord:
        record = MedicalRecordRepository.get_by_id(db, record_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medical record not found.",
            )

        if current_user.role == UserRole.PATIENT:
            patient = PatientRepository.get_by_id(db, record.patient_id)
            if not patient or patient.user_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")
        elif current_user.role == UserRole.DOCTOR:
            doctor = DoctorRepository.get_by_id(db, record.doctor_id)
            if not doctor or doctor.user_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")
        elif current_user.role not in [UserRole.ADMIN, UserRole.RECEPTIONIST]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")
        
        return record

    @classmethod
    def update_record(
        cls,
        db: Session,
        record_id: uuid.UUID,
        data: MedicalRecordUpdate,
        current_user: User,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> MedicalRecord:
        if current_user.role != UserRole.DOCTOR:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only doctors can update medical records.",
            )

        record = cls.get_record(db, record_id, current_user)

        old_values = {
            "chief_complaint": record.chief_complaint,
            "clinical_notes": record.clinical_notes,
            "diagnosis": record.diagnosis,
            "treatment_notes": record.treatment_notes,
            "follow_up_date": str(record.follow_up_date) if record.follow_up_date else None,
        }

        if data.chief_complaint is not None:
            record.chief_complaint = data.chief_complaint
        if data.clinical_notes is not None:
            record.clinical_notes = data.clinical_notes
        if data.diagnosis is not None:
            record.diagnosis = data.diagnosis
        if data.treatment_notes is not None:
            record.treatment_notes = data.treatment_notes
        if data.follow_up_date is not None:
            record.follow_up_date = data.follow_up_date

        db.add(record)
        db.flush()

        new_values = {
            "chief_complaint": record.chief_complaint,
            "clinical_notes": record.clinical_notes,
            "diagnosis": record.diagnosis,
            "treatment_notes": record.treatment_notes,
            "follow_up_date": str(record.follow_up_date) if record.follow_up_date else None,
        }

        record_audit_event(
            db=db,
            action="MEDICAL_RECORD_UPDATE",
            entity_type="MEDICAL_RECORD",
            entity_id=str(record.id),
            user_id=current_user.id,
            old_values=old_values,
            new_values=new_values,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        return record

    @classmethod
    def list_records(
        cls,
        db: Session,
        current_user: User,
        patient_id: uuid.UUID | None = None,
        doctor_id: uuid.UUID | None = None,
        appointment_id: uuid.UUID | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[MedicalRecord], int]:
        
        # Enforce role-based filtering limits
        if current_user.role == UserRole.PATIENT:
            patient = PatientRepository.get_by_user_id(db, current_user.id)
            if not patient:
                return [], 0
            if patient_id and patient_id != patient.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")
            patient_id = patient.id
        elif current_user.role == UserRole.DOCTOR:
            doctor = DoctorRepository.get_by_user_id(db, current_user.id)
            if not doctor:
                return [], 0
            if doctor_id and doctor_id != doctor.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")
            doctor_id = doctor.id

        skip = (page - 1) * page_size
        return MedicalRecordRepository.search(
            db=db,
            patient_id=patient_id,
            doctor_id=doctor_id,
            appointment_id=appointment_id,
            skip=skip,
            limit=page_size
        )
