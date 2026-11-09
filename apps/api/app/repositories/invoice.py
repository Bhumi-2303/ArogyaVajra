import uuid
from datetime import date

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.invoice import Invoice, InvoiceItem, InvoiceStatus


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
        q: str | None = None,
        patient_id: uuid.UUID | None = None,
        status: InvoiceStatus | str | None = None,
        invoice_number: str | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
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
        if start_date:
            query = query.filter(Invoice.invoice_date >= start_date)
        if end_date:
            query = query.filter(Invoice.invoice_date <= end_date)
        if q and q.strip():
            search_pattern = f"%{q.strip()}%"
            query = query.filter(
                or_(
                    Invoice.invoice_number.ilike(search_pattern),
                    Invoice.items.any(
                        InvoiceItem.description.ilike(search_pattern)
                    ),
                )
            )

        total = query.count()
        items = (
            query.order_by(
                Invoice.invoice_date.desc(),
                Invoice.created_at.desc(),
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

        return items, total
