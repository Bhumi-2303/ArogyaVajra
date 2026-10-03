import datetime
import enum
import uuid

from sqlalchemy import Column, Date, Enum as SQLAlchemyEnum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class PrescriptionStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class Prescription(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "prescriptions"

    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id"), nullable=False, index=True)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctor_profiles.id"), nullable=False, index=True)
    appointment_id = Column(UUID(as_uuid=True), ForeignKey("appointments.id"), nullable=True, index=True)
    prescription_date = Column(Date, nullable=False)
    instructions = Column(Text, nullable=True)
    status = Column(SQLAlchemyEnum(PrescriptionStatus), nullable=False, default=PrescriptionStatus.ACTIVE)

    patient = relationship("PatientProfile", backref="prescriptions")
    doctor = relationship("DoctorProfile", backref="prescriptions")
    appointment = relationship("Appointment", backref="prescriptions")
    items = relationship(
        "PrescriptionItem",
        backref="prescription",
        cascade="all, delete-orphan",
    )


class PrescriptionItem(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "prescription_items"

    prescription_id = Column(UUID(as_uuid=True), ForeignKey("prescriptions.id", ondelete="CASCADE"), nullable=False, index=True)
    medicine_name = Column(String(200), nullable=False)
    dosage = Column(String(100), nullable=False)
    frequency = Column(String(100), nullable=False)
    duration = Column(String(100), nullable=False)
    route = Column(String(50), nullable=True)
    instructions = Column(Text, nullable=True)
