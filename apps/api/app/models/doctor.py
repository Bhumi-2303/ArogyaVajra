"""DoctorProfile entity model according to DATABASE-SCHEMA.md Section 2.3."""

import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
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

    def __repr__(self) -> str:
        return f"<DoctorProfile code={self.doctor_code} name={self.first_name} {self.last_name} spec={self.specialization}>"
