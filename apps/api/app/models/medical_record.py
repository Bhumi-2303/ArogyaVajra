import datetime
import uuid

from sqlalchemy import Column, Date, ForeignKey, Text, Uuid as UUID
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class MedicalRecord(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "medical_records"

    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id"), nullable=False, index=True)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctor_profiles.id"), nullable=False, index=True)
    appointment_id = Column(UUID(as_uuid=True), ForeignKey("appointments.id"), nullable=True)
    record_date = Column(Date, nullable=False)
    chief_complaint = Column(Text, nullable=True)
    clinical_notes = Column(Text, nullable=True)
    diagnosis = Column(Text, nullable=True)
    treatment_notes = Column(Text, nullable=True)
    follow_up_date = Column(Date, nullable=True)

    patient = relationship("PatientProfile", backref="medical_records")
    doctor = relationship("DoctorProfile", backref="medical_records")
    appointment = relationship("Appointment", backref="medical_records")
