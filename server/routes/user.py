from flask import Blueprint, request, jsonify, current_app
from models import db
from models.user import User
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError

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
        return (
            jsonify(
                {"status": "error", "message": "Invalid JSON format", "data": None}
            ),
            400,
        )

    full_name = str(payload.get("full_name", "")).strip()
    email_raw = str(payload.get("email", "")).strip()
    password = payload.get("password")
    industry = str(payload.get("industry", "")).strip()
    phone_number = str(payload.get("phone_number", "")).strip()

    # --- Validation ---
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
                {"status": "error", "message": "industry cannot be empty", "data": None}
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

    email = email_raw.lower()

    if not _is_valid_password(password):
        return (
            jsonify(
                {
                    "status": "error",
                    "message": (
                        "Password must have at least 8 chars, "
                        "one uppercase, one digit."
                    ),
                    "data": None,
                }
            ),
            400,
        )

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

        return (
            jsonify(
                {
                    "status": "success",
                    "message": "Client registered successfully",
                    "data": user.to_safe_dict(include_email=True, include_phone=True),
                }
            ),
            201,
        )

    except ValueError as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e), "data": None}), 400
    except IntegrityError as e:
        db.session.rollback()
        # Log with traceback and map known UNIQUE violations to 409
        current_app.logger.exception("IntegrityError while registering user")

        constraint = getattr(getattr(e.orig, "diag", None), "constraint_name", "") or ""

        msg = (str(e.orig) or "").lower()

        if constraint in {"uq_user_email", "uq_user_phone_number"}:
            field = "Email" if "email" in constraint else "Phone number"
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": f"{field} already exists.",
                        "data": None,
                    }
                ),
                409,
            )

        if ("unique" in msg or "duplicate" in msg) and "email" in msg:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Email already exists.",
                        "data": None,
                    }
                ),
                409,
            )

        if ("unique" in msg or "duplicate" in msg) and (
            "phone" in msg or "phone_number" in msg
        ):
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Phone number already exists.",
                        "data": None,
                    }
                ),
                409,
            )

        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Database integrity error. Check server logs.",
                    "data": None,
                }
            ),
            500,
        )
