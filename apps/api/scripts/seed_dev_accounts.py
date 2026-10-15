#!/usr/bin/env python3
"""Idempotent seed script for ArogyaVajra development & demonstration accounts.

Creates authoritative accounts and complete clinical profiles for:
- ADMIN: admin@arogyavajra.com
- DOCTOR: doctor@arogyavajra.com (Dr. Ananya Sharma - Cardiology)
- RECEPTIONIST: receptionist@arogyavajra.com
- BILLING_STAFF: billing@arogyavajra.com
- PATIENT: patient@arogyavajra.com (Ramesh Gupta)

Password for all accounts: ArogyaVajra@2026!
"""

from __future__ import annotations

import os
import sys
import uuid
from datetime import UTC, date, datetime, time
from decimal import Decimal

# Add apps/api to python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import create_engine, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.models.appointment import Appointment, AppointmentStatus
from app.models.doctor import DoctorAvailability, DoctorProfile
from app.models.invoice import Invoice, InvoiceItem, InvoiceStatus
from app.models.medical_record import MedicalRecord
from app.models.patient import PatientProfile
from app.models.payment import Payment, PaymentMethod
from app.models.prescription import Prescription, PrescriptionItem, PrescriptionStatus
from app.models.user import User, UserRole
from app.repositories.appointment import AppointmentRepository
from app.repositories.doctor import DoctorRepository
from app.repositories.invoice import InvoiceRepository
from app.repositories.patient import PatientRepository

DEV_PASSWORD = "ArogyaVajra@2026!"


def get_db_engine():
    """Resolve database URL and return SQLAlchemy engine."""
    db_url = os.environ.get("DATABASE_URL") or settings.DATABASE_URL
    try:
        engine = create_engine(db_url)
        with engine.connect():
            return engine
    except (SQLAlchemyError, OSError):
        fallback_url = "postgresql+psycopg://arogyavajra:arogyavajra_dev_password@localhost:5434/arogyavajra"
        engine = create_engine(fallback_url)
        with engine.connect():
            return engine


def seed_accounts() -> None:
    engine = get_db_engine()
    print(f"Connected to database: {engine.url.render_as_string(hide_password=True)}")

    hashed_pw = hash_password(DEV_PASSWORD)

    with Session(engine) as db:
        # 1. Admin Account
        admin_email = "admin@arogyavajra.com"
        admin_user = db.scalar(select(User).where(User.email == admin_email))
        if not admin_user:
            admin_user = User(
                email=admin_email,
                password_hash=hashed_pw,
                role=UserRole.ADMIN,
                is_active=True,
            )
            db.add(admin_user)
            db.flush()
            print(f"[+] Created Admin: {admin_email}")
        else:
            admin_user.password_hash = hashed_pw
            admin_user.is_active = True
            print(f"[*] Updated Admin: {admin_email}")

        # 2. Receptionist Account
        rec_email = "receptionist@arogyavajra.com"
        rec_user = db.scalar(select(User).where(User.email == rec_email))
        if not rec_user:
            rec_user = User(
                email=rec_email,
                password_hash=hashed_pw,
                role=UserRole.RECEPTIONIST,
                is_active=True,
            )
            db.add(rec_user)
            db.flush()
            print(f"[+] Created Receptionist: {rec_email}")
        else:
            rec_user.password_hash = hashed_pw
            rec_user.is_active = True
            print(f"[*] Updated Receptionist: {rec_email}")

        # 3. Billing Staff Account
        bill_email = "billing@arogyavajra.com"
        bill_user = db.scalar(select(User).where(User.email == bill_email))
        if not bill_user:
            bill_user = User(
                email=bill_email,
                password_hash=hashed_pw,
                role=UserRole.BILLING_STAFF,
                is_active=True,
            )
            db.add(bill_user)
            db.flush()
            print(f"[+] Created Billing Staff: {bill_email}")
        else:
            bill_user.password_hash = hashed_pw
            bill_user.is_active = True
            print(f"[*] Updated Billing Staff: {bill_email}")

        # 4. Doctor Account & Profile
        doc_email = "doctor@arogyavajra.com"
        doc_user = db.scalar(select(User).where(User.email == doc_email))
        if not doc_user:
            doc_user = User(
                email=doc_email,
                password_hash=hashed_pw,
                role=UserRole.DOCTOR,
                is_active=True,
            )
            db.add(doc_user)
            db.flush()
            print(f"[+] Created Doctor User: {doc_email}")
        else:
            doc_user.password_hash = hashed_pw
            doc_user.is_active = True
            print(f"[*] Updated Doctor User: {doc_email}")

        doc_profile = db.scalar(select(DoctorProfile).where(DoctorProfile.user_id == doc_user.id))
        if not doc_profile:
            doc_code = DoctorRepository.generate_doctor_code(db)
            lic_num = f"MED-CARDIO-{uuid.uuid4().hex[:6].upper()}"
            doc_profile = DoctorProfile(
                user_id=doc_user.id,
                doctor_code=doc_code,
                first_name="Ananya",
                last_name="Sharma",
                specialization="Cardiology",
                qualification="MBBS, MD (Cardiology)",
                license_number=lic_num,
                phone="+91-9876543210",
                consultation_fee=Decimal("500.00"),
                bio="Senior Consultant Cardiologist with extensive clinical experience in preventive and interventional cardiology.",
            )
            db.add(doc_profile)
            db.flush()
            print(f"[+] Created DoctorProfile: Dr. Ananya Sharma ({doc_profile.doctor_code})")
        else:
            print(f"[*] DoctorProfile already exists: Dr. {doc_profile.first_name} {doc_profile.last_name}")

        # Doctor Availability (Mon-Fri 09:00 - 17:00)
        existing_avail = db.scalars(
            select(DoctorAvailability).where(DoctorAvailability.doctor_id == doc_profile.id)
        ).all()
        if not existing_avail:
            for day in range(5):  # 0 to 4 (Monday to Friday)
                avail = DoctorAvailability(
                    doctor_id=doc_profile.id,
                    day_of_week=day,
                    start_time=time(9, 0),
                    end_time=time(17, 0),
                    slot_duration_minutes=30,
                    is_active=True,
                )
                db.add(avail)
            print("[+] Seeded Doctor Availability (Mon-Fri 09:00 - 17:00)")

        # 5. Patient Account & Profile
        pat_email = "patient@arogyavajra.com"
        pat_user = db.scalar(select(User).where(User.email == pat_email))
        if not pat_user:
            pat_user = User(
                email=pat_email,
                password_hash=hashed_pw,
                role=UserRole.PATIENT,
                is_active=True,
            )
            db.add(pat_user)
            db.flush()
            print(f"[+] Created Patient User: {pat_email}")
        else:
            pat_user.password_hash = hashed_pw
            pat_user.is_active = True
            print(f"[*] Updated Patient User: {pat_email}")

        pat_profile = db.scalar(select(PatientProfile).where(PatientProfile.user_id == pat_user.id))
        if not pat_profile:
            pat_code = PatientRepository.generate_patient_code(db)
            pat_profile = PatientProfile(
                user_id=pat_user.id,
                patient_code=pat_code,
                first_name="Ramesh",
                last_name="Gupta",
                date_of_birth=date(1990, 5, 15),
                gender="MALE",
                phone="+91-9123456789",
                address="Flat 402, Green Meadows, Bengaluru, Karnataka",
                emergency_contact_name="Sunita Gupta",
                emergency_contact_phone="+91-9123456780",
            )
            db.add(pat_profile)
            db.flush()
            print(f"[+] Created PatientProfile: Ramesh Gupta ({pat_profile.patient_code})")
        else:
            print(f"[*] PatientProfile already exists: {pat_profile.first_name} {pat_profile.last_name}")

        # 6. Clinical Records (Appointment, Medical Record, Prescription, Invoice)
        today = datetime.now(UTC).date()
        apt = db.scalar(
            select(Appointment).where(
                Appointment.patient_id == pat_profile.id,
                Appointment.doctor_id == doc_profile.id,
            )
        )
        if not apt:
            apt_code = AppointmentRepository.generate_appointment_code(db)
            apt = Appointment(
                appointment_code=apt_code,
                patient_id=pat_profile.id,
                doctor_id=doc_profile.id,
                appointment_date=today,
                start_time=time(10, 0),
                end_time=time(10, 30),
                reason="Routine cardiovascular health checkup and consultation",
                status=AppointmentStatus.CONFIRMED,
                notes="Patient requested morning slot.",
                created_by=rec_user.id,
            )
            db.add(apt)
            db.flush()
            print(f"[+] Seeded Appointment: {apt.appointment_code}")

        mr = db.scalar(
            select(MedicalRecord).where(
                MedicalRecord.patient_id == pat_profile.id,
                MedicalRecord.doctor_id == doc_profile.id,
            )
        )
        if not mr:
            mr = MedicalRecord(
                patient_id=pat_profile.id,
                doctor_id=doc_profile.id,
                appointment_id=apt.id,
                record_date=today,
                chief_complaint="Mild palpitations during high exertion; occasional fatigue",
                clinical_notes="BP 128/82 mmHg, resting heart rate 74 bpm. Normal S1/S2 heart sounds. Resting 12-lead ECG showed normal sinus rhythm.",
                diagnosis="Benign sinus arrhythmia; early stage primary essential hypertension (controlled)",
                treatment_notes="Prescribed Metoprolol 25mg daily. Advised 30 minutes daily moderate aerobic exercise and reduced sodium intake.",
                follow_up_date=date(today.year, today.month + 1 if today.month < 12 else 1, min(today.day, 28)),
            )
            db.add(mr)
            db.flush()
            print("[+] Seeded MedicalRecord for Ramesh Gupta")

        rx = db.scalar(
            select(Prescription).where(
                Prescription.patient_id == pat_profile.id,
                Prescription.doctor_id == doc_profile.id,
            )
        )
        if not rx:
            rx = Prescription(
                patient_id=pat_profile.id,
                doctor_id=doc_profile.id,
                appointment_id=apt.id,
                prescription_date=today,
                instructions="Take tablets with breakfast with a glass of water.",
                status=PrescriptionStatus.ACTIVE,
            )
            db.add(rx)
            db.flush()

            rx_item = PrescriptionItem(
                prescription_id=rx.id,
                medicine_name="Metoprolol Succinate ER 25mg",
                dosage="25mg",
                frequency="Once daily",
                duration="30 days",
                route="Oral",
                instructions="Take with water after breakfast.",
            )
            db.add(rx_item)
            print("[+] Seeded Prescription with Medication Items")

        inv = db.scalar(
            select(Invoice).where(
                Invoice.patient_id == pat_profile.id,
                Invoice.appointment_id == apt.id,
            )
        )
        if not inv:
            inv_number = InvoiceRepository.get_next_invoice_number(db)
            inv = Invoice(
                invoice_number=inv_number,
                patient_id=pat_profile.id,
                appointment_id=apt.id,
                invoice_date=today,
                subtotal=Decimal("650.00"),
                discount=Decimal("0.00"),
                tax=Decimal("0.00"),
                total=Decimal("650.00"),
                paid_amount=Decimal("650.00"),
                balance=Decimal("0.00"),
                status=InvoiceStatus.PAID,
                created_by=bill_user.id,
            )
            db.add(inv)
            db.flush()

            inv_item1 = InvoiceItem(
                invoice_id=inv.id,
                description="Specialist Cardiology Consultation",
                quantity=Decimal("1.00"),
                unit_price=Decimal("500.00"),
                amount=Decimal("500.00"),
            )
            inv_item2 = InvoiceItem(
                invoice_id=inv.id,
                description="12-Lead Diagnostic Electrocardiogram (ECG)",
                quantity=Decimal("1.00"),
                unit_price=Decimal("150.00"),
                amount=Decimal("150.00"),
            )
            db.add_all([inv_item1, inv_item2])
            db.flush()

            pmt = Payment(
                invoice_id=inv.id,
                amount=Decimal("650.00"),
                payment_method=PaymentMethod.UPI,
                reference=f"UPI-TXN-{uuid.uuid4().hex[:8].upper()}",
                created_by=bill_user.id,
            )
            db.add(pmt)
            print(f"[+] Seeded Invoice {inv.invoice_number} and Settled UPI Payment")

        db.commit()
        print("\n=== All Development & Role Demonstration Accounts Successfully Seeded ===")
        print(f"Default Password for all accounts: {DEV_PASSWORD}")
        print("Accounts provisioned:")
        print("  - Admin:        admin@arogyavajra.com       -> /admin")
        print("  - Doctor:       doctor@arogyavajra.com      -> /doctor")
        print("  - Receptionist: receptionist@arogyavajra.com-> /receptionist")
        print("  - Billing:      billing@arogyavajra.com     -> /billing")
        print("  - Patient:      patient@arogyavajra.com     -> /patient")


if __name__ == "__main__":
    seed_accounts()
