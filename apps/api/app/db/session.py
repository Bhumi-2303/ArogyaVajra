"""Database connection and session factory."""

from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.base import Base

__all__ = [
    "Base",
    "check_db_connection",
    "get_db",
    "get_engine",
    "get_sessionmaker",
]
_SessionLocal = None


def get_engine():
    """Get or create the SQLAlchemy engine."""
    global _engine
    if _engine is None:
        _engine = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=3600,
            echo=settings.APP_DEBUG,
        )
    return _engine


def get_sessionmaker():
    """Get or create the sessionmaker factory."""
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=get_engine(),
        )
    return _SessionLocal


def __getattr__(name: str):
    """Provide module-level access to engine and SessionLocal."""
    if name == "engine":
        return get_engine()
    if name == "SessionLocal":
        return get_sessionmaker()
    raise AttributeError(f"module '{__name__}' has no attribute '{name}'")


def get_db():
    """Dependency for providing database sessions per request."""
    session_factory = get_sessionmaker()
    db = session_factory()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> bool:
    """Verify that the database is reachable."""
    try:
        from sqlalchemy import text

        with get_engine().connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except (SQLAlchemyError, OSError, Exception):  # noqa: BLE001
        return False
