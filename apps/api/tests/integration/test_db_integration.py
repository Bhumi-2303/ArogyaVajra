import pytest
from sqlalchemy import text

try:
    from alembic import command
    from alembic.config import Config

    HAS_ALEMBIC = True
except ImportError:
    HAS_ALEMBIC = False

from app.db.session import (
    check_db_connection,
    get_db_health_details,
    get_engine,
)
from app.db.transaction import transactional_session

# Mark all tests in this file as integration tests
pytestmark = pytest.mark.integration


@pytest.fixture(scope="module")
def require_db():
    """Ensure live database and required tools are available before running integration tests."""
    if not HAS_ALEMBIC:
        pytest.skip("Alembic is not installed in this environment.")
    if not check_db_connection():
        pytest.skip("PostgreSQL database is not reachable from this test environment.")


def test_live_postgres_connectivity(require_db):
    """Verify live connectivity and latency probe against PostgreSQL container."""
    health = get_db_health_details()
    assert health["connected"] is True
    assert health["latency_ms"] >= 0.0
    assert "PostgreSQL" in health["server_version"]


def test_live_postgres_version_16_plus(require_db):
    """Verify PostgreSQL version is 16.0 or higher per project requirements."""
    engine = get_engine()
    with engine.connect() as conn:
        version_num = conn.execute(
            text("SELECT current_setting('server_version_num')::integer")
        ).scalar()
        assert version_num is not None
        assert version_num >= 160000, f"Expected PostgreSQL >= 16, got {version_num}"


def test_live_postgres_native_uuid(require_db):
    """Verify PostgreSQL natively evaluates gen_random_uuid()."""
    engine = get_engine()
    with engine.connect() as conn:
        uuid_val = conn.execute(text("SELECT gen_random_uuid()")).scalar()
        assert uuid_val is not None
        assert len(str(uuid_val)) == 36


def test_live_transactional_session(require_db):
    """Verify transactional_session creates, queries, and rolls back cleanly against PostgreSQL."""
    with transactional_session() as session:
        result = session.execute(text("SELECT 42 AS value")).mappings().one()
        assert result["value"] == 42


def test_live_alembic_heads_and_current(require_db):
    """Verify Alembic configuration and commands against the live PostgreSQL database."""
    alembic_cfg = Config("alembic.ini")
    # Verify heads and current execute without throwing
    command.heads(alembic_cfg)
    command.current(alembic_cfg)
