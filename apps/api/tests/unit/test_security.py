"""Unit tests for password hashing and JWT token management."""

import uuid
from datetime import timedelta

import pytest
from jose import jwt

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_hash_and_verify_password():
    password = "SuperSecretPassword123!"
    hashed = hash_password(password)

    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_password_cannot_leak_plaintext():
    password = "SensitivePassword999"
    hashed = hash_password(password)

    assert password not in hashed
    assert hashed.startswith("$2b$")


def test_create_and_decode_access_token():
    user_id = uuid.uuid4()
    role = "PATIENT"
    token = create_access_token(subject=user_id, role=role)

    decoded = decode_token(token)
    assert decoded["sub"] == str(user_id)
    assert decoded["role"] == role
    assert decoded["type"] == "access"
    assert "exp" in decoded


def test_create_and_decode_refresh_token():
    user_id = uuid.uuid4()
    token = create_refresh_token(subject=user_id)

    decoded = decode_token(token)
    assert decoded["sub"] == str(user_id)
    assert decoded["type"] == "refresh"
    assert "role" not in decoded


def test_expired_token_raises_jwt_error():
    user_id = uuid.uuid4()
    token = create_access_token(
        subject=user_id,
        role="ADMIN",
        expires_delta=timedelta(seconds=-10),
    )

    with pytest.raises(jwt.JWTError):
        decode_token(token)


def test_tampered_token_raises_jwt_error():
    user_id = uuid.uuid4()
    token = create_access_token(subject=user_id, role="DOCTOR")
    tampered_token = token[:-5] + "XXXXX"

    with pytest.raises(jwt.JWTError):
        decode_token(tampered_token)


def test_settings_production_fails_with_insecure_default_secret():
    from app.core.config import Settings

    with pytest.raises(ValueError, match="Security validation failed"):
        Settings(
            APP_ENV="production",
            JWT_SECRET_KEY="dev-secret-key-change-in-production",
        )


def test_settings_production_fails_with_short_secret():
    from app.core.config import Settings

    with pytest.raises(ValueError, match="Security validation failed"):
        Settings(
            APP_ENV="production",
            JWT_SECRET_KEY="too-short-secret-key",
        )


def test_settings_production_succeeds_with_valid_configuration():
    from app.core.config import Settings

    strong_secret = "a" * 32
    s = Settings(
        APP_ENV="production",
        JWT_SECRET_KEY=strong_secret,
        APP_DEBUG=False,
        CORS_ORIGINS="https://app.arogyavajra.com,https://admin.arogyavajra.com",
        DATABASE_URL="postgresql+psycopg://prod_user:hardened_pass_123@prod-db.internal:5432/arogyavajra_prod",
    )
    assert s.JWT_SECRET_KEY == strong_secret
    assert s.APP_DEBUG is False


def test_settings_production_fails_with_debug_true():
    from app.core.config import Settings

    with pytest.raises(ValueError, match="APP_DEBUG must be False"):
        Settings(
            APP_ENV="production",
            JWT_SECRET_KEY="a" * 32,
            APP_DEBUG=True,
            CORS_ORIGINS="https://app.arogyavajra.com",
            DATABASE_URL="postgresql+psycopg://u:p@db:5432/db",
        )


def test_settings_production_fails_with_wildcard_cors():
    from app.core.config import Settings

    with pytest.raises(ValueError, match="cannot be a wildcard"):
        Settings(
            APP_ENV="production",
            JWT_SECRET_KEY="a" * 32,
            APP_DEBUG=False,
            CORS_ORIGINS="*",
            DATABASE_URL="postgresql+psycopg://u:p@db:5432/db",
        )


def test_settings_production_fails_with_localhost_cors():
    from app.core.config import Settings

    with pytest.raises(ValueError, match="point to localhost"):
        Settings(
            APP_ENV="production",
            JWT_SECRET_KEY="a" * 32,
            APP_DEBUG=False,
            CORS_ORIGINS="http://localhost:3000",
            DATABASE_URL="postgresql+psycopg://u:p@db:5432/db",
        )


def test_settings_production_fails_with_dev_database_password():
    from app.core.config import Settings

    with pytest.raises(ValueError, match="development or default database credentials"):
        Settings(
            APP_ENV="production",
            JWT_SECRET_KEY="a" * 32,
            APP_DEBUG=False,
            CORS_ORIGINS="https://app.arogyavajra.com",
            DATABASE_URL="postgresql+psycopg://arogyavajra:arogyavajra_dev_password@localhost:5434/arogyavajra",
        )


def test_settings_development_allows_default_secret():
    from app.core.config import Settings

    s = Settings(
        APP_ENV="development",
        JWT_SECRET_KEY="dev-secret-key-change-in-production",
    )
    assert s.JWT_SECRET_KEY == "dev-secret-key-change-in-production"


def test_hash_token_consistency():
    from app.core.security import hash_token

    token_str = "sample-refresh-token-value-12345"
    h1 = hash_token(token_str)
    h2 = hash_token(token_str)
    assert h1 == h2
    assert len(h1) == 64  # SHA-256 hex length
    assert h1 != token_str


def test_settings_production_fails_with_http_cors():
    from app.core.config import Settings

    with pytest.raises(ValueError, match="must use secure HTTPS"):
        Settings(
            APP_ENV="production",
            JWT_SECRET_KEY="a" * 32,
            APP_DEBUG=False,
            CORS_ORIGINS="http://app.arogyavajra.com",
            DATABASE_URL="postgresql+psycopg://u:p@db:5432/db",
        )


def test_settings_production_fails_with_unspecified_ip_cors():
    from app.core.config import Settings

    with pytest.raises(ValueError, match="point to localhost/loopback"):
        Settings(
            APP_ENV="production",
            JWT_SECRET_KEY="a" * 32,
            APP_DEBUG=False,
            CORS_ORIGINS="https://0.0.0.0:3000",
            DATABASE_URL="postgresql+psycopg://u:p@db:5432/db",
        )


def test_get_client_identifier_ignores_spoofed_headers_from_untrusted_direct_client():
    from starlette.requests import Request

    from app.core.rate_limit import get_client_identifier

    # Untrusted external client attempts to spoof X-Real-IP and X-Forwarded-For
    scope = {
        "type": "http",
        "client": ("203.0.113.195", 1234),
        "headers": [
            (b"x-real-ip", b"198.51.100.22"),
            (b"x-forwarded-for", b"spoofed-ip-1, spoofed-ip-2"),
        ],
    }
    req = Request(scope)
    # Forwarded headers must be ignored because 203.0.113.195 is not a trusted proxy
    assert get_client_identifier(req) == "203.0.113.195"


def test_get_client_identifier_safe_default_when_no_proxy_configured(monkeypatch):
    from starlette.requests import Request

    from app.core.config import settings
    from app.core.rate_limit import get_client_identifier

    monkeypatch.setattr(settings, "TRUSTED_PROXIES", "")

    scope = {
        "type": "http",
        "client": ("127.0.0.1", 1234),
        "headers": [(b"x-real-ip", b"198.51.100.22")],
    }
    req = Request(scope)
    # Default without configured trusted proxies must not trust forwarded headers
    assert get_client_identifier(req) == "127.0.0.1"


def test_get_client_identifier_trusts_configured_proxy_and_extracts_rightmost(monkeypatch):
    from starlette.requests import Request

    from app.core.config import settings
    from app.core.rate_limit import get_client_identifier

    # Configure trusted reverse proxies (single IP and CIDR range)
    monkeypatch.setattr(settings, "TRUSTED_PROXIES", "127.0.0.1, 10.0.0.0/8")

    # Case 1: X-Real-IP through trusted proxy
    scope = {
        "type": "http",
        "client": ("10.0.0.1", 1234),
        "headers": [(b"x-real-ip", b"198.51.100.22")],
    }
    req = Request(scope)
    assert get_client_identifier(req) == "198.51.100.22"

    # Case 2: X-Forwarded-For through trusted proxy extracts rightmost (proxy-appended) IP
    scope = {
        "type": "http",
        "client": ("127.0.0.1", 1234),
        "headers": [(b"x-forwarded-for", b"client-spoofed, 198.51.100.50")],
    }
    req = Request(scope)
    assert get_client_identifier(req) == "198.51.100.50"



def test_rate_limiter_cannot_be_bypassed_in_production(monkeypatch):
    from unittest.mock import MagicMock

    from app.core.config import settings
    from app.core.rate_limit import check_rate_limit

    # Emulate production environment
    monkeypatch.setattr(settings, "APP_ENV", "production")

    mock_db = MagicMock()
    mock_db.execute.return_value.fetchone.return_value = (1,)

    # Even if bypass_in_test=True, in production it must not bypass and must attempt DB query
    check_rate_limit(
        db=mock_db,
        key_prefix="test",
        identifier="1.2.3.4",
        max_requests=5,
        window_seconds=60,
        bypass_in_test=True,
    )
    # Ensure execute was called on DB (i.e. not bypassed)
    assert mock_db.execute.called


def test_get_client_identifier_multiple_proxy_hops(monkeypatch):
    from starlette.requests import Request

    from app.core.config import settings
    from app.core.rate_limit import get_client_identifier

    monkeypatch.setattr(settings, "TRUSTED_PROXIES", "10.0.0.1, 10.0.0.2")

    # Multi-hop proxy chain: client (203.0.113.5) -> Proxy 1 (10.0.0.2) -> Proxy 2 (10.0.0.1)
    scope = {
        "type": "http",
        "client": ("10.0.0.1", 1234),
        "headers": [(b"x-forwarded-for", b"203.0.113.5, 10.0.0.2")],
    }
    req = Request(scope)
    # Extracts the closest hop before Proxy 2 (10.0.0.2) or client IP
    assert get_client_identifier(req) == "10.0.0.2"


def test_get_client_identifier_malformed_and_edge_case_headers(monkeypatch):
    from starlette.requests import Request

    from app.core.config import settings
    from app.core.rate_limit import get_client_identifier

    monkeypatch.setattr(settings, "TRUSTED_PROXIES", "127.0.0.1")

    # Subcase A: Malformed script tags in X-Forwarded-For -> falls back to direct_host
    scope = {
        "type": "http",
        "client": ("127.0.0.1", 1234),
        "headers": [(b"x-forwarded-for", b"<script>alert(1)</script>")],
    }
    assert get_client_identifier(Request(scope)) == "127.0.0.1"

    # Subcase B: Empty / whitespace comma chain -> falls back to direct_host
    scope = {
        "type": "http",
        "client": ("127.0.0.1", 1234),
        "headers": [(b"x-forwarded-for", b" , ,   , ")],
    }
    assert get_client_identifier(Request(scope)) == "127.0.0.1"

    # Subcase C: Forwarded IP containing port -> strips port cleanly
    scope = {
        "type": "http",
        "client": ("127.0.0.1", 1234),
        "headers": [(b"x-real-ip", b"203.0.113.88:8080")],
    }
    assert get_client_identifier(Request(scope)) == "203.0.113.88"

    # Subcase D: Malformed X-Real-IP falls through to valid candidate in X-Forwarded-For
    scope = {
        "type": "http",
        "client": ("127.0.0.1", 1234),
        "headers": [
            (b"x-real-ip", b"not-a-valid-ip-here"),
            (b"x-forwarded-for", b"spoofed-entry, 203.0.113.99"),
        ],
    }
    assert get_client_identifier(Request(scope)) == "203.0.113.99"


def test_alembic_url_resolution_deterministic():
    from pathlib import Path

    from alembic.config import Config

    from app.core.config import settings

    alembic_ini_path = str(Path(__file__).resolve().parents[2] / "alembic.ini")

    # Case 1: Normal operation without overrides -> resolves to settings.DATABASE_URL
    cfg1 = Config(alembic_ini_path)
    # In alembic.ini, sqlalchemy.url is blank; env.py resolution sets settings.DATABASE_URL
    resolved_url1 = cfg1.get_main_option("sqlalchemy.url") or settings.DATABASE_URL
    assert resolved_url1 == settings.DATABASE_URL

    # Case 2: Explicit disposable test URL override
    disposable_url = "postgresql+psycopg://test:pass@localhost:5434/arogyavajra_disposable"
    cfg2 = Config(alembic_ini_path)
    cfg2.set_main_option("sqlalchemy.url", disposable_url)
    resolved_url2 = cfg2.get_main_option("sqlalchemy.url") or settings.DATABASE_URL
    assert resolved_url2 == disposable_url
    assert resolved_url2 != settings.DATABASE_URL






