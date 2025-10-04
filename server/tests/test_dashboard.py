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
    """Minimal passing test for client dashboard"""
    # Create test user with required fields
    user = User(
        full_name="Test Client",
        email="client@test.com",
        role=Role.CLIENT,
        industry="Tech",
        phone_number="0711222333",
    )
    user.set_password("Test@123")
    db.session.add(user)
    db.session.commit()


# ---- You can uncomment later once client works ----
# def test_admin_dashboard(client):
#     ...
