import pytest
import json
from server.routes import service as service_routes
from models.service import ServiceStatus

@pytest.fixture
def client(app):
    return app.test_client()

def get_headers(access_token=None):
    headers = {"Content-Type": "application/json"}
    if access_token:
        headers["Authorization"] = f"Bearer {access_token}"
    return headers

def test_get_all_services(client):
    response = client.get("/api/services")
    data = response.get_json()
    assert response.status_code == 200
    assert data["status"] == "success"
    assert isinstance(data["data"], list)

def test_get_service_not_found(client):
    response = client.get("/api/services/999999")
    data = response.get_json()
    assert response.status_code == 404
    assert data["status"] == "failed"

@pytest.mark.parametrize("access_token", [None])
def test_create_service_unauthorized(client, access_token):
    payload = {
        "title": "Test Service",
        "description": "Test desc",
        "price": "10",
        "duration": "1 hr 0 min",
        "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA",
        "status": "active"
    }
    response = client.post("/api/services", data=json.dumps(payload), headers=get_headers(access_token))
    assert response.status_code == 401 or response.status_code == 403

# For authorized tests, you would mock JWT and User validation here.
# Here is an example assuming you have a way to generate a valid admin token.

@pytest.mark.skip("Requires JWT and DB setup")
def test_create_service_success(client, admin_token):
    payload = {
        "title": "Test Service",
        "description": "Test desc",
        "price": "10",
        "duration": "1 hr 0 min",
        "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA",
        "status": "active",
        "currency": "USD"
    }
    response = client.post("/api/services", data=json.dumps(payload), headers=get_headers(admin_token))
    data = response.get_json()
    assert response.status_code == 201
    assert data["status"] == "success"
    assert data["data"]["title"] == "Test Service"

@pytest.mark.skip("Requires JWT and DB setup")
def test_update_service_success(client, admin_token):
    service_id = 1  # Must exist
    payload = {"price": "15", "duration": "2 hr 15 min", "status": "inactive"}
    response = client.put(f"/api/services/{service_id}", data=json.dumps(payload), headers=get_headers(admin_token))
    data = response.get_json()
    assert response.status_code == 200
    assert data["status"] == "success"

@pytest.mark.skip("Requires JWT and DB setup")
def test_delete_service_success(client, admin_token):
    service_id = 1  # Must exist
    response = client.delete(f"/api/services/{service_id}", headers=get_headers(admin_token))
    data = response.get_json()
    assert response.status_code == 200
    assert data["status"] == "success"

@pytest.mark.skip("Requires JWT and DB setup")
def test_get_my_services(client, admin_token):
    response = client.get("/api/services/my-services", headers=get_headers(admin_token))
    data = response.get_json()
    assert response.status_code == 200
    assert data["status"] == "success"

@pytest.mark.skip("Requires JWT and DB setup")
def test_get_services_by_status(client, admin_token):
    response = client.get("/api/services/status/active", headers=get_headers(admin_token))
    data = response.get_json()
    assert response.status_code == 200
    assert data["status"] == "success"
