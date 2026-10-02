"""Create doctor_profiles table.

Revision ID: 003_doctor_profiles
Revises: 002_patient_profiles
Create Date: 2026-10-02 23:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic (must be <= 32 chars).
revision: str = "003_doctor_profiles"
down_revision: str | None = "002_patient_profiles"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "doctor_profiles",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
        ),
        sa.Column(
            "doctor_code",
            sa.String(length=32),
            nullable=False,
        ),
        sa.Column(
            "first_name",
            sa.String(length=100),
            nullable=False,
        ),
        sa.Column(
            "last_name",
            sa.String(length=100),
            nullable=False,
        ),
        sa.Column(
            "specialization",
            sa.String(length=100),
            nullable=False,
        ),
        sa.Column(
            "qualification",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "license_number",
            sa.String(length=50),
            nullable=True,
        ),
        sa.Column(
            "phone",
            sa.String(length=20),
            nullable=True,
        ),
        sa.Column(
            "consultation_fee",
            sa.Numeric(precision=10, scale=2),
            server_default=sa.text("0.00"),
            nullable=False,
        ),
        sa.Column(
            "bio",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name=op.f("fk_doctor_profiles_user_id_users"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_doctor_profiles")),
        sa.UniqueConstraint("doctor_code", name=op.f("uq_doctor_profiles_doctor_code")),
        sa.UniqueConstraint(
            "license_number", name=op.f("uq_doctor_profiles_license_number")
        ),
        sa.UniqueConstraint("user_id", name=op.f("uq_doctor_profiles_user_id")),
    )
    op.create_index(
        op.f("ix_doctor_profiles_doctor_code"),
        "doctor_profiles",
        ["doctor_code"],
        unique=False,
    )
    op.create_index(
        op.f("ix_doctor_profiles_specialization"),
        "doctor_profiles",
        ["specialization"],
        unique=False,
    )
    op.create_index(
        op.f("ix_doctor_profiles_user_id"),
        "doctor_profiles",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_doctor_profiles_user_id"), table_name="doctor_profiles")
    op.drop_index(
        op.f("ix_doctor_profiles_specialization"), table_name="doctor_profiles"
    )
    op.drop_index(op.f("ix_doctor_profiles_doctor_code"), table_name="doctor_profiles")
    op.drop_table("doctor_profiles")
