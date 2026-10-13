"""Add invoice_number_seq

Revision ID: 6db372e959da
Revises: 6dacbefae31a
Create Date: 2026-10-03 22:26:23.992132

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6db372e959da'
down_revision: Union[str, None] = '6dacbefae31a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    if op.get_bind().dialect.name == "postgresql":
        op.execute("CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;")


def downgrade() -> None:
    if op.get_bind().dialect.name == "postgresql":
        op.execute("DROP SEQUENCE IF NOT EXISTS invoice_number_seq;")
