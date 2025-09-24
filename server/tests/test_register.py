def test_register_success(client):
    """Test successful registration."""
    payload = {
        "full_name": "John Doe",
        "email": "john@example.com",
        "password": "StrongPass1",
        "industry": "Energy",
        "phone_number": "0712345678",
    }
    res = client.post("/api/register", json=payload)
    data = res.get_json()

    assert res.status_code == 201
    assert data["status"] == "success"
    assert data["message"] == "Client registered successfully"
    assert "data" in data
    assert data["data"]["email"] == "john@example.com"


def test_register_missing_field(client):
    """Test registration with missing fields."""
    payload = {
        "full_name": "John Doe",
        "email": "john@example.com",
        # Missing password
        "industry": "Energy",
        "phone_number": "0712345678",
    }
    res = client.post("/api/register", json=payload)
    data = res.get_json()

    assert res.status_code == 400
    assert data["status"] == "error"
    assert "Password" in data["message"]  # since your API explains what failed
