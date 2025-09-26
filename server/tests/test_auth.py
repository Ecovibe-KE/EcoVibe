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


# TODO:check why this tests are not running as expected.
# import pytest
# from flask_jwt_extended import create_access_token
# from models.user import User, AccountStatus

# def test_register_weak_password(client):
#     payload = {
#         "full_name": "Weak Pass",
#         "email": "caro@gmail.com",
#         "password": "weak",
#         "industry": "Tech",
#         "phone_number": "0799999999",
#     }
#     resp = client.post("/api/register", json=payload)
#     assert resp.status_code == 400
#     assert "Password must" in resp.get_json()["message"]


# def test_verify_account_success(client, db):
#     user = User(
#         full_name="Verify User",
#         email="caro@gmail.com",
#         industry="Tech",
#         phone_number="0711111111",
#         account_status=AccountStatus.INACTIVE,
#     )
#     user.set_password("Verify123")
#     db.session.add(user)
#     db.session.commit()

#     token = create_access_token(
#         identity=str(user.id),
#         additional_claims={"purpose": "account_verification"},
#     )
#     headers = {"Authorization": f"Bearer {token}"}
#     resp = client.post("/api/verify", headers=headers)

#     assert resp.status_code == 200
#     assert "verified successfully" in resp.get_json()["message"]
#     refreshed = db.session.get(User, user.id)
#     assert refreshed.account_status == AccountStatus.ACTIVE


# def test_verify_invalid_token(client):
#     headers = {"Authorization": "Bearer invalidtoken"}
#     resp = client.post("/api/verify", headers=headers)
#     assert resp.status_code == 422
#     msg = resp.get_json().get("msg", "").lower()
#     assert "segments" in msg or "invalid" in msg


# # def test_verify_already_verified(client, db):
# #     user = User(
# #         full_name="Already Verified",
# #         email="caro@gmail.com",
# #         industry="Tech",
# #         phone_number="0722222222",
# #         account_status=AccountStatus.ACTIVE,
# #     )
# #     user.set_password("Already123")
# #     db.session.add(user)
# #     db.session.commit()

# #     token = create_access_token(
# #         identity=str(user.id),
# #         additional_claims={"purpose": "account_verification"},
# #     )
# #     headers = {"Authorization": f"Bearer {token}"}
# #     resp = client.post("/api/verify", headers=headers)
# #     assert resp.status_code == 200
# #     assert "already verified" in resp.get_json()["message"]


# def test_verify_token_wrong_purpose(client, db):
#     user = User(
#         full_name="Wrong Purpose",
#         email="caro@gmail.com",
#         industry="Tech",
#         phone_number="0733333333",
#         account_status=AccountStatus.INACTIVE,
#     )
#     user.set_password("Wrong123")
#     db.session.add(user)
#     db.session.commit()

#     token = create_access_token(identity=str(user.id))  # no purpose
#     headers = {"Authorization": f"Bearer {token}"}
#     resp = client.post("/api/verify", headers=headers)

#     assert resp.status_code == 400
#     assert "invalid" in resp.get_json()["message"].lower()
