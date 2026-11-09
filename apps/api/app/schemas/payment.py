import datetime
import uuid
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.payment import PaymentMethod


class PaymentBase(BaseModel):
    amount: Decimal = Field(..., gt=0)
    payment_method: PaymentMethod
    reference: str | None = None


class PaymentCreate(PaymentBase):
    pass


class PaymentResponse(PaymentBase):
    id: uuid.UUID
    invoice_id: uuid.UUID
    created_by: uuid.UUID
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class PaymentReceiptData(BaseModel):
    receipt_number: str
    payment_id: uuid.UUID
    invoice_id: uuid.UUID
    invoice_number: str
    patient_id: uuid.UUID
    patient_name: str | None = None
    patient_code: str | None = None
    amount_paid: Decimal
    payment_date: datetime.datetime
    payment_method: PaymentMethod
    reference: str | None = None
    invoice_total: Decimal
    invoice_paid_amount: Decimal
    invoice_balance: Decimal
    invoice_status: str
    received_by: uuid.UUID
    hospital_name: str = "ArogyaVajra Healthcare Management"

    model_config = ConfigDict(from_attributes=True)


class PaymentReceiptResponse(BaseModel):
    data: PaymentReceiptData
    message: str = "Payment receipt retrieved successfully."
