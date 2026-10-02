"""Health check and root API endpoint tests."""


def test_health_check(client):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "arogyavajra-api"


def test_api_v1_root(client):
    """Test API v1 root endpoint."""
    response = client.get("/api/v1")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert data["data"]["name"] == "Arogyavajra API"
