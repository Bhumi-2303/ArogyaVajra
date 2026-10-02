"""Create patient_profiles and audit_logs tables.

Revision ID: 002_patient_profiles
Revises: 001_create_users_table
Create Date: 2026-10-02 22:15:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic (must be <= 32 chars).
revision: str = "002_patient_profiles"
down_revision: str | None = "001_create_users_table"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. Create patient_profiles table
    op.create_table(
        "patient_profiles",
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
            "patient_code",
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
            "date_of_birth",
            sa.Date(),
            nullable=True,
        ),
        sa.Column(
            "gender",
            sa.String(length=20),
            nullable=True,
        ),
        sa.Column(
            "phone",
            sa.String(length=20),
            nullable=True,
        ),
        sa.Column(
            "address",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "emergency_contact_name",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "emergency_contact_phone",
            sa.String(length=20),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name=op.f("fk_patient_profiles_user_id_users"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_patient_profiles")),
        sa.UniqueConstraint("user_id", name=op.f("uq_patient_profiles_user_id")),
        sa.UniqueConstraint(
            "patient_code", name=op.f("uq_patient_profiles_patient_code")
        ),
    )

    op.create_index(
        op.f("ix_patient_profiles_patient_code"),
        "patient_profiles",
        ["patient_code"],
        unique=True,
    )
    op.create_index(
        op.f("ix_patient_profiles_phone"),
        "patient_profiles",
        ["phone"],
        unique=False,
    )
    op.create_index(
        op.f("ix_patient_profiles_user_id"),
        "patient_profiles",
        ["user_id"],
        unique=True,
    )

    # 2. Create audit_logs table
    op.create_table(
        "audit_logs",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            nullable=True,
        ),
        sa.Column(
            "action",
            sa.String(length=100),
            nullable=False,
        ),
        sa.Column(
            "entity_type",
            sa.String(length=100),
            nullable=False,
        ),
        sa.Column(
            "entity_id",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "old_values",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
        sa.Column(
            "new_values",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
        sa.Column(
            "ip_address",
            sa.String(length=45),
            nullable=True,
        ),
        sa.Column(
            "user_agent",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name=op.f("fk_audit_logs_user_id_users"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_audit_logs")),
    )

    op.create_index(
        op.f("ix_audit_logs_user_id"),
        "audit_logs",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_audit_logs_entity"),
        "audit_logs",
        ["entity_type", "entity_id"],
        unique=False,
    )


def downgrade() -> None:
    # 1. Drop audit_logs
    op.drop_index(op.f("ix_audit_logs_entity"), table_name="audit_logs")
    op.drop_index(op.f("ix_audit_logs_user_id"), table_name="audit_logs")
    op.drop_table("audit_logs")

    # 2. Drop patient_profiles
    op.drop_index(op.f("ix_patient_profiles_user_id"), table_name="patient_profiles")
    op.drop_index(op.f("ix_patient_profiles_phone"), table_name="patient_profiles")
    op.drop_index(
        op.f("ix_patient_profiles_patient_code"), table_name="patient_profiles"
    )
    op.drop_table("patient_profiles")
