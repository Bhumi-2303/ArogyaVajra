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
