import uuid
from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.invoice import Invoice, InvoiceItem, InvoiceStatus
from app.models.user import User, UserRole
from app.repositories.invoice import InvoiceRepository
from app.repositories.patient import PatientRepository
from app.repositories.appointment import AppointmentRepository
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate
from app.services.audit import record_audit_event


class InvoiceService:
    @classmethod
    def create_invoice(
        cls,
        db: Session,
        data: InvoiceCreate,
        current_user: User,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> Invoice:
        if current_user.role not in [UserRole.ADMIN, UserRole.BILLING_STAFF]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins and billing staff can create invoices.",
            )

        patient = PatientRepository.get_by_id(db, data.patient_id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found.",
            )

        if data.appointment_id:
            appointment = AppointmentRepository.get_by_id(db, data.appointment_id)
            if not appointment:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Appointment not found.",
                )
            if appointment.patient_id != patient.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Appointment does not belong to the patient.",
                )

        invoice_number = InvoiceRepository.get_next_invoice_number(db)

        # Backend calculation is authoritative
        subtotal = Decimal("0.00")
        items = []
        for item_data in data.items:
            amount = item_data.quantity * item_data.unit_price
            subtotal += amount
            item = InvoiceItem(
                id=uuid.uuid4(),
                description=item_data.description,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
                amount=amount,
            )
            items.append(item)

        discount = data.discount or Decimal("0.00")
        tax = data.tax or Decimal("0.00")
        total = subtotal - discount + tax

        if total < Decimal("0.00"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Total cannot be negative.",
            )

        invoice = Invoice(
            id=uuid.uuid4(),
            invoice_number=invoice_number,
            patient_id=data.patient_id,
            appointment_id=data.appointment_id,
            invoice_date=data.invoice_date,
            subtotal=subtotal,
            discount=discount,
            tax=tax,
            total=total,
            paid_amount=Decimal("0.00"),
            balance=total,
            status=data.status,
            created_by=current_user.id,
        )

        for item in items:
            invoice.items.append(item)

        InvoiceRepository.create(db, invoice)

        record_audit_event(
            db=db,
            action="INVOICE_CREATE",
            entity_type="INVOICE",
            entity_id=str(invoice.id),
            user_id=current_user.id,
            new_values={
                "invoice_number": invoice.invoice_number,
                "patient_id": str(invoice.patient_id),
                "total": str(invoice.total),
                "status": invoice.status.value,
            },
            ip_address=ip_address,
            user_agent=user_agent,
        )

        return invoice

    @classmethod
    def get_invoice(cls, db: Session, invoice_id: uuid.UUID, current_user: User) -> Invoice:
        invoice = InvoiceRepository.get_by_id(db, invoice_id)
        if not invoice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice not found.",
            )

        if current_user.role == UserRole.PATIENT:
            patient = PatientRepository.get_by_user_id(db, current_user.id)
            if not patient or patient.id != invoice.patient_id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")
        
        return invoice

    @classmethod
    def update_invoice(
        cls,
        db: Session,
        invoice_id: uuid.UUID,
        data: InvoiceUpdate,
        current_user: User,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> Invoice:
        if current_user.role not in [UserRole.ADMIN, UserRole.BILLING_STAFF]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins and billing staff can update invoices.",
            )

        invoice = cls.get_invoice(db, invoice_id, current_user)
        
        if invoice.status in [InvoiceStatus.PAID, InvoiceStatus.CANCELLED]:
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot modify a paid or cancelled invoice.",
            )

        old_values = {
            "status": invoice.status.value,
        }

        if data.status is not None:
            invoice.status = data.status

        db.add(invoice)
        db.flush()

        new_values = {
            "status": invoice.status.value,
        }

        record_audit_event(
            db=db,
            action="INVOICE_UPDATE",
            entity_type="INVOICE",
            entity_id=str(invoice.id),
            user_id=current_user.id,
            old_values=old_values,
            new_values=new_values,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        return invoice

    @classmethod
    def list_invoices(
        cls,
        db: Session,
        current_user: User,
        patient_id: uuid.UUID | None = None,
        status: str | None = None,
        invoice_number: str | None = None,
        date: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Invoice], int]:
        if current_user.role == UserRole.PATIENT:
            patient = PatientRepository.get_by_user_id(db, current_user.id)
            if not patient:
                return [], 0
            if patient_id and patient_id != patient.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")
            patient_id = patient.id

        skip = (page - 1) * page_size
        return InvoiceRepository.search(
            db=db,
            patient_id=patient_id,
            status=status,
            invoice_number=invoice_number,
            invoice_date=date,
            skip=skip,
            limit=page_size
        )
