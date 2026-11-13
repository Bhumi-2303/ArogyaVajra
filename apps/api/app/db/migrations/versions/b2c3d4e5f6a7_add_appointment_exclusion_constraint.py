"""Add btree_gist extension and appointment exclusion constraint.

Revision ID: b2c3d4e5f6a7
Revises: f8a3c4d5e6f7
Create Date: 2026-10-20 10:00:00.000000

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b2c3d4e5f6a7"
down_revision: str | None = "f8a3c4d5e6f7"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        # Enable btree_gist extension for scalar types equality inside GiST
        op.execute("CREATE EXTENSION IF NOT EXISTS btree_gist;")

        # Exclusion constraint preventing overlapping time ranges for the same
        # doctor and date
        # while status IN ('SCHEDULED', 'CONFIRMED')
        op.execute(
            """
            ALTER TABLE appointments
            ADD CONSTRAINT exclude_overlapping_appointments
            EXCLUDE USING gist (
                doctor_id WITH =,
                appointment_date WITH =,
                tsrange((appointment_date + start_time), \
(appointment_date + end_time), '[)') WITH &&
            )
            WHERE (status IN ('SCHEDULED', 'CONFIRMED'));
            """
        )


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute(
            "ALTER TABLE appointments DROP CONSTRAINT IF EXISTS "
            "exclude_overlapping_appointments;"
        )
