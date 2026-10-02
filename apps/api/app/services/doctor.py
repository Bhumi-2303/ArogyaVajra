"""Service layer for doctor management domain workflows and audit compliance."""

import secrets
import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.doctor import DoctorProfile
from app.models.user import User, UserRole
from app.repositories.doctor import DoctorRepository
from app.schemas.doctor import DoctorCreate, DoctorUpdate
from app.services.audit import record_audit_event


class DoctorService:
    """Service orchestrating doctor profile operations, RBAC, and audit logging."""

    @staticmethod
    def list_doctors(
        db: Session,
        current_user: User,
        search: str | None = None,
        name: str | None = None,
        specialization: str | None = None,
        code: str | None = None,
        is_active: bool | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[DoctorProfile], int, int]:
        """Search and paginate doctor profiles."""
        return DoctorRepository.search_and_paginate(
            db=db,
            search=search,
            name=name,
            specialization=specialization,
            code=code,
            is_active=is_active,
            page=page,
            page_size=page_size,
        )

    @staticmethod
    def get_doctor(
        db: Session,
        doctor_id: uuid.UUID,
        current_user: User,
    ) -> DoctorProfile:
        """Retrieve single doctor profile details."""
        doctor = DoctorRepository.get_by_id(db, doctor_id)
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor profile not found.",
            )
        return doctor

    @classmethod
    def create_doctor(
        cls,
        db: Session,
        data: DoctorCreate,
        current_user: User,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> DoctorProfile:
        """Create a new doctor profile with auto-generated code and audit logging."""
        # 1. Authorize: Only administrator can provision doctor profiles
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Administrator authorization required to register doctor profiles.",
            )

        target_user_id: uuid.UUID

        # 2. Determine target user account
        if data.user_id:
            user = db.get(User, data.user_id)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Specified user account does not exist.",
                )
            # Ensure user role is DOCTOR
            if user.role != UserRole.DOCTOR:
                user.role = UserRole.DOCTOR
                db.add(user)
                db.flush()
            target_user_id = user.id
        elif data.email:
            existing_user = (
                db.query(User).filter(User.email == data.email.lower().strip()).first()
            )
            if existing_user:
                if existing_user.role != UserRole.DOCTOR:
                    existing_user.role = UserRole.DOCTOR
                    db.add(existing_user)
                    db.flush()
                target_user_id = existing_user.id
            else:
                initial_pw = data.password or secrets.token_urlsafe(16)
                new_user = User(
                    id=uuid.uuid4(),
                    email=data.email.lower().strip(),
                    password_hash=hash_password(initial_pw),
                    role=UserRole.DOCTOR,
                    is_active=True,
                )
                db.add(new_user)
                db.flush()
                target_user_id = new_user.id
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either user_id or email is required to associate doctor profile.",
            )

        # 3. Check if doctor profile already exists for this user
        existing_profile = DoctorRepository.get_by_user_id(db, target_user_id)
        if existing_profile:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A doctor profile already exists for this user account.",
            )

        # 4. Generate sequential doctor code (DOC-00001)
        doctor_code = DoctorRepository.generate_doctor_code(db)

        # 5. Check license number uniqueness if provided
        if data.license_number:
            existing_license = (
                db.query(DoctorProfile)
                .filter(DoctorProfile.license_number == data.license_number.strip())
                .first()
            )
            if existing_license:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="A doctor with this license number already exists.",
                )

        # 6. Instantiate and persist profile
        doctor = DoctorProfile(
            id=uuid.uuid4(),
            user_id=target_user_id,
            doctor_code=doctor_code,
            first_name=data.first_name.strip(),
            last_name=data.last_name.strip(),
            specialization=data.specialization.strip(),
            qualification=data.qualification.strip() if data.qualification else None,
            license_number=data.license_number.strip() if data.license_number else None,
            phone=data.phone.strip() if data.phone else None,
            consultation_fee=data.consultation_fee,
            bio=data.bio.strip() if data.bio else None,
        )
        DoctorRepository.create(db, doctor)

        # 7. Record immutable audit log
        record_audit_event(
            db=db,
            action="DOCTOR_CREATE",
            entity_type="DOCTOR",
            entity_id=str(doctor.id),
            user_id=current_user.id,
            new_values={
                "doctor_code": doctor.doctor_code,
                "first_name": doctor.first_name,
                "last_name": doctor.last_name,
                "specialization": doctor.specialization,
                "consultation_fee": str(doctor.consultation_fee),
            },
            ip_address=ip_address,
            user_agent=user_agent,
        )

        return doctor

    @classmethod
    def update_doctor(
        cls,
        db: Session,
        doctor_id: uuid.UUID,
        data: DoctorUpdate,
        current_user: User,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> DoctorProfile:
        """Update doctor profile attributes with authorization checks and audit logging."""
        doctor = cls.get_doctor(db, doctor_id, current_user)

        # Authorize: Only Admin or the Doctor themselves can update
        is_admin = current_user.role == UserRole.ADMIN
        is_owner = doctor.user_id == current_user.id

        if not (is_admin or is_owner):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this doctor profile.",
            )

        old_values: dict[str, str | None] = {
            "first_name": doctor.first_name,
            "last_name": doctor.last_name,
            "specialization": doctor.specialization,
            "qualification": doctor.qualification,
            "license_number": doctor.license_number,
            "phone": doctor.phone,
            "consultation_fee": str(doctor.consultation_fee),
            "bio": doctor.bio,
        }

        # Apply demographic & professional updates
        if data.first_name is not None:
            doctor.first_name = data.first_name.strip()
        if data.last_name is not None:
            doctor.last_name = data.last_name.strip()
        if data.specialization is not None:
            doctor.specialization = data.specialization.strip()
        if data.qualification is not None:
            doctor.qualification = data.qualification.strip()
        if data.license_number is not None:
            doctor.license_number = data.license_number.strip()
        if data.phone is not None:
            doctor.phone = data.phone.strip()
        if data.consultation_fee is not None:
            doctor.consultation_fee = data.consultation_fee
        if data.bio is not None:
            doctor.bio = data.bio.strip()

        # Update active status if requested by administrator
        if data.is_active is not None and is_admin and doctor.user:
            doctor.user.is_active = data.is_active
            db.add(doctor.user)

        db.add(doctor)
        db.flush()

        new_values = {
            k: str(getattr(doctor, k)) if getattr(doctor, k) is not None else None
            for k in old_values
        }

        # Record audit log
        record_audit_event(
            db=db,
            action="DOCTOR_UPDATE",
            entity_type="DOCTOR",
            entity_id=str(doctor.id),
            user_id=current_user.id,
            old_values=old_values,
            new_values=new_values,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        return doctor

    @classmethod
    def delete_doctor(
        cls,
        db: Session,
        doctor_id: uuid.UUID,
        current_user: User,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> None:
        """Delete doctor profile (Admin only)."""
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can delete doctor profiles.",
            )

        doctor = cls.get_doctor(db, doctor_id, current_user)
        entity_id_str = str(doctor.id)
        doctor_code = doctor.doctor_code

        DoctorRepository.delete(db, doctor)

        record_audit_event(
            db=db,
            action="DOCTOR_DELETE",
            entity_type="DOCTOR",
            entity_id=entity_id_str,
            user_id=current_user.id,
            old_values={"doctor_code": doctor_code},
            ip_address=ip_address,
            user_agent=user_agent,
        )
