import json
import pytest
from unittest.mock import patch, MagicMock
from models.user import User, Role, AccountStatus
from flask_jwt_extended import create_access_token


def create_admin_user(session, email="admin@test.com", role=Role.ADMIN):
    """Create an admin user for testing"""
    user = User(
        full_name="Admin User",
        email=email,
        industry="Tech",
        phone_number="+254712345678",
        account_status=AccountStatus.ACTIVE,
        role=role,
    )
    user.set_password("Password123")
    session.add(user)
    session.commit()
    return user


def create_test_user(session, email="user@test.com", role=Role.CLIENT):
    """Create a regular user for testing"""
    user = User(
        full_name="Test User",
        email=email,
        industry="Finance",
        phone_number="+254712345679",
        account_status=AccountStatus.ACTIVE,
        role=role,
    )
    user.set_password("Password123")
    session.add(user)
    session.commit()
    return user

def test_create_user_validation_errors(client, session):
    """Test user creation with invalid data"""
    admin = create_admin_user(session)

    login_res = client.post(
        "/api/login",
        data=json.dumps({"email": admin.email, "password": "Password123"}),
        content_type="application/json",
    )
    access_token = login_res.get_json()["access_token"]

    payload = {
        "full_name": "A",  # Too short
        "email": "invalid-email",  # Invalid format
        "phone_number": "123",  # Too short
        "role": "invalid_role",  # Invalid role
    }

    response = client.post(
        "/api/user-management",
        data=json.dumps(payload),
        content_type="application/json",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    data = response.get_json()

    assert response.status_code == 400
    assert data["status"] == "error"
    assert "errors" in data
    assert "full_name" in data["errors"]
    assert "email" in data["errors"]
    assert "phone_number" in data["errors"]
    assert "role" in data["errors"]


def test_create_user_duplicate_email(client, session):
    """Test user creation with duplicate email"""
    admin = create_admin_user(session)
    existing_user = create_test_user(session, "existing@test.com")

    login_res = client.post(
        "/api/login",
        data=json.dumps({"email": admin.email, "password": "Password123"}),
        content_type="application/json",
    )
    access_token = login_res.get_json()["access_token"]

    payload = {
        "full_name": "Duplicate User",
        "email": existing_user.email,  # Already exists
        "phone_number": "+254712345682",
        "industry": "Tech",
        "role": "client",
    }

    response = client.post(
        "/api/user-management",
        data=json.dumps(payload),
        content_type="application/json",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    data = response.get_json()

    assert response.status_code == 409
    assert data["status"] == "error"
    assert "already exists" in data["message"]


def test_create_user_admin_trying_create_admin(client, session):
    """Test admin cannot create another admin"""
    admin = create_admin_user(session)

    login_res = client.post(
        "/api/login",
        data=json.dumps({"email": admin.email, "password": "Password123"}),
        content_type="application/json",
    )
    access_token = login_res.get_json()["access_token"]

    payload = {
        "full_name": "New Admin Attempt",
        "email": "newadminattempt@test.com",
        "phone_number": "+254712345683",
        "industry": "Tech",
        "role": "admin",  # Admin trying to create admin - should fail
    }

    response = client.post(
        "/api/user-management",
        data=json.dumps(payload),
        content_type="application/json",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    data = response.get_json()

    assert response.status_code == 403
    assert data["status"] == "error"
    assert "admin or SUPER_ADMIN" in data["message"]


def test_create_user_unauthorized(client):
    """Test unauthorized user cannot create users"""
    payload = {
        "full_name": "Unauthorized User",
        "email": "unauthorized@test.com",
        "phone_number": "+254712345684",
        "industry": "Tech",
    }

    response = client.post(
        "/api/user-management",
        data=json.dumps(payload),
        content_type="application/json",
    )

    assert response.status_code == 401  # Unauthorized


def test_get_user_success(client, session):
    """Test retrieving specific user details"""
    admin = create_admin_user(session)
    user = create_test_user(session)

    login_res = client.post(
        "/api/login",
        data=json.dumps({"email": admin.email, "password": "Password123"}),
        content_type="application/json",
    )
    access_token = login_res.get_json()["access_token"]

    response = client.get(
        f"/api/user-management/{user.id}",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    data = response.get_json()

    assert response.status_code == 200
    assert data["status"] == "success"
    assert data["data"]["email"] == user.email
    assert data["data"]["name"] == user.full_name


def test_get_user_not_found(client, session):
    """Test retrieving non-existent user"""
    admin = create_admin_user(session)

    login_res = client.post(
        "/api/login",
        data=json.dumps({"email": admin.email, "password": "Password123"}),
        content_type="application/json",
    )
    access_token = login_res.get_json()["access_token"]

    response = client.get(
        "/api/user-management/9999",  # Non-existent ID
        headers={"Authorization": f"Bearer {access_token}"},
    )
    data = response.get_json()

    assert response.status_code == 404
    assert data["status"] == "error"
    assert "not found" in data["message"]


def test_delete_user_success(client, session):
    """Test successful user deletion"""
    admin = create_admin_user(session)
    user = create_test_user(session)

    login_res = client.post(
        "/api/login",
        data=json.dumps({"email": admin.email, "password": "Password123"}),
        content_type="application/json",
    )
    access_token = login_res.get_json()["access_token"]

    response = client.delete(
        f"/api/user-management/{user.id}",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    data = response.get_json()

    assert response.status_code == 200
    assert data["status"] == "success"
    assert "deleted successfully" in data["message"]


def test_delete_own_account(client, session):
    """Test user cannot delete their own account"""
    admin = create_admin_user(session)

    login_res = client.post(
        "/api/login",
        data=json.dumps({"email": admin.email, "password": "Password123"}),
        content_type="application/json",
    )
    access_token = login_res.get_json()["access_token"]

    response = client.delete(
        f"/api/user-management/{admin.id}",  # Trying to delete own account
        headers={"Authorization": f"Bearer {access_token}"},
    )
    data = response.get_json()

    assert response.status_code == 400
    assert data["status"] == "error"
    assert "own account" in data["message"]


def test_update_user_status_success(client, session):
    """Test successful user status update"""
    admin = create_admin_user(session)
    user = create_test_user(session)

    login_res = client.post(
        "/api/login",
        data=json.dumps({"email": admin.email, "password": "Password123"}),
        content_type="application/json",
    )
    access_token = login_res.get_json()["access_token"]

    payload = {"status": "inactive"}

    response = client.patch(
        f"/api/user-management/{user.id}/status",
        data=json.dumps(payload),
        content_type="application/json",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    data = response.get_json()

    assert response.status_code == 200
    assert data["status"] == "success"
    assert "inactive successfully" in data["message"]


def test_update_user_status_invalid(client, session):
    """Test user status update with invalid status"""
    admin = create_admin_user(session)
    user = create_test_user(session)

    login_res = client.post(
        "/api/login",
        data=json.dumps({"email": admin.email, "password": "Password123"}),
        content_type="application/json",
    )
    access_token = login_res.get_json()["access_token"]

    payload = {"status": "invalid_status"}

    response = client.patch(
        f"/api/user-management/{user.id}/status",
        data=json.dumps(payload),
        content_type="application/json",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    data = response.get_json()

    assert response.status_code == 400
    assert data["status"] == "error"
    assert "Status must be one of" in data["message"]


def test_client_access_denied(client, session):
    """Test client cannot access user management endpoints"""
    client_user = create_test_user(session, "client@test.com", Role.CLIENT)

    login_res = client.post(
        "/api/login",
        data=json.dumps({"email": client_user.email, "password": "Password123"}),
        content_type="application/json",
    )
    access_token = login_res.get_json()["access_token"]

    response = client.get(
        "/api/user-management",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    data = response.get_json()

    assert response.status_code == 403
    assert data["status"] == "error"
    assert "permissions" in data["message"]
