"""Unit tests for SQLAlchemy declarative base, naming conventions, and model mixins."""

import uuid
from decimal import Decimal

from sqlalchemy import DateTime, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import (
    POSTGRES_NAMING_CONVENTION,
    Base,
    TimestampMixin,
    UUIDPrimaryKeyMixin,
    money_column,
)


class DummyEntity(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Temporary test model verifying mixin composition without domain coupling."""

    __tablename__ = "test_dummy_entities"

    name: Mapped[str] = mapped_column(nullable=False)
    fee: Mapped[Decimal] = money_column(default=Decimal("150.00"))


def test_postgres_naming_convention():
    """Verify metadata is configured with PostgreSQL constraint naming conventions."""
    convention = Base.metadata.naming_convention
    assert convention["ix"] == POSTGRES_NAMING_CONVENTION["ix"]
    assert convention["uq"] == POSTGRES_NAMING_CONVENTION["uq"]
    assert convention["ck"] == POSTGRES_NAMING_CONVENTION["ck"]
    assert convention["fk"] == POSTGRES_NAMING_CONVENTION["fk"]
    assert convention["pk"] == POSTGRES_NAMING_CONVENTION["pk"]


def test_uuid_primary_key_mixin():
    """Verify UUIDPrimaryKeyMixin enforces UUID type and primary key."""
    table = DummyEntity.__table__
    id_col = table.c.id

    assert id_col.primary_key is True
    assert isinstance(id_col.type, UUID)
    assert id_col.type.as_uuid is True


def test_timestamp_mixin():
    """Verify TimestampMixin configures timezone-aware timestamps with server defaults."""
    table = DummyEntity.__table__
    created_at_col = table.c.created_at
    updated_at_col = table.c.updated_at

    assert isinstance(created_at_col.type, DateTime)
    assert created_at_col.type.timezone is True
    assert created_at_col.nullable is False
    assert created_at_col.server_default is not None

    assert isinstance(updated_at_col.type, DateTime)
    assert updated_at_col.type.timezone is True
    assert updated_at_col.nullable is False
    assert updated_at_col.server_default is not None


def test_money_column_exact_decimal():
    """Verify money_column configures exact NUMERIC(10, 2) decimal representation."""
    table = DummyEntity.__table__
    fee_col = table.c.fee

    assert isinstance(fee_col.type, Numeric)
    assert fee_col.type.precision == 10
    assert fee_col.type.scale == 2
    assert fee_col.type.asdecimal is True


def test_dummy_entity_instantiation():
    """Verify entity can be instantiated with default mixin values."""
    entity = DummyEntity(name="Clinic Alpha", fee=Decimal("150.00"))
    assert isinstance(entity.id, uuid.UUID)
    assert entity.name == "Clinic Alpha"
    assert entity.fee == Decimal("150.00")
