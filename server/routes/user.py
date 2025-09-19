from flask import Blueprint, request, jsonify
from server.models.user import db, User
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
import re

# Create the blueprint
bp = Blueprint('register', __name__)

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


@bp.route('/register', methods=['GET'])
def register_info():
    return jsonify({"message": "Send a POST with firstName, lastName, email, password, industry, phoneNumber."}), 200


@bp.route('/register', methods=['POST'])
def register_user():
    #print("=== POST /api/register called ===")  # Debug
    #print(f"Request headers: {dict(request.headers)}")  # Debug
    #print(f"Content-Type: {request.content_type}")  # Debug
    #print(f"Raw data: {request.get_data()}")  # Debug
    
    # Get the payload
    try:
        payload = request.get_json(force=True, silent=False)
        #print(f"Received payload: {payload}")  # Debug
    except Exception as e:
        #print(f"JSON parsing error: {e}")  # Debug
        return jsonify({"error": "Invalid JSON format", "details": str(e)}), 400

    print("Checking payload type...")
    if not isinstance(payload, dict):
        print("ERROR: Payload is not a dict")
        return jsonify({"error": "Payload must be a JSON object"}), 400

    print("Checking required fields...")
    required_fields = ["firstName", "lastName", "email", "password", "industry", "phoneNumber"]
    missing_fields = [field for field in required_fields if field not in payload]
    if missing_fields:
        print(f"ERROR: Missing fields: {missing_fields}")
        return jsonify({"error": "Missing required fields", "missing": missing_fields}), 400

    print("Processing fields...")
    first_name = str(payload.get("firstName", "")).strip()
    last_name = str(payload.get("lastName", "")).strip()
    email_raw = str(payload.get("email", "")).strip()
    password = payload.get("password")
    industry = str(payload.get("industry", "")).strip()
    phone_number = str(payload.get("phoneNumber", "")).strip()

    print(f"Processed fields:")
    print(f"  firstName: '{first_name}'")
    print(f"  lastName: '{last_name}'")
    print(f"  email: '{email_raw}'")
    print(f"  password: '{password}' (type: {type(password)})")
    print(f"  industry: '{industry}'")
    print(f"  phoneNumber: '{phone_number}'")

    print("Validating fields...")
    if not first_name:
        print("ERROR: firstName is empty")
        return jsonify({"error": "firstName cannot be empty"}), 400
    if not last_name:
        print("ERROR: lastName is empty")
        return jsonify({"error": "lastName cannot be empty"}), 400
    if not industry:
        print("ERROR: industry is empty")
        return jsonify({"error": "industry cannot be empty"}), 400
    if not phone_number:
        print("ERROR: phoneNumber is empty")
        return jsonify({"error": "phoneNumber cannot be empty"}), 400

    email = email_raw.lower()
    print(f"Validating email: {email}")
    if not EMAIL_REGEX.match(email):
        print(f"ERROR: Invalid email format")
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

    print("Creating User object...")
    try:
        user = User(
            full_name=f"{first_name} {last_name}",
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

    print("Saving to database...")
    try:
        db.session.add(user)
        print("User added to session")
        
        db.session.commit()
        print("Database commit successful!")
        
    except IntegrityError as e:
        db.session.rollback()
        print(f"ERROR: IntegrityError: {e}")
        return jsonify({"error": "Email already exists."}), 409
    except Exception as e:
        db.session.rollback()
        print(f"ERROR: Database save failed: {e}")
        print(f"Error type: {type(e)}")
        print(f"Error args: {e.args}")
        return jsonify({"error": "Database save failed", "details": str(e)}), 500

    print("SUCCESS: Account created successfully!")
    return jsonify({"message": "Account created successfully."}), 201