"""Repository layer for User entity database interactions."""

import math
import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.user import User, UserRole


class UserRepository:
    """Encapsulates database operations on the User model."""

    @staticmethod
    def get_by_id(db: Session, user_id: uuid.UUID) -> User | None:
        """Fetch a user by primary key."""
        return db.get(User, user_id)

    @staticmethod
    def get_by_email(db: Session, email: str) -> User | None:
        """Fetch a user by email address."""
        return db.scalar(select(User).where(User.email == email.lower()))

    @staticmethod
    def count_active_admins(db: Session) -> int:
        """Count the number of active administrators in the system."""
        return (
            db.scalar(
                select(func.count(User.id)).where(
                    User.role == UserRole.ADMIN,
                    User.is_active.is_(True),
                )
            )
            or 0
        )

    @staticmethod
    def search_and_paginate(
        db: Session,
        search: str | None = None,
        role: UserRole | None = None,
        is_active: bool | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[User], int, int]:
        """Search users with filtering by email, role, active status and pagination."""
        query = select(User)

        if search:
            search_pattern = f"%{search.strip().lower()}%"
            query = query.where(func.lower(User.email).like(search_pattern))

        if role:
            query = query.where(User.role == role)

        if is_active is not None:
            query = query.where(User.is_active.is_(is_active))

        # Count total matches
        total_stmt = select(func.count()).select_from(query.subquery())
        total = db.scalar(total_stmt) or 0

        # Calculate total pages
        total_pages = math.ceil(total / page_size) if total > 0 else 0

        # Order by created_at descending
        offset = (page - 1) * page_size
        results_stmt = (
            query.order_by(User.created_at.desc()).offset(offset).limit(page_size)
        )
        users = list(db.scalars(results_stmt).all())

        return users, total, total_pages

    @staticmethod
    def update(
        db: Session,
        user: User,
        role: UserRole | None = None,
        is_active: bool | None = None,
    ) -> User:
        """Update role and/or active status for a user."""
        if role is not None:
            user.role = role
        if is_active is not None:
            user.is_active = is_active

        db.add(user)
        db.flush()
        return user
