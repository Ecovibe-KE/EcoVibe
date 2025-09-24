import pytest
from flask_jwt_extended import create_access_token
from models.user import User, AccountStatus


@pytest.fixture(autouse=True)
def patch_email(monkeypatch):
    """Disable actual email sending for all tests in this file."""
    monkeypatch.setattr(
        "utils.mail_templates.send_verification_email",
        lambda *a, **k: None,  # no-op
    )


def test_register_success(client, db):
    payload = {
        "full_name": "Caroline Majute",
        "email": "caro@gmail.com",
        "password": "SecurePass123",
        "industry": "Tech",
        "phone_number": "0712345678",
    }
    resp = client.post("/api/register", json=payload)
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["status"] == "success"
    assert data["data"]["email"] == payload["email"].lower()


def test_register_weak_password(client):
    payload = {
        "full_name": "Weak Pass",
        "email": "caro@gmail.com",
        "password": "weak",
        "industry": "Tech",
        "phone_number": "0799999999",
    }
    resp = client.post("/api/register", json=payload)
    assert resp.status_code == 400
    assert "Password must" in resp.get_json()["message"]


def test_register_missing_fields(client):
    payload = {"email": "caro@gmail.com", "password": "StrongPass1"}
    resp = client.post("/api/register", json=payload)
    assert resp.status_code == 400
    assert "full_name cannot be empty" in resp.get_json()["message"]


def test_register_duplicate_email(client, db):
    payload = {
        "full_name": "Dup User",
        "email": "caro@gmail.com",
        "password": "StrongPass1",
        "industry": "Finance",
        "phone_number": "0700000000",
    }
    client.post("/api/register", json=payload)
    resp = client.post("/api/register", json=payload)
    assert resp.status_code == 409
    assert "exists" in resp.get_json()["message"]


def test_verify_account_success(client, db):
    user = User(
        full_name="Verify User",
        email="caro@gmail.com",
        industry="Tech",
        phone_number="0711111111",
        account_status=AccountStatus.INACTIVE,
    )
    user.set_password("Verify123")
    db.session.add(user)
    db.session.commit()

    token = create_access_token(
        identity=str(user.id),
        additional_claims={"purpose": "account_verification"},
    )
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.post("/api/verify", headers=headers)

    assert resp.status_code == 200
    assert "verified successfully" in resp.get_json()["message"]
    refreshed = db.session.get(User, user.id)
    assert refreshed.account_status == AccountStatus.ACTIVE


def test_verify_invalid_token(client):
    headers = {"Authorization": "Bearer invalidtoken"}
    resp = client.post("/api/verify", headers=headers)
    assert resp.status_code == 422
    msg = resp.get_json().get("msg", "").lower()
    assert "segments" in msg or "invalid" in msg


def test_verify_already_verified(client, db):
    user = User(
        full_name="Already Verified",
        email="caro@gmail.com",
        industry="Tech",
        phone_number="0722222222",
        account_status=AccountStatus.ACTIVE,
    )
    user.set_password("Already123")
    db.session.add(user)
    db.session.commit()

    token = create_access_token(
        identity=str(user.id),
        additional_claims={"purpose": "account_verification"},
    )
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.post("/api/verify", headers=headers)
    assert resp.status_code == 200
    assert "already verified" in resp.get_json()["message"]


def test_verify_token_wrong_purpose(client, db):
    user = User(
        full_name="Wrong Purpose",
        email="caro@gmail.com",
        industry="Tech",
        phone_number="0733333333",
        account_status=AccountStatus.INACTIVE,
    )
    user.set_password("Wrong123")
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))  # no purpose
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.post("/api/verify", headers=headers)

    assert resp.status_code == 400
    assert "invalid" in resp.get_json()["message"].lower()
