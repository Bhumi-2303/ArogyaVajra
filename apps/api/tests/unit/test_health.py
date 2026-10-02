"""Health check and root API endpoint tests."""

from unittest.mock import patch


def test_health_check(client):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "arogyavajra-api"


def test_readiness_check_healthy(client):
    """Test readiness check when database is reachable."""
    with patch("app.main.check_db_connection", return_value=True):
        response = client.get("/ready")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ready"
        assert data["database"] == "connected"


def test_readiness_check_unhealthy(client):
    """Test readiness check when database is unreachable."""
    with patch("app.main.check_db_connection", return_value=False):
        response = client.get("/ready")
        assert response.status_code == 503
        data = response.json()
        assert data["status"] == "unhealthy"
        assert data["database"] == "disconnected"


def test_api_v1_root(client):
    """Test API v1 root endpoint."""
    response = client.get("/api/v1")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert data["data"]["name"] == "Arogyavajra API"

