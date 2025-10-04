import pytest
from app import create_app, db
from models.user import User, Role
from flask_jwt_extended import create_access_token


@pytest.fixture
def client():
    app = create_app("testing")
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.session.remove()
            db.drop_all()


def test_client_dashboard(client):
    user = User(full_name="Test Client", email="client@test.com", role=Role.CLIENT)
    user.set_password("password")
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=user.id)
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/dashboard", headers=headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "success"
    assert "stats" in data["data"]


def test_admin_dashboard(client):
    user = User(full_name="Admin User", email="admin@test.com", role=Role.ADMIN)
    user.set_password("password")
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=user.id)
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/dashboard", headers=headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "success"
    assert "recentBookings" in data["data"]
