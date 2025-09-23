import os
import threading
from datetime import timedelta

from flask import Blueprint, request, jsonify, current_app
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import create_access_token

from models import db
from models.user import User, AccountStatus
from utils.mail_templates import send_verification_email

user_bp = Blueprint("user", __name__)


# Helper function
def _is_valid_password(password: str) -> bool:
    if not isinstance(password, str) or not password.strip():
        return False
    if len(password) < 8:
        return False
    if not any(ch.isupper() for ch in password):
        return False
    if not any(ch.isdigit() for ch in password):
        return False
    return True


@user_bp.route("/register", methods=["POST"])
def register_user():
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"status": "error", "message": "Invalid JSON format", "data": None}), 400

    full_name = str(payload.get("full_name", "")).strip()
    email_raw = str(payload.get("email", "")).strip()
    password = payload.get("password")
    industry = str(payload.get("industry", "")).strip()
    phone_number = str(payload.get("phone_number", "")).strip()

    if not full_name or not industry or not phone_number:
        return jsonify({"status": "error", "message": "Missing required fields", "data": None}), 400

    if not _is_valid_password(password):
        return jsonify({
            "status": "error",
            "message": "Password must have at least 8 chars, one uppercase, one digit.",
            "data": None
        }), 400

    email = email_raw.lower()

    try:
        user = User(
            full_name=full_name,
            email=email,
            industry=industry,
            phone_number=phone_number,
            account_status=AccountStatus.INACTIVE,  # inactive until verified
        )
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        # Generate verification token
        verification_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(hours=24),
            additional_claims={"purpose": "account_verification"}
        )

        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        verify_link = f"{frontend_url}/verify?token={verification_token}"

        # Send verification email in background thread
        threading.Thread(
            target=send_verification_email,
            args=(user.email, user.full_name, verify_link),
            daemon=True,
        ).start()

        return jsonify({
            "status": "success",
            "message": "Registration successful. Please check your email to verify your account.",
            "data": user.to_safe_dict(include_email=True, include_phone=True),
        }), 201

    except ValueError as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e), "data": None}), 400
    except IntegrityError:
        db.session.rollback()
        return jsonify({"status": "error", "message": "Email or phone number already exists.", "data": None}), 409
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Unexpected error during registration")
        return jsonify({"status": "error", "message": "Server error", "data": None}), 500
