"""Unit tests for database session lifecycle, transactions, and health checks."""

from unittest.mock import MagicMock, patch

import pytest
from sqlalchemy.orm import Session

from app.db.session import (
    check_db_connection,
    close_db_engine,
    get_db,
    get_db_health_details,
    get_engine,
    get_sessionmaker,
)
from app.db.transaction import transactional_session


def test_get_engine_singleton():
    """Verify that get_engine returns a consistent singleton instance."""
    close_db_engine()
    with patch("app.db.session.create_engine") as mock_create_engine:
        mock_engine = MagicMock()
        mock_create_engine.return_value = mock_engine

        engine_1 = get_engine()
        engine_2 = get_engine()
        assert engine_1 is engine_2
        assert mock_create_engine.call_count == 1
    close_db_engine()


def test_get_sessionmaker_configuration():
    """Verify that sessionmaker creates sessions with expire_on_commit disabled."""
    with patch("app.db.session.get_engine"):
        factory = get_sessionmaker()
        assert factory is not None
        session: Session = factory()
        try:
            assert session.expire_on_commit is False
        finally:
            session.close()


def test_transactional_session_commits_on_success():
    """Verify transactional_session commits upon clean block execution."""
    mock_session = MagicMock(spec=Session)
    mock_factory = MagicMock(return_value=mock_session)

    with patch("app.db.transaction.get_sessionmaker", return_value=mock_factory):
        with transactional_session() as session:
            assert session is mock_session

        mock_session.commit.assert_called_once()
        mock_session.rollback.assert_not_called()
        mock_session.close.assert_called_once()


def test_transactional_session_rolls_back_on_exception():
    """Verify transactional_session rolls back and closes on unhandled exception."""
    mock_session = MagicMock(spec=Session)
    mock_factory = MagicMock(return_value=mock_session)

    with (
        patch("app.db.transaction.get_sessionmaker", return_value=mock_factory),
        pytest.raises(ValueError, match="Database mutation failure"),
        transactional_session(),
    ):
        raise ValueError("Database mutation failure")

    mock_session.commit.assert_not_called()
    mock_session.rollback.assert_called_once()
    mock_session.close.assert_called_once()


def test_get_db_dependency_lifecycle():
    """Verify get_db yields session and guarantees closure."""
    mock_session = MagicMock(spec=Session)
    mock_factory = MagicMock(return_value=mock_session)

    with patch("app.db.session.get_sessionmaker", return_value=mock_factory):
        gen = get_db()
        db = next(gen)
        assert db is mock_session
        with pytest.raises(StopIteration):
            next(gen)
        mock_session.close.assert_called_once()


def test_get_db_dependency_rollback_on_error():
    """Verify get_db rolls back session if an unhandled error occurs during request."""
    mock_session = MagicMock(spec=Session)
    mock_factory = MagicMock(return_value=mock_session)

    with patch("app.db.session.get_sessionmaker", return_value=mock_factory):
        gen = get_db()
        next(gen)
        with pytest.raises(RuntimeError, match="Handler crashed"):
            gen.throw(RuntimeError("Handler crashed"))

        mock_session.rollback.assert_called_once()
        mock_session.close.assert_called_once()


def test_check_db_connection_probe():
    """Verify check_db_connection probe returns boolean status."""
    with patch("app.db.session.get_engine") as mock_get_engine:
        mock_conn = MagicMock()
        mock_get_engine.return_value.connect.return_value.__enter__.return_value = (
            mock_conn
        )

        assert check_db_connection() is True

        mock_get_engine.return_value.connect.side_effect = OSError("Connection refused")
        assert check_db_connection() is False


def test_get_db_health_details_success():
    """Verify get_db_health_details captures latency and server version."""
    with patch("app.db.session.get_engine") as mock_get_engine:
        mock_conn = MagicMock()
        mock_conn.execute.return_value.scalar.return_value = "PostgreSQL 16.2 on x86_64"
        mock_get_engine.return_value.connect.return_value.__enter__.return_value = (
            mock_conn
        )

        details = get_db_health_details()
        assert details["connected"] is True
        assert "latency_ms" in details
        assert "PostgreSQL 16.2" in details["server_version"]


def test_get_db_health_details_failure():
    """Verify get_db_health_details handles disconnections gracefully."""
    with patch("app.db.session.get_engine") as mock_get_engine:
        mock_get_engine.return_value.connect.side_effect = OSError("Connection refused")

        details = get_db_health_details()
        assert details["connected"] is False
        assert "latency_ms" in details
        assert "Connection refused" in details["error"]


def test_close_db_engine():
    """Verify close_db_engine properly disposes of connection pool."""
    close_db_engine()
    with patch("app.db.session.create_engine") as mock_create_engine:
        mock_engine = MagicMock()
        mock_create_engine.return_value = mock_engine

        engine = get_engine()
        assert engine is mock_engine
        close_db_engine()
        mock_engine.dispose.assert_called_once()
