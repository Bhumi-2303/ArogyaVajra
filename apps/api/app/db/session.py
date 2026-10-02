"""Database connection, session lifecycle, and connectivity probes."""

import time
from collections.abc import Generator
from typing import Any

from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.db.base import Base

__all__ = [
    "Base",
    "check_db_connection",
    "close_db_engine",
    "get_db",
    "get_db_health_details",
    "get_engine",
    "get_sessionmaker",
]

_engine = None
_SessionLocal = None


def get_engine():
    """Get or create the singleton SQLAlchemy engine with optimized pooling."""
    global _engine
    if _engine is None:
        _engine = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=3600,
            pool_size=10,
            max_overflow=20,
            pool_timeout=30,
            echo=settings.APP_DEBUG,
        )
    return _engine


def get_sessionmaker():
    """Get or create the sessionmaker factory with expire_on_commit disabled."""
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(
            bind=get_engine(),
            autocommit=False,
            autoflush=False,
            expire_on_commit=False,
        )
    return _SessionLocal


def close_db_engine() -> None:
    """Dispose of the connection pool upon application shutdown."""
    global _engine, _SessionLocal
    if _engine is not None:
        _engine.dispose()
        _engine = None
        _SessionLocal = None


def __getattr__(name: str):
    """Provide module-level attribute access to engine and SessionLocal."""
    if name == "engine":
        return get_engine()
    if name == "SessionLocal":
        return get_sessionmaker()
    raise AttributeError(f"module '{__name__}' has no attribute '{name}'")


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency yielding an isolated database session per request.

    Automatically closes the session after request execution.
    """
    session_factory = get_sessionmaker()
    db = session_factory()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def check_db_connection() -> bool:
    """Verify that PostgreSQL is reachable and responsive."""
    try:
        with get_engine().connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except (SQLAlchemyError, OSError, Exception):  # noqa: BLE001
        return False


def get_db_health_details() -> dict[str, Any]:
    """Return detailed health metrics including ping latency and server version."""
    start_time = time.perf_counter()
    try:
        with get_engine().connect() as conn:
            result = conn.execute(text("SELECT version()")).scalar()
            latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
            return {
                "connected": True,
                "latency_ms": latency_ms,
                "server_version": str(result) if result else "unknown",
            }
    except Exception as exc:  # noqa: BLE001
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return {
            "connected": False,
            "latency_ms": latency_ms,
            "error": str(exc),
        }
