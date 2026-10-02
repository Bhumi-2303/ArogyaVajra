"""Audit trail service recording immutable events for entity mutations."""

import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def record_audit_event(
    db: Session,
    action: str,
    entity_type: str,
    entity_id: str | None,
    user_id: uuid.UUID | None = None,
    old_values: dict[str, Any] | None = None,
    new_values: dict[str, Any] | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> AuditLog:
    """Record an audit trail event in the database."""
    log_entry = AuditLog(
        id=uuid.uuid4(),
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        old_values=old_values,
        new_values=new_values,
        ip_address=ip_address,
        user_agent=user_agent,
        created_at=datetime.now(UTC),
    )
    db.add(log_entry)
    db.flush()
    return log_entry
