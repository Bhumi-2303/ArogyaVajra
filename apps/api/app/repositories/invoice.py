import uuid
from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.invoice import Invoice


class InvoiceRepository:
    @staticmethod
    def get_by_id(db: Session, invoice_id: uuid.UUID) -> Optional[Invoice]:
        return db.query(Invoice).filter(Invoice.id == invoice_id).first()

    @staticmethod
    def get_next_invoice_number(db: Session) -> str:
        count = db.query(func.count(Invoice.id)).scalar()
        next_id = (count or 0) + 1
        return f"INV-{next_id:05d}"

    @staticmethod
    def create(db: Session, invoice: Invoice) -> Invoice:
        db.add(invoice)
        db.flush()
        return invoice

    @staticmethod
    def search(
        db: Session,
        patient_id: Optional[uuid.UUID] = None,
        status: Optional[str] = None,
        invoice_number: Optional[str] = None,
        invoice_date: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Invoice], int]:
        query = db.query(Invoice)

        if patient_id:
            query = query.filter(Invoice.patient_id == patient_id)
        if status:
            query = query.filter(Invoice.status == status)
        if invoice_number:
            query = query.filter(Invoice.invoice_number.ilike(f"%{invoice_number}%"))
        if invoice_date:
            query = query.filter(Invoice.invoice_date == invoice_date)

        total = query.count()
        items = query.order_by(Invoice.invoice_date.desc(), Invoice.created_at.desc()).offset(skip).limit(limit).all()

        return items, total
