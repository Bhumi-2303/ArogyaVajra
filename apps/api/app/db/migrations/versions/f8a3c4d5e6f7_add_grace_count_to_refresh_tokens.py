"""Add grace_count column to refresh_tokens table.

Revision ID: f8a3c4d5e6f7
Revises: 7ea81b2c90df
Create Date: 2026-10-12 18:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "f8a3c4d5e6f7"
down_revision: str | None = "7ea81b2c90df"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "refresh_tokens",
        sa.Column(
            "grace_count",
            sa.Integer(),
            server_default=sa.text("0"),
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_column("refresh_tokens", "grace_count")
