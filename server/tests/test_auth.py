import json
import pytest
from models.user import User, AccountStatus
from utils.token import create_refresh_token_for_user


def create_active_user(session, email="carol@gmail.com", password="Password123"):
    user = User(
        full_name="Jane Doe",
        email=email,
        industry="Tech",
        phone_number="+254712345678",
        account_status=AccountStatus.ACTIVE,
    )
    user.set_password(password)
    session.add(user)
    session.commit()
    return user


def test_login_success(client, session):
    user = create_active_user(session)

    response = client.post(
        "/api/login",
        data=json.dumps({"email": user.email, "password": "Password123"}),
        content_type="application/json",
    )
    data = response.get_json()

    assert response.status_code == 200
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == user.email


def test_login_invalid_credentials(client, session):
    create_active_user(session)

    response = client.post(
        "/api/login",
        data=json.dumps({"email": "carol@gmail.com", "password": "WrongPass"}),
        content_type="application/json",
    )

    assert response.status_code == 401
    assert response.get_json()["error"] == "invalid credentials"


def test_login_inactive_account(client, session):
    user = User(
        full_name="Jane Doe",
        email="inactive@gmail.com",
        industry="Tech",
        phone_number="+254700000000",
        account_status=AccountStatus.INACTIVE,
    )
    user.set_password("Password123")
    session.add(user)
    session.commit()

    response = client.post(
        "/api/login",
        data=json.dumps({"email": user.email, "password": "Password123"}),
        content_type="application/json",
    )

    assert response.status_code == 403
    assert "account is inactive" in response.get_json()["error"]


def test_refresh_success(client, session):
    user = create_active_user(session)
    refresh_token = create_refresh_token_for_user(user)

    response = client.post(
        "/api/refresh",
        data=json.dumps({"refresh_token": refresh_token}),
        content_type="application/json",
    )
    data = response.get_json()

    assert response.status_code == 200
    assert "access_token" in data
    assert data["user"]["email"] == user.email


def test_refresh_missing_token(client):
    response = client.post(
        "/api/refresh",
        data=json.dumps({}),
        content_type="application/json",
    )
    assert response.status_code == 400
    assert response.get_json()["error"] == "refresh token is required"


def test_logout_success(client, session):
    user = create_active_user(session)
    refresh_token = create_refresh_token_for_user(user)

    response = client.post(
        "/api/logout",
        data=json.dumps({"refresh_token": refresh_token}),
        content_type="application/json",
    )
    assert response.status_code == 200
    assert response.get_json()["message"] == "Logged out successfully"


def test_me_success(client, session):
    user = create_active_user(session)
    login_res = client.post(
        "/api/login",
        data=json.dumps({"email": user.email, "password": "Password123"}),
        content_type="application/json",
    )
    access_token = login_res.get_json()["access_token"]

    response = client.get(
        "/api/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    data = response.get_json()

    assert response.status_code == 200
    assert data["email"] == user.email
    assert data["full_name"] == user.full_name


def test_me_unauthorized(client):
    response = client.get("/api/me")
    assert response.status_code == 401
