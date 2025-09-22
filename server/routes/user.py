from flask import Blueprint, request, jsonify, current_app
from models import db
from models.user import User
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
import re

# Create the blueprint
user_bp = Blueprint("user", __name__)


# Helper function to validate password
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
    """
    Register a new user from JSON payload and persist to the database.

    Validates required fields (full_name, industry, phone_number), normalizes
    email to lowercase, enforces password policy, checks uniqueness of email
    (case-insensitive) and phone number, creates the User record, and commits
    it to the database.

    Returns:
        A Flask response tuple (JSON, status_code):
          - 201: Account created successfully.
          - 400: Invalid/missing JSON payload, validation failures, or a
                 ValueError raised during user creation.
          - 409: Email or phone number already exists.
          - 500: Database integrity error (detailed error logged on server).
    """
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"error": "Invalid JSON format"}), 400

    full_name = str(payload.get("full_name", "")).strip()
    email_raw = str(payload.get("email", "")).strip()
    password = payload.get("password")
    industry = str(payload.get("industry", "")).strip()
    phone_number = str(payload.get("phone_number", "")).strip()

    # --- Validation ---
    if not full_name:
        return jsonify({"error": "full_name cannot be empty"}), 400
    if not industry:
        return jsonify({"error": "industry cannot be empty"}), 400
    if not phone_number:
        return jsonify({"error": "phone_number cannot be empty"}), 400

    email = email_raw.lower()

    if not _is_valid_password(password):
        return (
            jsonify(
                {
                    "error": (
                        "Password must have at least 8 chars, "
                        "one uppercase, one digit."
                    )
                }
            ),
            400,
        )

    # --- Uniqueness checks ---
    if db.session.query(User).filter(func.lower(User.email) == email).first():
        return jsonify({"error": f"Email '{email}' already exists."}), 409

    if db.session.query(User).filter(User.phone_number == phone_number).first():
        return jsonify({"error": f"Phone '{phone_number}' already exists."}), 409

    try:
        user = User(
            full_name=full_name,
            email=email,
            industry=industry,
            phone_number=phone_number,
        )
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        return jsonify({"message": "Account created successfully."}), 201

    except ValueError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    except IntegrityError as e:
        db.session.rollback()
        # Log the actual DB constraint that failed
        current_app.logger.error(f"IntegrityError: {e}")
        return (
            jsonify({"error": "Database integrity error. Check server logs."}),
            500,
        )
