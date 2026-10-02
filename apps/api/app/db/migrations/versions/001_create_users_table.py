"""Create users table and user_role enum.

Revision ID: 001_create_users_table
Revises: None
Create Date: 2026-10-02 21:26:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001_create_users_table"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

# Authoritative enum definition with create_type=False so create_table does not re-issue CREATE TYPE
user_role_enum = postgresql.ENUM(
    "PATIENT",
    "DOCTOR",
    "RECEPTIONIST",
    "BILLING_STAFF",
    "ADMIN",
    name="user_role",
    create_type=False,
)


def upgrade() -> None:
    # 1. Create user_role ENUM safely if it does not already exist
    op.execute(
        sa.text(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
                    CREATE TYPE user_role AS ENUM ('PATIENT', 'DOCTOR', 'RECEPTIONIST', 'BILLING_STAFF', 'ADMIN');
                END IF;
            END$$;
            """
        )
    )

    # 2. Create users table
    op.create_table(
        "users",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("role", user_role_enum, nullable=False),
        sa.Column(
            "is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False
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
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_users")),
        sa.UniqueConstraint("email", name=op.f("uq_users_email")),
    )

    # 3. Create indexes
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_role"), "users", ["role"], unique=False)


def downgrade() -> None:
    # 1. Drop indexes
    op.drop_index(op.f("ix_users_role"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")

    # 2. Drop table
    op.drop_table("users")

    # 3. Drop user_role ENUM
    op.execute(
        sa.text(
            """
            DROP TYPE IF EXISTS user_role;
            """
        )
    )
