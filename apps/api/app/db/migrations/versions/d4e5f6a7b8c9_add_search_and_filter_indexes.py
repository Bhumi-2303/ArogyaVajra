"""Add search and filter indexes to medical_records, prescriptions, and invoices.

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-11-09 14:00:00.000000

"""

from collections.abc import Sequence

from alembic import op

revision: str = "d4e5f6a7b8c9"
down_revision: str | None = "c3d4e5f6a7b8"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. Medical records date filtering index
    op.create_index(
        "ix_medical_records_record_date",
        "medical_records",
        ["record_date"],
    )

    # 2. Prescriptions date and status filtering indexes
    op.create_index(
        "ix_prescriptions_prescription_date",
        "prescriptions",
        ["prescription_date"],
    )
    op.create_index(
        "ix_prescriptions_status",
        "prescriptions",
        ["status"],
    )

    # 3. Invoices date and status filtering indexes
    op.create_index(
        "ix_invoices_invoice_date",
        "invoices",
        ["invoice_date"],
    )
    op.create_index(
        "ix_invoices_status",
        "invoices",
        ["status"],
    )


def downgrade() -> None:
    op.drop_index("ix_invoices_status", table_name="invoices")
    op.drop_index("ix_invoices_invoice_date", table_name="invoices")
    op.drop_index("ix_prescriptions_status", table_name="prescriptions")
    op.drop_index("ix_prescriptions_prescription_date", table_name="prescriptions")
    op.drop_index("ix_medical_records_record_date", table_name="medical_records")
