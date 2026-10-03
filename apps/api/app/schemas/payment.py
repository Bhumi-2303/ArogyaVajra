import datetime
import uuid
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.payment import PaymentMethod


class PaymentBase(BaseModel):
    amount: Decimal = Field(..., gt=0)
    payment_method: PaymentMethod
    reference: Optional[str] = None


class PaymentCreate(PaymentBase):
    pass


class PaymentResponse(PaymentBase):
    id: uuid.UUID
    invoice_id: uuid.UUID
    created_by: uuid.UUID
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
