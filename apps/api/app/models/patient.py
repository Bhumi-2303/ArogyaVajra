"""PatientProfile entity model according to DATABASE-SCHEMA.md Section 2.2."""

import uuid
from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Date, ForeignKey, Index, String, Text, Uuid as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User


class PatientProfile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Patient demographic, identification, and clinical contact records."""

    __tablename__ = "patient_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    patient_code: Mapped[str] = mapped_column(
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
    date_of_birth: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )
    gender: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )
    phone: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
        index=True,
    )
    address: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    emergency_contact_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
    emergency_contact_phone: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="patient_profile",
        lazy="joined",
    )

    __table_args__ = (
        Index("ix_patient_profiles_patient_code", "patient_code"),
        Index("ix_patient_profiles_phone", "phone"),
    )

    @property
    def full_name(self) -> str:
        """Convenience property for display."""
        return f"{self.first_name} {self.last_name}".strip()

    def __repr__(self) -> str:
        return (
            f"<PatientProfile id={self.id} code={self.patient_code} "
            f"name='{self.full_name}' user_id={self.user_id}>"
        )
