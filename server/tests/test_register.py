import pytest
from server.app import create_app
from server.models.user import db, User

@pytest.fixture
def client(tmp_path, monkeypatch):
    """Create a Flask test client with a temporary SQLite DB."""
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("FLASK_SQLALCHEMY_DATABASE_URI", f"sqlite:///{db_path}")

    app = create_app()
    app.config.update({"TESTING": True})

    with app.app_context():
        db.create_all()

    with app.test_client() as client:
        yield client

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
    assert res.status_code == 201
    assert res.get_json() == {"message": "Account created successfully."}

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
    assert res.status_code == 400
    assert "error" in res.get_json()
