"""SQLAlchemy declarative base, naming conventions, and reusable model mixins."""

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, MetaData, Numeric, func, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# Authoritative naming convention for PostgreSQL constraints and indexes.
# Guarantees reproducible, collision-free constraint names for Alembic migrations.
POSTGRES_NAMING_CONVENTION: dict[str, str] = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

metadata = MetaData(naming_convention=POSTGRES_NAMING_CONVENTION)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy domain models in Arogyavajra."""

    metadata = metadata


class UUIDPrimaryKeyMixin:
    """Universal primary key mixin using UUIDv4 for PostgreSQL."""

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
        sort_order=-100,
    )

    def __init__(self, *args, **kwargs):
        if "id" not in kwargs:
            kwargs["id"] = uuid.uuid4()
        super().__init__(*args, **kwargs)


class TimestampMixin:
    """Timezone-aware audit timestamp mixin for entity lifecycle tracking."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        sort_order=100,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        sort_order=101,
    )


# Standard type aliases for exact financial and clinical calculations
def money_column(
    precision: int = 10,
    scale: int = 2,
    default: Decimal | float = Decimal("0.00"),
    nullable: bool = False,
):
    """Factory for exact monetary NUMERIC columns."""
    return mapped_column(
        Numeric(precision=precision, scale=scale, asdecimal=True),
        default=Decimal(str(default)),
        nullable=nullable,
    )
