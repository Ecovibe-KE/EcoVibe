import os
import pytest
from server import create_app


@pytest.fixture()
def register_client(monkeypatch, tmp_path):
    # Use a file-based SQLite DB for reliability across connections
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("FLASK_SQLALCHEMY_DATABASE_URI", f"sqlite:///{db_path}")
    app = create_app()
    app.config.update({
        "TESTING": True,
    })
    # Ensure tables exist for tests
    with app.app_context():
        from server.models import db as _db
        _db.create_all()
    with app.test_client() as client:
        yield client


def test_register_success(client):
    payload = {
        "full_name": "John Doe",
        "email": "john@gmail.com",
        "password": "StrongPass1",
        "industry": "Energy",
        "phone_number": "1234567890",
    }
    res = client.post("/api/register", json=payload)
    assert res.status_code == 201
    assert res.get_json() == {"message": "Account created successfully."}


@pytest.mark.parametrize("bad_payload", [
    {},
    {"firstName": "John"},
    {
        "full_name": "John Doe",
        "email": "john@gmail.com",
        "password": "StrongPass1",
        "industry": "Energy",
        "phone_number": "1234567890",
    },
    {
        "full_name": "John Doe",
        "email": "not-an-email",
        "password": "StrongPass1",
        "industry": "Energy",
        "phone_number": "1234567890",
    },
    {
        "full_name": "John Doe",
        "email": "john@example.com",
        "password": "weakpass",  # no uppercase or digit
        "industry": "Energy",
        "phone_number": "1234567890",
    },
])
def test_register_invalid_input(client, bad_payload):
    res = client.post("/api/register", json=bad_payload)
    assert res.status_code == 400
    assert res.get_json() == {"error": "Invalid input."}


def test_register_conflict_email(client):
    payload = {
        "full_name": "John Doe",
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


