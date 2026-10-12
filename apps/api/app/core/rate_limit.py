"""Distributed multi-worker rate limiting backed by PostgreSQL atomic upserts.

Algorithm: Fixed-Window Counter.
Each request increments an atomic database counter in `rate_limit_buckets` keyed
by `rl:{prefix}:{identifier}:{bucket_timestamp}` with an expiry boundary.
"""

import ipaddress
import logging
import os
from datetime import UTC, datetime

from fastapi import HTTPException, Request, status
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings

logger = logging.getLogger(__name__)


def is_trusted_proxy(ip_str: str | None) -> bool:
    """Check if the direct connection host is in the configured trusted proxy list."""
    if not ip_str:
        return False
    trusted_list = settings.trusted_proxies_list
    if not trusted_list:
        return False

    clean_host = ip_str.strip()
    try:
        ip = ipaddress.ip_address(clean_host)
    except ValueError:
        # Non-IP hostname or test fixture identifier
        return clean_host in trusted_list

    for pattern in trusted_list:
        try:
            if "/" in pattern:
                if ip in ipaddress.ip_network(pattern, strict=False):
                    return True
            else:
                if ip == ipaddress.ip_address(pattern):
                    return True
        except ValueError:
            if clean_host == pattern:
                return True

    return False



def check_rate_limit(
    db: Session,
    key_prefix: str,
    identifier: str,
    max_requests: int,
    window_seconds: int,
    bypass_in_test: bool = True,
    fail_closed: bool = False,
) -> None:
    """Atomic fixed-window rate limit check shared across workers and container replicas.

    Uses PostgreSQL atomic upsert to increment request count within a fixed-window bucket.
    Guarantees that production environments never bypass rate limiting even if test
    environment variables are present.

    Args:
        db: Active database session.
        key_prefix: Logical route or action name (e.g., 'login', 'register').
        identifier: Client IP or account identifier.
        max_requests: Maximum requests permitted within window_seconds.
        window_seconds: Window duration in seconds.
        bypass_in_test: Allow automated testing suites to bypass when in test environment.
        fail_closed: If True, reject requests when rate limiter storage is unreachable.
    """
    is_prod = settings.APP_ENV.lower() in ("production", "prod", "staging")
    if not is_prod and bypass_in_test and (
        settings.APP_ENV.lower() in ("test", "testing")
        or "PYTEST_CURRENT_TEST" in os.environ
    ):
        return

    now = datetime.now(UTC)
    window_bucket = int(now.timestamp()) // window_seconds
    bucket_key = f"rl:{key_prefix}:{identifier}:{window_bucket}"
    window_expires = datetime.fromtimestamp(
        (window_bucket + 1) * window_seconds,
        tz=UTC,
    )

    try:
        stmt = text(
            """
            INSERT INTO rate_limit_buckets (key, count, window_expires_at)
            VALUES (:key, 1, :expires_at)
            ON CONFLICT (key) DO UPDATE
            SET count = rate_limit_buckets.count + 1
            RETURNING count;
            """
        )
        result = db.execute(stmt, {"key": bucket_key, "expires_at": window_expires})
        db.commit()
        row = result.fetchone()

        if row and row[0] > max_requests:
            retry_after = max(1, int((window_expires - now).total_seconds()))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded for {key_prefix}. Try again in {retry_after}s.",
                headers={"Retry-After": str(retry_after)},
            )
    except HTTPException:
        raise
    except (SQLAlchemyError, OSError) as err:
        logger.warning("Rate limit evaluation encountered transient error: %s", err)
        try:
            db.rollback()
        except SQLAlchemyError as rollback_err:
            logger.debug("Failed to rollback rate limit transaction: %s", rollback_err)

        if fail_closed:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service temporarily unavailable. Please retry shortly.",
            ) from err


def cleanup_expired_rate_limit_buckets(db: Session) -> int:
    """Delete expired rate limit buckets to prune database storage growth.

    Returns the number of deleted rows.
    """
    now = datetime.now(UTC)
    stmt = text("DELETE FROM rate_limit_buckets WHERE window_expires_at < :now")
    result = db.execute(stmt, {"now": now})
    db.commit()
    return result.rowcount or 0


def validate_ip_candidate(candidate: str | None) -> str | None:
    """Validate that candidate string is a well-formed IP address or recognized hostname."""
    if not candidate:
        return None
    cleaned = candidate.strip()
    if not cleaned:
        return None

    # Handle optional port (e.g., "198.51.100.22:443" or "[2001:db8::1]:8080")
    if ":" in cleaned and not cleaned.startswith("[") and cleaned.count(":") == 1:
        cleaned = cleaned.split(":")[0]
    elif cleaned.startswith("[") and "]:" in cleaned:
        cleaned = cleaned.split("]:")[0].lstrip("[")

    try:
        ipaddress.ip_address(cleaned)
        return cleaned
    except ValueError:
        if cleaned.isalnum() or cleaned == "testclient":
            return cleaned
        return None


def get_client_identifier(request: Request) -> str:
    """Extract client IP address safely from direct connection or verified trusted proxy.

    Forwarded headers (X-Real-IP, X-Forwarded-For) are ONLY accepted if the immediate peer
    (request.client.host) is an explicitly configured trusted proxy. If the request bypasses
    the proxy or no trusted proxies are configured, client-supplied forwarded headers are
    strictly ignored to prevent rate-limit spoofing.
    """
    direct_host = request.client.host if request.client and request.client.host else "unknown"

    if direct_host != "unknown" and is_trusted_proxy(direct_host):
        real_ip = request.headers.get("x-real-ip")
        valid_real_ip = validate_ip_candidate(real_ip)
        if valid_real_ip:
            return valid_real_ip

        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            parts = [p.strip() for p in forwarded.split(",") if p.strip()]
            for candidate in reversed(parts):
                valid_cand = validate_ip_candidate(candidate)
                if valid_cand:
                    return valid_cand

    return direct_host



