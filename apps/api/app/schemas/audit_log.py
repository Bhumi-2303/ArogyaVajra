from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    id: UUID
    user_id: UUID | None = None
    action: str
    entity_type: str
    entity_id: str | None = None
    old_values: dict[str, Any] | None = None
    new_values: dict[str, Any] | None = None
    ip_address: str | None = None
    user_agent: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AuditLogListResponse(BaseModel):
    data: list[AuditLogResponse]
    pagination: dict[str, Any]
    message: str = "Audit logs retrieved successfully"
