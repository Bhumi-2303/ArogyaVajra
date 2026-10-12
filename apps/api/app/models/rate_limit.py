"""Rate limiting bucket model for distributed/multi-worker rate limiting."""

from datetime import datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class RateLimitBucket(Base):
    """Tracks atomic rate limit request counts across multiple workers and instances."""

    __tablename__ = "rate_limit_buckets"

    key: Mapped[str] = mapped_column(
        String(255),
        primary_key=True,
        index=True,
    )
    count: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )
    window_expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )
