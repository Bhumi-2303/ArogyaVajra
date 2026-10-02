"""Repository layer for PatientProfile entity queries, search, and persistence."""

import uuid
from typing import Any

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.models.patient import PatientProfile
from app.models.user import User


class PatientRepository:
    """Encapsulates database access for patient profiles."""

    @staticmethod
    def get_by_id(db: Session, patient_id: uuid.UUID) -> PatientProfile | None:
        """Fetch patient profile by primary key UUID."""
        stmt = (
            select(PatientProfile)
            .options(joinedload(PatientProfile.user))
            .where(PatientProfile.id == patient_id)
        )
        return db.scalar(stmt)

    @staticmethod
    def get_by_user_id(db: Session, user_id: uuid.UUID) -> PatientProfile | None:
        """Fetch patient profile associated with a user ID."""
        stmt = (
            select(PatientProfile)
            .options(joinedload(PatientProfile.user))
            .where(PatientProfile.user_id == user_id)
        )
        return db.scalar(stmt)

    @staticmethod
    def get_by_code(db: Session, patient_code: str) -> PatientProfile | None:
        """Fetch patient profile by exact patient code."""
        stmt = (
            select(PatientProfile)
            .options(joinedload(PatientProfile.user))
            .where(
                func.lower(PatientProfile.patient_code)
                == func.lower(patient_code.strip())
            )
        )
        return db.scalar(stmt)

    @staticmethod
    def generate_patient_code(db: Session) -> str:
        """Generate next sequential unique patient code formatted as PAT-00001."""
        count = db.scalar(select(func.count(PatientProfile.id))) or 0
        idx = count + 1
        while True:
            candidate = f"PAT-{idx:05d}"
            existing = PatientRepository.get_by_code(db, candidate)
            if not existing:
                return candidate
            idx += 1

    @staticmethod
    def search_and_paginate(
        db: Session,
        search: str | None = None,
        code: str | None = None,
        name: str | None = None,
        phone: str | None = None,
        email: str | None = None,
        user_id_filter: uuid.UUID | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[PatientProfile], int]:
        """Execute paginated search across code, name, phone, and user email."""
        stmt = select(PatientProfile).join(User, PatientProfile.user_id == User.id)

        filters = []

        if user_id_filter:
            filters.append(PatientProfile.user_id == user_id_filter)

        if search and search.strip():
            term = f"%{search.strip()}%"
            filters.append(
                or_(
                    PatientProfile.patient_code.ilike(term),
                    PatientProfile.first_name.ilike(term),
                    PatientProfile.last_name.ilike(term),
                    PatientProfile.phone.ilike(term),
                    User.email.ilike(term),
                )
            )

        if code and code.strip():
            filters.append(PatientProfile.patient_code.ilike(f"%{code.strip()}%"))

        if name and name.strip():
            name_term = f"%{name.strip()}%"
            filters.append(
                or_(
                    PatientProfile.first_name.ilike(name_term),
                    PatientProfile.last_name.ilike(name_term),
                )
            )

        if phone and phone.strip():
            filters.append(PatientProfile.phone.ilike(f"%{phone.strip()}%"))

        if email and email.strip():
            filters.append(User.email.ilike(f"%{email.strip()}%"))

        if filters:
            stmt = stmt.where(*filters)

        # Count total matches
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.scalar(count_stmt) or 0

        # Apply ordering and pagination
        offset = (page - 1) * page_size
        results_stmt = (
            stmt.options(joinedload(PatientProfile.user))
            .order_by(PatientProfile.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )

        items = list(db.scalars(results_stmt).unique().all())
        return items, total

    @staticmethod
    def create(db: Session, patient: PatientProfile) -> PatientProfile:
        """Persist new patient profile."""
        db.add(patient)
        db.flush()
        return patient

    @staticmethod
    def update(
        db: Session,
        patient: PatientProfile,
        data: dict[str, Any],
    ) -> PatientProfile:
        """Apply updates to patient profile fields."""
        for key, value in data.items():
            if hasattr(patient, key) and value is not None:
                setattr(patient, key, value)
        db.flush()
        return patient

    @staticmethod
    def delete(db: Session, patient: PatientProfile) -> None:
        """Remove patient profile."""
        db.delete(patient)
        db.flush()
