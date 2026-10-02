"""Repository layer for DoctorProfile database operations."""

import math
import uuid

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.models.doctor import DoctorProfile
from app.models.user import User


class DoctorRepository:
    """Encapsulates database operations on the DoctorProfile entity."""

    @staticmethod
    def generate_doctor_code(db: Session) -> str:
        """Generate the next sequential human-readable doctor code (e.g. DOC-00001)."""
        pattern = "DOC-"
        query = select(DoctorProfile.doctor_code).where(
            DoctorProfile.doctor_code.like(f"{pattern}%")
        )
        codes = db.scalars(query).all()

        max_seq = 0
        for code in codes:
            try:
                numeric_part = code[len(pattern) :]
                seq = int(numeric_part)
                max_seq = max(max_seq, seq)
            except ValueError:
                continue

        next_seq = max_seq + 1
        return f"DOC-{next_seq:05d}"

    @staticmethod
    def get_by_id(db: Session, doctor_id: uuid.UUID) -> DoctorProfile | None:
        """Fetch a doctor profile by UUID with joined user account."""
        query = (
            select(DoctorProfile)
            .options(joinedload(DoctorProfile.user))
            .where(DoctorProfile.id == doctor_id)
        )
        return db.scalar(query)

    @staticmethod
    def get_by_user_id(db: Session, user_id: uuid.UUID) -> DoctorProfile | None:
        """Fetch a doctor profile associated with a specific user ID."""
        query = (
            select(DoctorProfile)
            .options(joinedload(DoctorProfile.user))
            .where(DoctorProfile.user_id == user_id)
        )
        return db.scalar(query)

    @staticmethod
    def get_by_code(db: Session, code: str) -> DoctorProfile | None:
        """Fetch a doctor profile by unique doctor code."""
        query = (
            select(DoctorProfile)
            .options(joinedload(DoctorProfile.user))
            .where(func.upper(DoctorProfile.doctor_code) == code.upper().strip())
        )
        return db.scalar(query)

    @staticmethod
    def search_and_paginate(
        db: Session,
        search: str | None = None,
        name: str | None = None,
        specialization: str | None = None,
        code: str | None = None,
        is_active: bool | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[DoctorProfile], int, int]:
        """Search doctors with multi-field filtering and pagination."""
        query = (
            select(DoctorProfile)
            .join(User, DoctorProfile.user_id == User.id)
            .options(joinedload(DoctorProfile.user))
        )

        # Global search query
        if search:
            pattern = f"%{search.strip().lower()}%"
            full_name = func.lower(
                func.concat(DoctorProfile.first_name, " ", DoctorProfile.last_name)
            )
            query = query.where(
                or_(
                    full_name.like(pattern),
                    func.lower(DoctorProfile.doctor_code).like(pattern),
                    func.lower(DoctorProfile.specialization).like(pattern),
                    func.lower(DoctorProfile.phone).like(pattern),
                    func.lower(User.email).like(pattern),
                )
            )

        # Name search
        if name:
            name_pattern = f"%{name.strip().lower()}%"
            full_name = func.lower(
                func.concat(DoctorProfile.first_name, " ", DoctorProfile.last_name)
            )
            query = query.where(
                or_(
                    func.lower(DoctorProfile.first_name).like(name_pattern),
                    func.lower(DoctorProfile.last_name).like(name_pattern),
                    full_name.like(name_pattern),
                )
            )

        # Specialization filter
        if specialization:
            spec_pattern = f"%{specialization.strip().lower()}%"
            query = query.where(
                func.lower(DoctorProfile.specialization).like(spec_pattern)
            )

        # Doctor code filter
        if code:
            code_pattern = f"%{code.strip().lower()}%"
            query = query.where(
                func.lower(DoctorProfile.doctor_code).like(code_pattern)
            )

        # Active status filter
        if is_active is not None:
            query = query.where(User.is_active.is_(is_active))

        # Total count
        total_stmt = select(func.count()).select_from(query.subquery())
        total = db.scalar(total_stmt) or 0
        total_pages = math.ceil(total / page_size) if total > 0 else 0

        # Paginated results ordered by creation timestamp
        offset = (page - 1) * page_size
        results_stmt = (
            query.order_by(DoctorProfile.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        doctors = list(db.scalars(results_stmt).unique().all())

        return doctors, total, total_pages

    @staticmethod
    def create(db: Session, doctor: DoctorProfile) -> DoctorProfile:
        """Persist a new doctor profile."""
        db.add(doctor)
        db.flush()
        return doctor

    @staticmethod
    def delete(db: Session, doctor: DoctorProfile) -> None:
        """Delete a doctor profile."""
        db.delete(doctor)
        db.flush()
