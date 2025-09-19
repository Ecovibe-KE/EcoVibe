from flask import Blueprint, request, jsonify
from server.models.user import db, User
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
import re

# Create the blueprint
user_bp = Blueprint('user', __name__)


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


@user_bp.route('/register', methods=['POST'])
def register_user():
    try:
        payload = request.get_json(force=True, silent=False)
    except Exception as e:
        return jsonify({"error": "Invalid JSON format", "details": str(e)}), 400


    full_name = str(payload.get("full_name", "")).strip()
    email_raw = str(payload.get("email", "")).strip()
    password = payload.get("password")
    industry = str(payload.get("industry", "")).strip()
    phone_number = str(payload.get("phone_number", "")).strip()


    if not full_name:
        print("ERROR: full_name is empty")
        return jsonify({"error": "full_name cannot be empty"}), 400
    if not industry:
        print("ERROR: industry is empty")
        return jsonify({"error": "industry cannot be empty"}), 400
    if not phone_number:
        print("ERROR: phone_number is empty")
        return jsonify({"error": "phone_number cannot be empty"}), 400

    email = email_raw.lower()
    
    if not _is_valid_password(password):
        return jsonify({"error": "Password must be at least 8 characters with uppercase and digit"}), 400

    try:
        user = User(
            full_name= full_name,
            email=email,
            industry=industry,
            phone_number=phone_number,
        )
        
        user.set_password(password)

        db.session.add(user)
        
        db.session.commit()
        
        return jsonify({"message": "Account created successfully."}), 201

    except ValueError as e:
        return {"error": str(e)}, 400
    except IntegrityError:
        db.session.rollback()
        return {"error": "Email or phone number already exists."}, 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "User creation failed", "details": str(e)}), 500
         
    
