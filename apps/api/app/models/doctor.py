"""DoctorProfile entity model according to DATABASE-SCHEMA.md Section 2.3."""

import uuid
import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, Numeric, SmallInteger, String, Text, Time, Boolean, Uuid as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User


class DoctorProfile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Doctor clinical profile, specialization, credentials, and consultation details."""

    __tablename__ = "doctor_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    doctor_code: Mapped[str] = mapped_column(
        String(32),
        unique=True,
        nullable=False,
        index=True,
    )
    first_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    last_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    specialization: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )
    qualification: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
    license_number: Mapped[str | None] = mapped_column(
        String(50),
        unique=True,
        nullable=True,
    )
    phone: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )
    consultation_fee: Mapped[Decimal] = mapped_column(
        Numeric(precision=10, scale=2, asdecimal=True),
        nullable=False,
        default=Decimal("0.00"),
    )
    bio: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="doctor_profile",
        lazy="joined",
    )
    availabilities: Mapped[list["DoctorAvailability"]] = relationship(
        "DoctorAvailability",
        back_populates="doctor",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<DoctorProfile code={self.doctor_code} name={self.first_name} {self.last_name} spec={self.specialization}>"


class DoctorAvailability(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Weekly recurring schedule definitions for appointment slot generation."""

    __tablename__ = "doctor_availability"
    __table_args__ = (
        CheckConstraint("start_time < end_time", name="ck_doctor_availability_time_order"),
        CheckConstraint("slot_duration_minutes > 0", name="ck_doctor_availability_slot_duration_positive"),
        CheckConstraint("day_of_week >= 0 AND day_of_week <= 6", name="ck_doctor_availability_day_of_week_range"),
    )

    doctor_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("doctor_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    day_of_week: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False,
    )
    start_time: Mapped["datetime.time"] = mapped_column(
        Time,
        nullable=False,
    )
    end_time: Mapped["datetime.time"] = mapped_column(
        Time,
        nullable=False,
    )
    slot_duration_minutes: Mapped[int] = mapped_column(
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    # Relationships
    doctor: Mapped["DoctorProfile"] = relationship(
        "DoctorProfile",
        back_populates="availabilities",
    )

    def __repr__(self) -> str:
        return f"<DoctorAvailability doctor_id={self.doctor_id} day={self.day_of_week} {self.start_time}-{self.end_time}>"
