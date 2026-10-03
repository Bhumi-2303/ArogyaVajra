import uuid
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.prescription import Prescription, PrescriptionItem, PrescriptionStatus
from app.models.user import User, UserRole
from app.repositories.prescription import PrescriptionRepository
from app.repositories.doctor import DoctorRepository
from app.repositories.patient import PatientRepository
from app.repositories.appointment import AppointmentRepository
from app.schemas.prescription import PrescriptionCreate, PrescriptionUpdate
from app.services.audit import record_audit_event


class PrescriptionService:
    @classmethod
    def create_prescription(
        cls,
        db: Session,
        data: PrescriptionCreate,
        current_user: User,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> Prescription:
        if current_user.role != UserRole.DOCTOR:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only doctors can create prescriptions.",
            )

        doctor = DoctorRepository.get_by_id(db, data.doctor_id)
        if not doctor or doctor.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only create prescriptions for yourself.",
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

        prescription = Prescription(
            id=uuid.uuid4(),
            patient_id=data.patient_id,
            doctor_id=data.doctor_id,
            appointment_id=data.appointment_id,
            prescription_date=data.prescription_date,
            instructions=data.instructions,
            status=data.status,
        )

        for item_data in data.items:
            item = PrescriptionItem(
                id=uuid.uuid4(),
                medicine_name=item_data.medicine_name,
                dosage=item_data.dosage,
                frequency=item_data.frequency,
                duration=item_data.duration,
                route=item_data.route,
                instructions=item_data.instructions,
            )
            prescription.items.append(item)

        PrescriptionRepository.create(db, prescription)

        record_audit_event(
            db=db,
            action="PRESCRIPTION_CREATE",
            entity_type="PRESCRIPTION",
            entity_id=str(prescription.id),
            user_id=current_user.id,
            new_values={
                "patient_id": str(prescription.patient_id),
                "doctor_id": str(prescription.doctor_id),
                "appointment_id": str(prescription.appointment_id) if prescription.appointment_id else None,
                "status": prescription.status.value,
                "items_count": len(prescription.items),
            },
            ip_address=ip_address,
            user_agent=user_agent,
        )

        return prescription

    @classmethod
    def get_prescription(cls, db: Session, prescription_id: uuid.UUID, current_user: User) -> Prescription:
        prescription = PrescriptionRepository.get_by_id(db, prescription_id)
        if not prescription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prescription not found.",
            )

        if current_user.role == UserRole.PATIENT:
            patient = PatientRepository.get_by_id(db, prescription.patient_id)
            if not patient or patient.user_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")
        elif current_user.role == UserRole.DOCTOR:
            doctor = DoctorRepository.get_by_id(db, prescription.doctor_id)
            if not doctor or doctor.user_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")
        elif current_user.role not in [UserRole.ADMIN, UserRole.RECEPTIONIST]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")
        
        return prescription

    @classmethod
    def update_prescription(
        cls,
        db: Session,
        prescription_id: uuid.UUID,
        data: PrescriptionUpdate,
        current_user: User,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> Prescription:
        if current_user.role != UserRole.DOCTOR:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only doctors can update prescriptions.",
            )

        prescription = cls.get_prescription(db, prescription_id, current_user)
        
        if prescription.status in [PrescriptionStatus.COMPLETED, PrescriptionStatus.CANCELLED] and data.status not in [PrescriptionStatus.COMPLETED, PrescriptionStatus.CANCELLED]:
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot revert a completed or cancelled prescription.",
            )

        old_values = {
            "instructions": prescription.instructions,
            "status": prescription.status.value,
            "items_count": len(prescription.items),
        }

        if data.instructions is not None:
            prescription.instructions = data.instructions
        if data.status is not None:
            prescription.status = data.status
            
        if data.items is not None:
            prescription.items.clear()
            for item_data in data.items:
                item = PrescriptionItem(
                    id=uuid.uuid4(),
                    medicine_name=item_data.medicine_name,
                    dosage=item_data.dosage,
                    frequency=item_data.frequency,
                    duration=item_data.duration,
                    route=item_data.route,
                    instructions=item_data.instructions,
                )
                prescription.items.append(item)

        db.add(prescription)
        db.flush()

        new_values = {
            "instructions": prescription.instructions,
            "status": prescription.status.value,
            "items_count": len(prescription.items),
        }

        record_audit_event(
            db=db,
            action="PRESCRIPTION_UPDATE",
            entity_type="PRESCRIPTION",
            entity_id=str(prescription.id),
            user_id=current_user.id,
            old_values=old_values,
            new_values=new_values,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        return prescription

    @classmethod
    def list_prescriptions(
        cls,
        db: Session,
        current_user: User,
        patient_id: uuid.UUID | None = None,
        doctor_id: uuid.UUID | None = None,
        appointment_id: uuid.UUID | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Prescription], int]:
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
        return PrescriptionRepository.search(
            db=db,
            patient_id=patient_id,
            doctor_id=doctor_id,
            appointment_id=appointment_id,
            skip=skip,
            limit=page_size
        )
