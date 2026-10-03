import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.invoice import (
    InvoiceCreate,
    InvoiceUpdate,
    InvoiceListResponse,
    InvoiceDetailResponse,
)
from app.schemas.payment import PaymentCreate, PaymentResponse
from app.services.invoice import InvoiceService
from app.services.payment import PaymentService

router = APIRouter(prefix="/invoices", tags=["Invoices"])


@router.post(
    "",
    response_model=InvoiceDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create an invoice",
)
def create_invoice(
    data: InvoiceCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    invoice = InvoiceService.create_invoice(
        db=db,
        data=data,
        current_user=current_user,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.commit()

    return InvoiceDetailResponse(data=invoice)


@router.get(
    "",
    response_model=InvoiceListResponse,
    summary="List invoices",
)
def list_invoices(
    patient_id: Optional[uuid.UUID] = Query(None, description="Filter by patient ID"),
    status: Optional[str] = Query(None, description="Filter by payment status"),
    invoice_number: Optional[str] = Query(None, description="Filter by invoice number"),
    date: Optional[str] = Query(None, description="Filter by invoice date"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items, total = InvoiceService.list_invoices(
        db=db,
        current_user=current_user,
        patient_id=patient_id,
        status=status,
        invoice_number=invoice_number,
        date=date,
        page=page,
        page_size=page_size,
    )

    total_pages = (total + page_size - 1) // page_size

    return InvoiceListResponse(
        data=items,
        pagination={
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages,
        },
    )


@router.get(
    "/{invoice_id}",
    response_model=InvoiceDetailResponse,
    summary="Get invoice details",
)
def get_invoice(
    invoice_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    invoice = InvoiceService.get_invoice(db, invoice_id, current_user)
    return InvoiceDetailResponse(data=invoice)


@router.put(
    "/{invoice_id}",
    response_model=InvoiceDetailResponse,
    summary="Update an invoice",
)
def update_invoice(
    invoice_id: uuid.UUID,
    data: InvoiceUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    invoice = InvoiceService.update_invoice(
        db=db,
        invoice_id=invoice_id,
        data=data,
        current_user=current_user,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.commit()

    return InvoiceDetailResponse(data=invoice)


@router.post(
    "/{invoice_id}/payments",
    response_model=PaymentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record a payment for an invoice",
)
def record_payment(
    invoice_id: uuid.UUID,
    data: PaymentCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    payment = PaymentService.record_payment(
        db=db,
        invoice_id=invoice_id,
        data=data,
        current_user=current_user,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.commit()

    return PaymentResponse.model_validate(payment)


@router.post("/{invoice_id}/issue", response_model=InvoiceDetailResponse, summary="Issue an invoice")
def issue_invoice(
    invoice_id: uuid.UUID,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    from app.schemas.invoice import InvoiceUpdate
    from app.models.invoice import InvoiceStatus
    
    updated = InvoiceService.update_invoice(
        db=db,
        invoice_id=invoice_id,
        data=InvoiceUpdate(status=InvoiceStatus.ISSUED),
        current_user=current_user,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.commit()
    return InvoiceDetailResponse(data=updated, message="Invoice issued.")

@router.post("/{invoice_id}/cancel", response_model=InvoiceDetailResponse, summary="Cancel an invoice")
def cancel_invoice(
    invoice_id: uuid.UUID,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    from app.schemas.invoice import InvoiceUpdate
    from app.models.invoice import InvoiceStatus
    
    updated = InvoiceService.update_invoice(
        db=db,
        invoice_id=invoice_id,
        data=InvoiceUpdate(status=InvoiceStatus.CANCELLED),
        current_user=current_user,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.commit()
    return InvoiceDetailResponse(data=updated, message="Invoice cancelled.")
