"""Database transaction management and atomic execution utilities."""

from collections.abc import Generator
from contextlib import contextmanager
from typing import TypeVar

from sqlalchemy.orm import Session

from app.db.session import get_sessionmaker

T = TypeVar("T")


@contextmanager
def transactional_session() -> Generator[Session, None, None]:
    """Context manager providing an atomic database transaction.

    Yields an active SQLAlchemy Session.
    - Automatically commits if the block executes without error.
    - Automatically rolls back if any exception is raised.
    - Always closes the session upon exit.
    """
    session: Session = get_sessionmaker()()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
