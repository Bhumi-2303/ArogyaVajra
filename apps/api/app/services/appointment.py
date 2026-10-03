import datetime
import uuid
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.appointment import Appointment, AppointmentStatus
from app.models.user import User, UserRole
from app.repositories.appointment import AppointmentRepository
from app.repositories.doctor import DoctorRepository
from app.repositories.patient import PatientRepository
from app.repositories.availability import AvailabilityRepository
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate
from app.services.audit import record_audit_event


class AppointmentService:
    @staticmethod
    def _validate_availability(
        db: Session,
        doctor_id: uuid.UUID,
        appointment_date: datetime.date,
        start_time: datetime.time,
        end_time: datetime.time,
    ):
        """Check if the doctor has an active availability slot for the given time."""
        day_of_week = (appointment_date.weekday() + 1) % 7 # Python weekday: 0=Mon, 6=Sun. ArogyaVajra schema usually: 0=Sun, 6=Sat? Let's check: 0=Sunday..6=Saturday or 1=Monday..7=Sunday. The schema says: 0=Sunday .. 6=Saturday.
        # Python weekday: 0=Monday, 1=Tuesday, ..., 6=Sunday.
        # So Sunday should be 0.
        isoweekday = appointment_date.isoweekday() # 1=Mon, ..., 7=Sun
        day_of_week = isoweekday % 7

        availabilities = AvailabilityRepository.get_by_doctor_id(db, doctor_id)
        valid_slot_found = False
        for slot in availabilities:
            if not slot.is_active:
                continue
            if slot.day_of_week == day_of_week:
                if slot.start_time <= start_time and slot.end_time >= end_time:
                    valid_slot_found = True
                    break

        if not valid_slot_found:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Doctor is not available at the requested time.",
            )

    @classmethod
    def create_appointment(
        cls,
        db: Session,
        data: AppointmentCreate,
        current_user: User,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> Appointment:
        if current_user.role not in [UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.PATIENT]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to create appointments.",
            )

        if data.start_time >= data.end_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="end_time must be after start_time",
            )

        patient = PatientRepository.get_by_id(db, data.patient_id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found.",
            )

        if current_user.role == UserRole.PATIENT and patient.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only create appointments for yourself.",
            )

        doctor = DoctorRepository.get_by_id(db, data.doctor_id)
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found.",
            )

        if not doctor.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Doctor is not currently active.",
            )

        cls._validate_availability(db, doctor.id, data.appointment_date, data.start_time, data.end_time)

        if AppointmentRepository.check_overlap(
            db, doctor.id, data.appointment_date, data.start_time, data.end_time
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="The requested time slot conflicts with an existing appointment.",
            )

        appointment_code = AppointmentRepository.generate_appointment_code(db)

        appointment = Appointment(
            id=uuid.uuid4(),
            appointment_code=appointment_code,
            patient_id=data.patient_id,
            doctor_id=data.doctor_id,
            appointment_date=data.appointment_date,
            start_time=data.start_time,
            end_time=data.end_time,
            reason=data.reason,
            notes=data.notes,
            created_by=current_user.id,
            status=AppointmentStatus.SCHEDULED,
        )

        AppointmentRepository.create(db, appointment)

        record_audit_event(
            db=db,
            action="APPOINTMENT_CREATE",
            entity_type="APPOINTMENT",
            entity_id=str(appointment.id),
            user_id=current_user.id,
            new_values={
                "patient_id": str(appointment.patient_id),
                "doctor_id": str(appointment.doctor_id),
                "appointment_date": str(appointment.appointment_date),
                "start_time": str(appointment.start_time),
                "end_time": str(appointment.end_time),
                "status": appointment.status.value,
            },
            ip_address=ip_address,
            user_agent=user_agent,
        )

        return appointment

    @classmethod
    def get_appointment(cls, db: Session, appointment_id: uuid.UUID, current_user: User) -> Appointment:
        appointment = AppointmentRepository.get_by_id(db, appointment_id)
        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found.",
            )

        if current_user.role == UserRole.PATIENT:
            patient = PatientRepository.get_by_id(db, appointment.patient_id)
            if not patient or patient.user_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")
        elif current_user.role == UserRole.DOCTOR:
            doctor = DoctorRepository.get_by_id(db, appointment.doctor_id)
            if not doctor or doctor.user_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")
        
        return appointment

    @classmethod
    def update_appointment(
        cls,
        db: Session,
        appointment_id: uuid.UUID,
        data: AppointmentUpdate,
        current_user: User,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> Appointment:
        appointment = cls.get_appointment(db, appointment_id, current_user)

        old_values = {
            "status": appointment.status.value,
            "notes": appointment.notes,
            "reason": appointment.reason,
        }

        if data.status and data.status != appointment.status:
            # Rule: cancelled cannot be completed
            if appointment.status == AppointmentStatus.CANCELLED and data.status == AppointmentStatus.COMPLETED:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot complete a cancelled appointment.",
                )
            
            # Rule: completed cannot be directly rescheduled (rescheduled maps to SCHEDULED/CONFIRMED typically, but not explicitly states here except "rescheduled")
            if appointment.status == AppointmentStatus.COMPLETED and data.status in [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot reschedule a completed appointment.",
                )

            # Role checks for status
            if current_user.role == UserRole.PATIENT and data.status not in [AppointmentStatus.CANCELLED]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Patients can only cancel appointments.",
                )

            appointment.status = data.status

        if data.notes is not None:
            if current_user.role == UserRole.PATIENT:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Patients cannot update clinical notes.",
                )
            appointment.notes = data.notes

        if data.reason is not None:
            appointment.reason = data.reason

        db.add(appointment)
        db.flush()

        new_values = {
            "status": appointment.status.value,
            "notes": appointment.notes,
            "reason": appointment.reason,
        }

        record_audit_event(
            db=db,
            action="APPOINTMENT_UPDATE",
            entity_type="APPOINTMENT",
            entity_id=str(appointment.id),
            user_id=current_user.id,
            old_values=old_values,
            new_values=new_values,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        return appointment

    @classmethod
    def list_appointments(
        cls,
        db: Session,
        current_user: User,
        patient_id: uuid.UUID | None = None,
        doctor_id: uuid.UUID | None = None,
        date: datetime.date | None = None,
        status_filter: AppointmentStatus | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Appointment], int]:
        
        # Enforce role-based filtering limits
        if current_user.role == UserRole.PATIENT:
            patient = PatientRepository.get_by_user_id(db, current_user.id)
            if not patient:
                return [], 0
            patient_id = patient.id
        elif current_user.role == UserRole.DOCTOR:
            doctor = DoctorRepository.get_by_user_id(db, current_user.id)
            if not doctor:
                return [], 0
            doctor_id = doctor.id

        skip = (page - 1) * page_size
        return AppointmentRepository.search(
            db=db,
            patient_id=patient_id,
            doctor_id=doctor_id,
            date=date,
            status=status_filter,
            skip=skip,
            limit=page_size
        )
