import uuid
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.invoice import InvoiceStatus
from app.models.patient import PatientProfile
from app.models.payment import Payment
from app.models.user import User, UserRole
from app.repositories.invoice import InvoiceRepository
from app.schemas.payment import PaymentCreate, PaymentReceiptData
from app.services.audit import record_audit_event


class PaymentService:
    @classmethod
    def record_payment(
        cls,
        db: Session,
        invoice_id: uuid.UUID,
        data: PaymentCreate,
        current_user: User,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> Payment:
        if current_user.role not in [UserRole.ADMIN, UserRole.BILLING_STAFF]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins and billing staff can record payments.",
            )

        invoice = InvoiceRepository.get_by_id(db, invoice_id)
        if not invoice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice not found.",
            )

        if invoice.status == InvoiceStatus.CANCELLED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot record payment for a cancelled invoice.",
            )

        if invoice.status == InvoiceStatus.PAID or invoice.balance <= Decimal("0.00"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invoice is already fully paid.",
            )

        if data.amount <= Decimal("0.00"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment amount must be greater than zero.",
            )

        if data.amount > invoice.balance:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment amount exceeds remaining balance.",
            )

        payment = Payment(
            id=uuid.uuid4(),
            invoice_id=invoice.id,
            amount=data.amount,
            payment_method=data.payment_method,
            reference=data.reference,
            created_by=current_user.id,
        )

        db.add(payment)

        # Update invoice
        old_invoice_status = invoice.status.value
        old_paid_amount = str(invoice.paid_amount)
        old_balance = str(invoice.balance)

        invoice.paid_amount += payment.amount
        invoice.balance -= payment.amount

        if invoice.balance == Decimal("0.00"):
            invoice.status = InvoiceStatus.PAID
        else:
            invoice.status = InvoiceStatus.PARTIALLY_PAID

        db.flush()

        record_audit_event(
            db=db,
            action="PAYMENT_CREATE",
            entity_type="PAYMENT",
            entity_id=str(payment.id),
            user_id=current_user.id,
            new_values={
                "invoice_id": str(payment.invoice_id),
                "amount": str(payment.amount),
                "payment_method": payment.payment_method.value,
            },
            ip_address=ip_address,
            user_agent=user_agent,
        )

        record_audit_event(
            db=db,
            action="INVOICE_PAYMENT_UPDATE",
            entity_type="INVOICE",
            entity_id=str(invoice.id),
            user_id=current_user.id,
            old_values={
                "status": old_invoice_status,
                "paid_amount": old_paid_amount,
                "balance": old_balance,
            },
            new_values={
                "status": invoice.status.value,
                "paid_amount": str(invoice.paid_amount),
                "balance": str(invoice.balance),
            },
            ip_address=ip_address,
            user_agent=user_agent,
        )

        return payment

    @classmethod
    def get_payment_receipt(
        cls,
        db: Session,
        invoice_id: uuid.UUID,
        payment_id: uuid.UUID,
        current_user: User,
    ) -> PaymentReceiptData:
        """Retrieve formatted payment receipt data honoring invoice read permissions."""
        from app.services.invoice import InvoiceService

        # Same authorization rules as invoice read
        invoice = InvoiceService.get_invoice(db, invoice_id, current_user)

        payment = db.scalar(
            select(Payment).where(
                Payment.id == payment_id,
                Payment.invoice_id == invoice_id,
            )
        )
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment receipt not found.",
            )

        patient = db.scalar(
            select(PatientProfile).where(PatientProfile.id == invoice.patient_id)
        )
        patient_name = (
            f"{patient.first_name} {patient.last_name}" if patient else None
        )
        patient_code = patient.patient_code if patient else None
        receipt_number = f"REC-{invoice.invoice_number}-{payment.id.hex[:6].upper()}"

        return PaymentReceiptData(
            receipt_number=receipt_number,
            payment_id=payment.id,
            invoice_id=invoice.id,
            invoice_number=invoice.invoice_number,
            patient_id=invoice.patient_id,
            patient_name=patient_name,
            patient_code=patient_code,
            amount_paid=payment.amount,
            payment_date=payment.created_at,
            payment_method=payment.payment_method,
            reference=payment.reference,
            invoice_total=invoice.total,
            invoice_paid_amount=invoice.paid_amount,
            invoice_balance=invoice.balance,
            invoice_status=invoice.status.value,
            received_by=payment.created_by,
        )

