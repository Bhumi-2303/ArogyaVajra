from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, verify_admin_resource_access
from app.models.user import User
from app.schemas.audit_log import AuditLogListResponse
from app.services.audit import list_audit_events

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])


@router.get(
    "",
    response_model=AuditLogListResponse,
    summary="List audit logs",
    dependencies=[Depends(verify_admin_resource_access)],
)
def get_audit_logs(
    user_id: Optional[UUID] = Query(None, description="Filter by acting user ID"),
    entity_type: Optional[str] = Query(None, description="Filter by entity type"),
    entity_id: Optional[str] = Query(None, description="Filter by entity ID"),
    action: Optional[str] = Query(None, description="Filter by action"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    logs, total = list_audit_events(
        db=db,
        user_id=user_id,
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        page=page,
        page_size=page_size,
    )

    total_pages = (total + page_size - 1) // page_size

    return AuditLogListResponse(
        data=logs,
        pagination={
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages,
        },
    )
