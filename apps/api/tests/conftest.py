"""Pytest fixtures and configuration."""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """Test client fixture for API endpoints."""
    return TestClient(app)
