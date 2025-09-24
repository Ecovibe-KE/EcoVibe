import os
import threading
from datetime import timedelta

from flask import Blueprint, request, jsonify, current_app
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import create_access_token
from email_validator import validate_email, EmailNotValidError

from models import db
from models.user import User, AccountStatus
from utils.mail_templates import send_verification_email

user_bp = Blueprint("user", __name__)


def _is_valid_password(password: str) -> bool:
    """Check password length + at least one uppercase + one digit"""
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

    # Reject if body is missing or malformed JSON
    if payload is None:
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Invalid JSON format",
                    "data": None,
                }
            ),
            400,
        )

    # Extract + sanitize fields
    full_name = str(payload.get("full_name", "")).strip()
    email_raw = str(payload.get("email", "")).strip()
    password = payload.get("password")
    industry = str(payload.get("industry", "")).strip()
    phone_number = str(payload.get("phone_number", "")).strip()

    # Validate required fields individually
    if not full_name:
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "full_name cannot be empty",
                    "data": None,
                }
            ),
            400,
        )
    if not industry:
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "industry cannot be empty",
                    "data": None,
                }
            ),
            400,
        )
    if not phone_number:
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "phone_number cannot be empty",
                    "data": None,
                }
            ),
            400,
        )

    # Validate password strength
    if not _is_valid_password(password):
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Password must have at least 8 chars, "
                    "one uppercase, one digit.",
                    "data": None,
                }
            ),
            400,
        )

    # Validate email format
    try:
        email = validate_email(email_raw).email.lower()
    except EmailNotValidError:
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "The email address is not valid.",
                    "data": None,
                }
            ),
            400,
        )

    try:
        # Check for duplicate email/phone before creating user
        if User.query.filter_by(email=email).first():
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Email already exists",
                        "data": None,
                    }
                ),
                409,
            )
        if User.query.filter_by(phone_number=phone_number).first():
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Phone number already exists",
                        "data": None,
                    }
                ),
                409,
            )

        # Create + persist user
        user = User(
            full_name=full_name,
            email=email,
            industry=industry,
            phone_number=phone_number,
            account_status=AccountStatus.INACTIVE,
        )
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        # Create JWT token for verification link
        verification_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(hours=24),
            additional_claims={"purpose": "account_verification"},
        )

        # Build link for frontend verify page
        frontend_url = os.getenv("VITE_FRONTEND_URL", "http://localhost:5173")
        verify_link = f"{frontend_url}/verify?token={verification_token}"

        # Send email in background thread (non-blocking)
        threading.Thread(
            target=send_verification_email,
            args=(user.email, user.full_name, verify_link),
            daemon=True,
        ).start()

        return (
            jsonify(
                {
                    "status": "success",
                    "message": "Registration successful. Please check your email "
                    "to verify your account.",
                    "data": user.to_safe_dict(
                        include_email=True,
                        include_phone=True,
                    ),
                }
            ),
            201,
        )

    except ValueError as e:
        # Catch custom validation errors
        db.session.rollback()
        return (
            jsonify(
                {
                    "status": "error",
                    "message": str(e),
                    "data": None,
                }
            ),
            400,
        )

    except IntegrityError:
        # Extra safeguard for race conditions on duplicates
        db.session.rollback()
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Email or phone number already exists.",
                    "data": None,
                }
            ),
            409,
        )

    except Exception:
        # Unexpected issues (DB down, etc.)
        db.session.rollback()
        current_app.logger.exception("Unexpected error during registration")
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Server error",
                    "data": None,
                }
            ),
            500,
        )
