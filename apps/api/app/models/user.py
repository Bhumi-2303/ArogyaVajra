"""User domain model and Role enumeration."""

import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.doctor import DoctorProfile
    from app.models.patient import PatientProfile


class UserRole(str, enum.Enum):
    """Authoritative user roles across Arogyavajra platform."""

    PATIENT = "PATIENT"
    DOCTOR = "DOCTOR"
    RECEPTIONIST = "RECEPTIONIST"
    BILLING_STAFF = "BILLING_STAFF"
    ADMIN = "ADMIN"


# User role column definition with cross-database compatibility
UserRoleType = Enum(
    UserRole,
    name="user_role",
    native_enum=False,
    values_callable=lambda x: [e.value for e in x],
)


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Core authentication, credentials, and role entity."""

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    password_hash: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    role: Mapped[UserRole] = mapped_column(
        UserRoleType,
        index=True,
        nullable=False,
        default=UserRole.PATIENT,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="true",
        nullable=False,
    )
    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=None,
    )

    # Relationships
    patient_profile: Mapped["PatientProfile | None"] = relationship(
        "PatientProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    doctor_profile: Mapped["DoctorProfile | None"] = relationship(
        "DoctorProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"
