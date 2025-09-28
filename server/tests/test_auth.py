import json
import pytest
from models.user import User, AccountStatus
from utils.token import create_refresh_token_for_user
from flask_jwt_extended import create_access_token


# ------------------------------------------------------------
# Test helpers
# ------------------------------------------------------------
def create_active_user(session, email="carol@gmail.com", password="Password123"):
    """Utility to quickly create an active user in DB"""
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


# ------------------------------------------------------------
# LOGIN TESTS
# ------------------------------------------------------------
def test_login_success(client, session):
    """Login with valid credentials should return tokens + user info"""
    user = create_active_user(session)

    response = client.post(
        "/api/login",
        data=json.dumps({"email": user.email, "password": "Password123"}),
        content_type="application/json",
    )
    body = response.get_json()

    assert response.status_code == 200
    assert body["status"] == "success"
    assert body["message"] == "Login successful"
    assert "access_token" in body["data"]
    assert "refresh_token" in body["data"]
    assert body["data"]["user"]["email"] == user.email


def test_login_invalid_credentials(client, session):
    """Invalid password should return error"""
    create_active_user(session)

    response = client.post(
        "/api/login",
        data=json.dumps({"email": "carol@gmail.com", "password": "WrongPass"}),
        content_type="application/json",
    )
    body = response.get_json()

    assert response.status_code == 401
    assert body["status"] == "error"
    assert body["message"] == "Invalid credentials"
    assert body["data"] is None


def test_login_inactive_account(client, session):
    """Inactive user should not be able to log in"""
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
    body = response.get_json()

    assert response.status_code == 403
    assert body["status"] == "error"
    assert "account is inactive" in body["message"].lower()
    assert body["data"] is None


# ------------------------------------------------------------
# REFRESH TOKEN TESTS
# ------------------------------------------------------------
def test_refresh_success(client, session):
    """Valid refresh token should return new access token"""
    user = create_active_user(session)
    refresh_token = create_refresh_token_for_user(user)

    response = client.post(
        "/api/refresh",
        data=json.dumps({"refresh_token": refresh_token}),
        content_type="application/json",
    )
    body = response.get_json()

    assert response.status_code == 200
    assert body["status"] == "success"
    assert body["message"] == "Access token refreshed"
    assert "access_token" in body["data"]
    assert body["data"]["user"]["email"] == user.email


def test_refresh_missing_token(client):
    """Missing refresh token should return error"""
    response = client.post(
        "/api/refresh",
        data=json.dumps({}),
        content_type="application/json",
    )
    body = response.get_json()

    assert response.status_code == 400
    assert body["status"] == "error"
    assert body["message"] == "Refresh token is required"
    assert body["data"] is None


# ------------------------------------------------------------
# LOGOUT TESTS
# ------------------------------------------------------------
def test_logout_success(client, session):
    """Logout should delete refresh token from DB"""
    user = create_active_user(session)
    refresh_token = create_refresh_token_for_user(user)

    response = client.post(
        "/api/logout",
        data=json.dumps({"refresh_token": refresh_token}),
        content_type="application/json",
    )
    body = response.get_json()

    assert response.status_code == 200
    assert body["status"] == "success"
    assert body["message"] == "Logged out successfully"
    assert body["data"] is None


# ------------------------------------------------------------
# ME TESTS
# ------------------------------------------------------------
def test_me_success(client, session):
    """Valid access token should return current user details"""
    user = create_active_user(session)
    login_res = client.post(
        "/api/login",
        data=json.dumps({"email": user.email, "password": "Password123"}),
        content_type="application/json",
    )
    access_token = login_res.get_json()["data"]["access_token"]

    response = client.get(
        "/api/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    body = response.get_json()

    assert response.status_code == 200
    assert body["status"] == "success"
    assert body["message"] is None
    assert body["data"]["email"] == user.email
    assert body["data"]["full_name"] == user.full_name


def test_me_unauthorized(client):
    """Requesting /me without token should fail"""
    response = client.get("/api/me")
    assert response.status_code == 401


def test_me_rejects_wrong_purpose_token(client, session):
    """ME should reject tokens without purpose=auth"""
    user = create_active_user(session)
    bad_token = create_access_token(
        identity=str(user.id),
        additional_claims={"purpose": "password_reset"},
    )
    response = client.get(
        "/api/me",
        headers={"Authorization": f"Bearer {bad_token}"},
    )
    body = response.get_json()

    assert response.status_code == 401
    assert body["status"] == "error"
    assert "invalid token purpose" in body["message"].lower()


# ------------------------------------------------------------
# FORGOT PASSWORD TESTS
# ------------------------------------------------------------
def test_forgot_password_success(client, session):
    """Always return success message, even if email does not exist"""
    user = create_active_user(session)

    response = client.post(
        "/api/forgot-password",
        data=json.dumps({"email": user.email}),
        content_type="application/json",
    )
    body = response.get_json()

    assert response.status_code == 200
    assert body["status"] == "success"
    assert "reset link" in body["message"].lower()


# ------------------------------------------------------------
# RESET PASSWORD TESTS
# ------------------------------------------------------------
def test_reset_password_success(client, session):
    """User should be able to reset password with valid reset token"""
    user = create_active_user(session)

    reset_token = create_access_token(
        identity=str(user.id),
        expires_delta=False,
        additional_claims={"purpose": "password_reset"},
    )

    response = client.post(
        "/api/reset-password",
        data=json.dumps({"new_password": "NewPassword123"}),
        content_type="application/json",
        headers={"Authorization": f"Bearer {reset_token}"},
    )
    body = response.get_json()

    assert response.status_code == 200
    assert body["status"] == "success"
    assert body["message"] == "Password reset successful"
    assert body["data"] is None


def test_reset_password_invalid_token(client, session):
    """Reset should fail if token purpose is wrong"""
    user = create_active_user(session)
    bad_token = create_access_token(identity=str(user.id))

    response = client.post(
        "/api/reset-password",
        data=json.dumps({"new_password": "NewPassword123"}),
        content_type="application/json",
        headers={"Authorization": f"Bearer {bad_token}"},
    )
    body = response.get_json()

    assert response.status_code == 400
    assert body["status"] == "error"
    assert "invalid token purpose" in body["message"].lower()


# ------------------------------------------------------------
# CHANGE PASSWORD TESTS
# ------------------------------------------------------------
def test_change_password_success(client, session):
    """Logged-in user should be able to change password"""
    user = create_active_user(session)
    login_res = client.post(
        "/api/login",
        data=json.dumps({"email": user.email, "password": "Password123"}),
        content_type="application/json",
    )
    access_token = login_res.get_json()["data"]["access_token"]

    response = client.post(
        "/api/change-password",
        data=json.dumps(
            {"current_password": "Password123", "new_password": "NewPassword123"}
        ),
        content_type="application/json",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    body = response.get_json()

    assert response.status_code == 200
    assert body["status"] == "success"
    assert body["message"] == "Password changed successfully"
    assert body["data"] is None


def test_change_password_wrong_current(client, session):
    """Change password should fail if current password is wrong"""
    user = create_active_user(session)
    login_res = client.post(
        "/api/login",
        data=json.dumps({"email": user.email, "password": "Password123"}),
        content_type="application/json",
    )
    access_token = login_res.get_json()["data"]["access_token"]

    response = client.post(
        "/api/change-password",
        data=json.dumps(
            {"current_password": "WrongPass", "new_password": "NewPassword123"}
        ),
        content_type="application/json",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    body = response.get_json()

    assert response.status_code == 401
    assert body["status"] == "error"
    assert "current password is incorrect" in body["message"].lower()
    assert body["data"] is None


def test_change_password_rejects_wrong_purpose_token(client, session):
    """Change password should reject tokens without purpose=auth"""
    user = create_active_user(session)
    bad_token = create_access_token(
        identity=str(user.id),
        additional_claims={"purpose": "password_reset"},
    )

    response = client.post(
        "/api/change-password",
        data=json.dumps(
            {"current_password": "Password123", "new_password": "NewPassword123"}
        ),
        content_type="application/json",
        headers={"Authorization": f"Bearer {bad_token}"},
    )
    body = response.get_json()

    assert response.status_code == 401
    assert body["status"] == "error"
    assert "invalid token purpose" in body["message"].lower()


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