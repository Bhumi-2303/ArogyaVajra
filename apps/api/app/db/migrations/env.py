"""Alembic migration environment configuration.

Configures offline and online migration execution, binding to the application's
declarative base metadata and PostgreSQL engine with schema comparison conventions.
"""

import os
import sys
from logging.config import fileConfig

from alembic import context

# Ensure the backend app package is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))

import app.models  # noqa: F401
from app.core.config import settings
from app.db.base import Base
from app.db.session import get_engine

# Alembic Config object
config = context.config

# Interpret the config file for Python logging if present
if config.config_file_name is not None and os.path.exists(config.config_file_name):
    fileConfig(config.config_file_name)

# Model MetaData for 'autogenerate' support
target_metadata = Base.metadata

# Deterministic Database URL Resolution:
# 1. Command-line override via '-x db_url=...'
# 2. Explicit programmatic override on Config object (e.g. disposable test database)
# 3. Application runtime configuration via settings.DATABASE_URL
x_args = context.get_x_argument(as_dictionary=True) if hasattr(context, "get_x_argument") else {}
cmd_x_url = x_args.get("db_url")
if cmd_x_url:
    config.set_main_option("sqlalchemy.url", cmd_x_url)

current_url = config.get_main_option("sqlalchemy.url")
if not current_url or not current_url.strip():
    config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    Generates SQL scripts directly against the configured URL without an active Engine.
    """
    url = config.get_main_option("sqlalchemy.url") or settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    Executes transactional DDL directly against the live PostgreSQL database engine.
    """
    target_url = config.get_main_option("sqlalchemy.url") or settings.DATABASE_URL
    if target_url != settings.DATABASE_URL:
        # Explicit disposable/test database URL supplied; create isolated engine
        from sqlalchemy import create_engine

        connectable = create_engine(target_url)
    else:
        # Standard operation: reuse application engine singleton
        connectable = get_engine()

    with connectable.connect() as connection:


        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
