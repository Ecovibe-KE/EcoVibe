from flask import Blueprint, request, jsonify
from server.models.user import db, User
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
import re

# Create the blueprint
bp = Blueprint('register', __name__)


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


@bp.route('/register', methods=['GET'])
def register_info():
    return jsonify({"message": "Send a POST with fullname, lastName, email, password, industry, phoneNumber."}), 200


@bp.route('/register', methods=['POST'])
def register_user():
    # Get the payload
    try:
        payload = request.get_json(force=True, silent=False)
    except Exception as e:
        return jsonify({"error": "Invalid JSON format", "details": str(e)}), 400

    if not isinstance(payload, dict):
        print("ERROR: Payload is not a dict")
        return jsonify({"error": "Payload must be a JSON object"}), 400

    
    full_name = str(payload.get("fullname", "")).strip()
    email_raw = str(payload.get("email", "")).strip()
    password = payload.get("password")
    industry = str(payload.get("industry", "")).strip()
    phone_number = str(payload.get("phoneNumber", "")).strip()


    if not full_name:
        print("ERROR: fullname is empty")
        return jsonify({"error": "fullname cannot be empty"}), 400
    if not industry:
        print("ERROR: industry is empty")
        return jsonify({"error": "industry cannot be empty"}), 400
    if not phone_number:
        print("ERROR: phoneNumber is empty")
        return jsonify({"error": "phoneNumber cannot be empty"}), 400

    email = email_raw.lower()
    
    if not _is_valid_password(password):
        print(f"ERROR: Password validation failed")
        return jsonify({"error": "Password must be at least 8 characters with uppercase and digit"}), 400

    try:
        user = User(
            full_name= full_name,
            email=email,
            industry=industry,
            phone_number=phone_number,
        )
        print("User object created successfully")
        
        print("Setting password...")
        user.set_password(password)

    except ValueError as e:
        return {"error": str(e)}, 400
    except IntegrityError:
        db.session.rollback()
        return {"error": "Email or phone number already exists."}, 400
    except Exception as e:
        db.session.rollback()
        return {"error": "Unexpected error."}, 500
        
    except Exception as e:
        print(f"ERROR: Failed to create User object or set password: {e}")
        return jsonify({"error": "User creation failed", "details": str(e)}), 500
    
    db.session.add(user)
        
    db.session.commit()
        
    return jsonify({"message": "Account created successfully."}), 201