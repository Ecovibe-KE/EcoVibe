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
        #print(f"Received payload: {payload}")  # Debug
    except Exception as e:
        #print(f"JSON parsing error: {e}")  # Debug
        return jsonify({"error": "Invalid JSON format", "details": str(e)}), 400

    #print("Checking payload type...")
    if not isinstance(payload, dict):
        print("ERROR: Payload is not a dict")
        return jsonify({"error": "Payload must be a JSON object"}), 400

    #print("Checking required fields...")
    required_fields = ["fullname", "email", "password", "industry", "phoneNumber"]
    missing_fields = [field for field in required_fields if field not in payload]
    if missing_fields:
        print(f"ERROR: Missing fields: {missing_fields}")
        return jsonify({"error": "Missing required fields", "missing": missing_fields}), 400

    #print("Processing fields...")
    full_name = str(payload.get("fullname", "")).strip()
    email_raw = str(payload.get("email", "")).strip()
    password = payload.get("password")
    industry = str(payload.get("industry", "")).strip()
    phone_number = str(payload.get("phoneNumber", "")).strip()


    print("Validating fields...")
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
    if not 
        return jsonify({"error": "Invalid email format"}), 400

    print(f"Validating password...")
    if not _is_valid_password(password):
        print(f"ERROR: Password validation failed")
        return jsonify({"error": "Password must be at least 8 characters with uppercase and digit"}), 400

    print("All field validations passed!")
    print("Checking for existing user...")

    # Pre-check email uniqueness (case-insensitive)
    try:
        existing = (
            db.session.query(User.id)
            .filter(func.lower(User.email) == email)
            .first()
        )
        if existing:
            print(f"ERROR: Email already exists: {email}")
            return jsonify({"error": "Email already exists."}), 409
        print("No existing user found with this email")
    except Exception as e:
        print(f"ERROR: Database query failed: {e}")
        return jsonify({"error": "Database query error", "details": str(e)}), 500

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
        print("Password set successfully")
        
    except Exception as e:
        print(f"ERROR: Failed to create User object or set password: {e}")
        return jsonify({"error": "User creation failed", "details": str(e)}), 500
    
    db.session.add(user)
        
    db.session.commit()
        
    return jsonify({"message": "Account created successfully."}), 201