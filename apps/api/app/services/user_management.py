"""Service orchestrating administrative user management and audit logging."""

import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.repositories.user import UserRepository
from app.schemas.user import UserUpdate
from app.services.audit import record_audit_event


class UserManagementService:
    """Service handling administrator user management operations."""

    @staticmethod
    def _verify_admin(current_user: User) -> None:
        """Enforce that only administrators can access user management."""
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Administrator privileges required.",
            )

    @classmethod
    def list_users(
        cls,
        db: Session,
        current_user: User,
        search: str | None = None,
        role: UserRole | None = None,
        is_active: bool | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[User], int, int]:
        """Search and paginate users with filters."""
        cls._verify_admin(current_user)
        return UserRepository.search_and_paginate(
            db=db,
            search=search,
            role=role,
            is_active=is_active,
            page=page,
            page_size=page_size,
        )

    @classmethod
    def get_user_detail(
        cls,
        db: Session,
        user_id: uuid.UUID,
        current_user: User,
    ) -> User:
        """Retrieve single user details."""
        cls._verify_admin(current_user)
        user = UserRepository.get_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )
        return user

    @classmethod
    def update_user(
        cls,
        db: Session,
        user_id: uuid.UUID,
        data: UserUpdate,
        current_user: User,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> User:
        """Update role and/or activation status with clinical safety checks and audit logs."""
        cls._verify_admin(current_user)
        user = cls.get_user_detail(db, user_id, current_user)

        old_role = user.role
        old_is_active = user.is_active

        # Check self-deactivation prevention
        if data.is_active is False and user.id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Administrators cannot deactivate their own active account.",
            )

        # Check last active admin protection on deactivation
        if (
            data.is_active is False
            and user.role == UserRole.ADMIN
            and UserRepository.count_active_admins(db) <= 1
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot deactivate the last active administrator.",
            )

        # Check last active admin protection on role demotion
        if (
            data.role is not None
            and data.role != UserRole.ADMIN
            and user.role == UserRole.ADMIN
            and UserRepository.count_active_admins(db) <= 1
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot change role of the last active administrator.",
            )

        # Apply updates
        UserRepository.update(
            db=db,
            user=user,
            role=data.role,
            is_active=data.is_active,
        )

        # Record audit log for role change
        if data.role is not None and data.role != old_role:
            record_audit_event(
                db=db,
                action="USER_ROLE_UPDATE",
                entity_type="USER",
                entity_id=str(user.id),
                user_id=current_user.id,
                old_values={"role": old_role.value},
                new_values={"role": data.role.value},
                ip_address=ip_address,
                user_agent=user_agent,
            )

        # Record audit log for status change
        if data.is_active is not None and data.is_active != old_is_active:
            action = "USER_ACTIVATE" if data.is_active else "USER_DEACTIVATE"
            record_audit_event(
                db=db,
                action=action,
                entity_type="USER",
                entity_id=str(user.id),
                user_id=current_user.id,
                old_values={"is_active": old_is_active},
                new_values={"is_active": data.is_active},
                ip_address=ip_address,
                user_agent=user_agent,
            )

        return user

    @classmethod
    def activate_user(
        cls,
        db: Session,
        user_id: uuid.UUID,
        current_user: User,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> User:
        """Activate an inactive user account."""
        return cls.update_user(
            db=db,
            user_id=user_id,
            data=UserUpdate(is_active=True),
            current_user=current_user,
            ip_address=ip_address,
            user_agent=user_agent,
        )

    @classmethod
    def deactivate_user(
        cls,
        db: Session,
        user_id: uuid.UUID,
        current_user: User,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> User:
        """Deactivate an active user account."""
        return cls.update_user(
            db=db,
            user_id=user_id,
            data=UserUpdate(is_active=False),
            current_user=current_user,
            ip_address=ip_address,
            user_agent=user_agent,
        )
