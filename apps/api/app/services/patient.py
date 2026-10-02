"""Business service layer for patient management, code generation, and audit logging."""

import math
import secrets
import uuid
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.authorization import (
    verify_patient_resource_access,
    verify_resource_ownership,
)
from app.core.security import hash_password
from app.models.patient import PatientProfile
from app.models.user import User, UserRole
from app.repositories.patient import PatientRepository
from app.schemas.patient import PatientCreate, PatientUpdate
from app.services.audit import record_audit_event


class PatientService:
    """Service orchestrating patient profile workflows and audit compliance."""

    @staticmethod
    def create_patient(
        db: Session,
        data: PatientCreate,
        current_user: User,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> PatientProfile:
        """Create a new patient profile with generated code and audit log."""
        # 1. Authorize: Only staff (ADMIN, RECEPTIONIST) or self-registering PATIENT can create
        if current_user.role not in (
            UserRole.ADMIN,
            UserRole.RECEPTIONIST,
            UserRole.PATIENT,
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to create patient profiles.",
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
            target_user_id = user.id
        elif data.email:
            existing_user = (
                db.query(User).filter(User.email == data.email.lower()).first()
            )
            if existing_user:
                target_user_id = existing_user.id
            else:
                # Provision new patient user account
                initial_pw = data.password or secrets.token_urlsafe(16)
                new_user = User(
                    id=uuid.uuid4(),
                    email=data.email.lower(),
                    password_hash=hash_password(initial_pw),
                    role=UserRole.PATIENT,
                    is_active=True,
                )
                db.add(new_user)
                db.flush()
                target_user_id = new_user.id
        elif current_user.role == UserRole.PATIENT:
            target_user_id = current_user.id
        else:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Either email or user_id is required to create a patient profile.",
            )

        # Check if user already has a profile
        existing_profile = PatientRepository.get_by_user_id(db, target_user_id)
        if existing_profile:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Patient profile already exists for this user account.",
            )

        # 3. Generate sequential human-readable code (e.g. PAT-00001)
        patient_code = PatientRepository.generate_patient_code(db)

        # 4. Instantiate profile
        patient = PatientProfile(
            id=uuid.uuid4(),
            user_id=target_user_id,
            patient_code=patient_code,
            first_name=data.first_name.strip(),
            last_name=data.last_name.strip(),
            date_of_birth=data.date_of_birth,
            gender=data.gender,
            phone=data.phone.strip() if data.phone else None,
            address=data.address.strip() if data.address else None,
            emergency_contact_name=data.emergency_contact_name.strip()
            if data.emergency_contact_name
            else None,
            emergency_contact_phone=data.emergency_contact_phone.strip()
            if data.emergency_contact_phone
            else None,
        )

        created = PatientRepository.create(db, patient)

        # 5. Record audit trail
        record_audit_event(
            db=db,
            action="PATIENT_CREATE",
            entity_type="patient_profile",
            entity_id=str(created.id),
            user_id=current_user.id,
            new_values={
                "patient_code": created.patient_code,
                "first_name": created.first_name,
                "last_name": created.last_name,
                "phone": created.phone,
                "user_id": str(target_user_id),
            },
            ip_address=ip_address,
            user_agent=user_agent,
        )

        return created

    @staticmethod
    def get_patient(
        db: Session,
        patient_id: uuid.UUID,
        current_user: User,
    ) -> PatientProfile:
        """Fetch patient profile enforcing role and relationship access rules."""
        patient = PatientRepository.get_by_id(db, patient_id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient profile not found.",
            )

        # Enforce resource access
        verify_patient_resource_access(
            user=current_user,
            patient_user_id=patient.user_id,
            allowed_clinical_roles=(
                UserRole.DOCTOR,
                UserRole.RECEPTIONIST,
                UserRole.BILLING_STAFF,
                UserRole.ADMIN,
            ),
        )

        return patient

    @staticmethod
    def update_patient(
        db: Session,
        patient_id: uuid.UUID,
        data: PatientUpdate,
        current_user: User,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> PatientProfile:
        """Update patient profile and record mutation audit event."""
        patient = PatientRepository.get_by_id(db, patient_id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient profile not found.",
            )

        # Role & ownership validation
        if current_user.role == UserRole.PATIENT:
            verify_resource_ownership(current_user, patient.user_id)
        elif current_user.role not in (UserRole.ADMIN, UserRole.RECEPTIONIST):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Current role is not authorized to edit patient records.",
            )

        # Capture old values
        old_values: dict[str, Any] = {
            "first_name": patient.first_name,
            "last_name": patient.last_name,
            "phone": patient.phone,
            "address": patient.address,
            "emergency_contact_name": patient.emergency_contact_name,
            "emergency_contact_phone": patient.emergency_contact_phone,
        }

        # Apply update
        update_dict = data.model_dump(exclude_unset=True)
        updated = PatientRepository.update(db, patient, update_dict)

        # Capture new values
        new_values = {k: getattr(updated, k) for k in old_values}

        # Audit event
        record_audit_event(
            db=db,
            action="PATIENT_UPDATE",
            entity_type="patient_profile",
            entity_id=str(updated.id),
            user_id=current_user.id,
            old_values=old_values,
            new_values=new_values,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        return updated

    @staticmethod
    def delete_patient(
        db: Session,
        patient_id: uuid.UUID,
        current_user: User,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> None:
        """Remove a patient record (admin restricted) and record audit event."""
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can delete patient profiles.",
            )

        patient = PatientRepository.get_by_id(db, patient_id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient profile not found.",
            )

        record_audit_event(
            db=db,
            action="PATIENT_DELETE",
            entity_type="patient_profile",
            entity_id=str(patient.id),
            user_id=current_user.id,
            old_values={
                "patient_code": patient.patient_code,
                "first_name": patient.first_name,
                "last_name": patient.last_name,
                "user_id": str(patient.user_id),
            },
            ip_address=ip_address,
            user_agent=user_agent,
        )

        PatientRepository.delete(db, patient)

    @staticmethod
    def list_patients(
        db: Session,
        current_user: User,
        search: str | None = None,
        code: str | None = None,
        name: str | None = None,
        phone: str | None = None,
        email: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[PatientProfile], int, int]:
        """Search and paginate patient profiles according to user role constraints."""
        # Patient role can only view their own record
        user_id_filter = (
            current_user.id if current_user.role == UserRole.PATIENT else None
        )

        items, total = PatientRepository.search_and_paginate(
            db=db,
            search=search,
            code=code,
            name=name,
            phone=phone,
            email=email,
            user_id_filter=user_id_filter,
            page=page,
            page_size=page_size,
        )

        total_pages = math.ceil(total / page_size) if total > 0 else 0
        return items, total, total_pages
