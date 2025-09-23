import json


def test_ping(client):
    """Test the ping endpoint."""
    response = client.get("/api/ping")
    assert response.status_code == 200
    expected_data = {
        "status": "success",
        "message": "The server is up and running.",
        "data": None,
    }
    assert json.loads(response.data) == expected_data
