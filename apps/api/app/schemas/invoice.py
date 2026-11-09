import datetime
import uuid
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.models.invoice import InvoiceStatus
from app.schemas.payment import PaymentResponse


class InvoiceItemBase(BaseModel):
    description: str
    quantity: Decimal
    unit_price: Decimal


class InvoiceItemCreate(InvoiceItemBase):
    pass


class InvoiceItemResponse(InvoiceItemBase):
    id: uuid.UUID
    amount: Decimal

    model_config = ConfigDict(from_attributes=True)


class InvoiceBase(BaseModel):
    patient_id: uuid.UUID
    appointment_id: uuid.UUID | None = None
    invoice_date: datetime.date
    discount: Decimal = Decimal("0.00")
    tax: Decimal = Decimal("0.00")
    status: InvoiceStatus = InvoiceStatus.DRAFT


class InvoiceCreate(InvoiceBase):
    items: list[InvoiceItemCreate]


class InvoiceUpdate(BaseModel):
    status: InvoiceStatus | None = None


class InvoiceResponse(InvoiceBase):
    id: uuid.UUID
    invoice_number: str
    subtotal: Decimal
    total: Decimal
    paid_amount: Decimal
    balance: Decimal
    created_by: uuid.UUID
    created_at: datetime.datetime
    updated_at: datetime.datetime
    items: list[InvoiceItemResponse]
    payments: list[PaymentResponse] = []

    model_config = ConfigDict(from_attributes=True)


class InvoiceListResponse(BaseModel):
    data: list[InvoiceResponse]
    message: str = "Invoices retrieved successfully."
    pagination: dict


class InvoiceDetailResponse(BaseModel):
    data: InvoiceResponse
    message: str = "Invoice retrieved successfully."
