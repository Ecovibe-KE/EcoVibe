from flask import request
from flask_restful import Resource
from ..models.user import db, User
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
import re

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

# Helper function to validate password
def _is_valid_password(password: str) -> bool:
    if not isinstance(password, str):
        return False
    if len(password) < 8:
        return False
    if not any(ch.isupper() for ch in password):
        return False
    if not any(ch.isdigit() for ch in password):
        return False
    return True


class Register(Resource):
    def get(self):
        return {"message": "Send a POST with firstName, lastName, email, password, industry, phoneNumber."}, 200

    def post(self):
        # Get the payload
        try:
            payload = request.get_json(force=True, silent=False)
        except Exception:
            return {"error": "Invalid input."}, 400

        required_fields = ["firstName", "lastName", "email", "password", "industry", "phoneNumber"]
        if not isinstance(payload, dict) or any(field not in payload for field in required_fields):
            return {"error": "Invalid input."}, 400

        first_name = str(payload.get("firstName", "")).strip()
        last_name = str(payload.get("lastName", "")).strip()
        email_raw = str(payload.get("email", "")).strip()
        password = payload.get("password")
        industry = str(payload.get("industry", "")).strip()
        phone_number = str(payload.get("phoneNumber", "")).strip()

        if not first_name or not last_name or not industry or not phone_number:
            return {"error": "Invalid input."}, 400

        email = email_raw.lower()
        if not EMAIL_REGEX.match(email):
            return {"error": "Invalid input."}, 400

        if not _is_valid_password(password):
            return {"error": "Invalid input."}, 400

        # Pre-check email uniqueness (case-insensitive)
        existing = (
            db.session.query(User.id)
            .filter(func.lower(User.email) == email)
            .first()
        )
        if existing:
            return {"error": "Email already exists."}, 409

        user = User(
            full_name=f"{first_name} {last_name}",
            email=email,
            industry=industry,
            phone_number=phone_number,
        )
        user.set_password(password)

        try:
            db.session.add(user)
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return {"error": "Email already exists."}, 409
        except Exception:
            db.session.rollback()
            return {"error": "Invalid input."}, 400

        return {"message": "Account created successfully."}, 201