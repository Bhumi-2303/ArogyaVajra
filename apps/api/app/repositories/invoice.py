import uuid

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.invoice import Invoice


class InvoiceRepository:
    @staticmethod
    def get_by_id(db: Session, invoice_id: uuid.UUID) -> Invoice | None:
        return db.query(Invoice).filter(Invoice.id == invoice_id).first()

    @staticmethod
    def get_next_invoice_number(db: Session) -> str:
        bind = db.get_bind()
        if bind.dialect.name == "postgresql":
            from sqlalchemy import text

            next_id = db.execute(text("SELECT nextval('invoice_number_seq')")).scalar()
            return f"INV-{next_id:05d}"
        count = db.query(func.count(Invoice.id)).scalar() or 0
        return f"INV-{(count + 1):05d}"

    @staticmethod
    def create(db: Session, invoice: Invoice) -> Invoice:
        db.add(invoice)
        db.flush()
        return invoice

    @staticmethod
    def search(
        db: Session,
        patient_id: uuid.UUID | None = None,
        status: str | None = None,
        invoice_number: str | None = None,
        invoice_date: str | None = None,
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
