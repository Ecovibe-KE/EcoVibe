import os
import pytest
from server.app import create_app


@pytest.fixture()
def client(monkeypatch):
    # Use an in-memory SQLite DB for tests
    monkeypatch.setenv("DATABASE_URL", "sqlite:///:memory:")
    app = create_app()
    app.config.update({
        "TESTING": True,
    })
    with app.test_client() as client:
        yield client


def test_register_success(client):
    payload = {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "password": "StrongPass1",
        "industry": "Energy",
        "phoneNumber": "1234567890",
    }
    res = client.post("/api/register", json=payload)
    assert res.status_code == 201
    assert res.get_json() == {"message": "Account created successfully."}


@pytest.mark.parametrize("bad_payload", [
    {},
    {"firstName": "John"},
    {
        "firstName": " ",
        "lastName": "Doe",
        "email": "john@example.com",
        "password": "StrongPass1",
        "industry": "Energy",
        "phoneNumber": "1234567890",
    },
    {
        "firstName": "John",
        "lastName": "Doe",
        "email": "not-an-email",
        "password": "StrongPass1",
        "industry": "Energy",
        "phoneNumber": "1234567890",
    },
    {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "password": "weakpass",  # no uppercase or digit
        "industry": "Energy",
        "phoneNumber": "1234567890",
    },
])
def test_register_invalid_input(client, bad_payload):
    res = client.post("/api/register", json=bad_payload)
    assert res.status_code == 400
    assert res.get_json() == {"error": "Invalid input."}


def test_register_conflict_email(client):
    payload = {
        "firstName": "John",
        "lastName": "Doe",
        "email": "dup@example.com",
        "password": "StrongPass1",
        "industry": "Energy",
        "phoneNumber": "1234567890",
    }
    res1 = client.post("/api/register", json=payload)
    assert res1.status_code == 201

    # Try again with same email (different case to ensure case-insensitive check)
    payload2 = dict(payload)
    payload2["email"] = "DUP@example.com"
    res2 = client.post("/api/register", json=payload2)
    assert res2.status_code == 409
    assert res2.get_json() == {"error": "Email already exists."}


