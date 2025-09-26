import os
import secrets
import string
import threading
from datetime import datetime, timedelta
from flask import Blueprint, request, current_app
from flask_restful import Api, Resource
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from email_validator import validate_email, EmailNotValidError
from sqlalchemy.exc import IntegrityError

from models import db
from models.user import User, Role, AccountStatus
from utils.mail_templates import send_invitation_email

user_management_bp = Blueprint("user_management", __name__)
api = Api(user_management_bp)


def require_role(required_roles):
    """Decorator to require specific roles for endpoint access"""

    def decorator(f):
        @jwt_required()
        def decorated_function(*args, **kwargs):
            current_user_id = get_jwt_identity()
            current_user = User.query.get(current_user_id)

            if not current_user:
                return {"status": "error", "message": "User not found"}, 404

            if current_user.role not in required_roles:
                return {"status": "error", "message": "Insufficient permissions"}, 403

            return f(*args, **kwargs, current_user=current_user)

        decorated_function.__name__ = f.__name__
        return decorated_function

    return decorator


class UserValidator:
    """Handles user data validation"""

    @staticmethod
    def validate_user_data(payload, is_update=False):
        errors = {}
        validated_data = {}

        # Full name validation
        full_name = str(payload.get("full_name", "")).strip()
        if not full_name and not is_update:
            errors["full_name"] = "Full name is required"
        elif full_name and len(full_name) < 2:
            errors["full_name"] = "Full name must be at least 2 characters"
        else:
            validated_data["full_name"] = full_name

        # Email validation
        email_raw = str(payload.get("email", "")).strip().lower()
        if not email_raw and not is_update:
            errors["email"] = "Email is required"
        elif email_raw:
            try:
                email = validate_email(email_raw).email.lower()
                validated_data["email"] = email
            except EmailNotValidError:
                errors["email"] = "Invalid email format"

        # Phone validation
        phone_number = str(payload.get("phone_number", "")).strip()
        if not phone_number and not is_update:
            errors["phone_number"] = "Phone number is required"
        elif phone_number and len(phone_number) < 10:
            errors["phone_number"] = "Phone number must be at least 10 digits"
        else:
            validated_data["phone_number"] = phone_number

        # Role validation
        role = payload.get("role")
        if role and role not in [r.value for r in Role]:
            errors["role"] = f"Role must be one of: {[r.value for r in Role]}"
        else:
            validated_data["role"] = Role(role) if role else None

        validated_data["industry"] = str(payload.get("industry", "")).strip()

        return errors, validated_data


class UserService:
    """Handles user-related business logic"""

    @staticmethod
    def generate_valid_password(length: int = 12) -> str:
        """Generate a secure password"""
        if length < 8:
            raise ValueError("Password length must be at least 8")

        uppercase_letters = string.ascii_uppercase
        digits = string.digits
        all_chars = string.ascii_letters + string.digits

        password_chars = [
            secrets.choice(uppercase_letters),
            secrets.choice(digits)
        ]

        remaining_length = length - 2
        password_chars.extend(secrets.choice(all_chars) for _ in range(remaining_length))
        secrets.SystemRandom().shuffle(password_chars)

        return ''.join(password_chars)

    @staticmethod
    def can_modify_user(current_user, target_user):
        """Check if current user can modify target user"""
        if current_user.role == Role.SUPER_ADMIN:
            return True
        if current_user.role == Role.ADMIN:
            return target_user.role not in [Role.SUPER_ADMIN, Role.ADMIN]
        return False

    @staticmethod
    def serialize_user(user):
        """Serialize user object to dictionary"""
        return {
            "id": user.id,
            "email": user.email,
            "name": user.full_name,
            "role": user.role.value,
            "phone": user.phone_number,
            "industry": user.industry,
            "status": user.account_status.value,
            "profileImage": user.profile_image_url,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "updatedAt": user.updated_at.isoformat() if user.updated_at else None
        }


class UserListResource(Resource):
    """Handles GET (list users) and POST (create user) operations"""

    @require_role([Role.ADMIN, Role.SUPER_ADMIN])
    def get(self, current_user):
        """Get list of users with role-based filtering"""
        try:
            query = User.query

            if current_user.role == Role.ADMIN:
                query = query.filter(User.role != Role.SUPER_ADMIN)

            users = query.all()
            users_data = [UserService.serialize_user(user) for user in users]

            return {
                "status": "success",
                "message": "Users retrieved successfully",
                "data": {"users": users_data}
            }, 200

        except Exception as e:
            current_app.logger.exception("Error fetching users")
            return {"status": "error", "message": "Server error"}, 500

    @require_role([Role.ADMIN, Role.SUPER_ADMIN])
    def post(self, current_user):
        """Create a new user"""
        payload = request.get_json(silent=True)

        if not payload:
            return {"status": "error", "message": "Invalid JSON format"}, 400

        errors, validated_data = UserValidator.validate_user_data(payload)
        if errors:
            return {
                "status": "error",
                "message": "Validation failed",
                "errors": errors
            }, 400

        try:
            # Check for duplicates
            if User.query.filter_by(email=validated_data["email"]).first():
                return {"status": "error", "message": "Email already exists"}, 409

            if User.query.filter_by(phone_number=validated_data["phone_number"]).first():
                return {"status": "error", "message": "Phone number already exists"}, 409

            # Check role permissions
            requested_role = validated_data["role"] or Role.CLIENT
            if (current_user.role == Role.ADMIN and
                    requested_role in [Role.SUPER_ADMIN, Role.ADMIN]):
                return {
                    "status": "error",
                    "message": "Cannot create users with admin or SUPER_ADMIN role"
                }, 403

            # Create user
            user = User(
                full_name=validated_data["full_name"],
                email=validated_data["email"],
                phone_number=validated_data["phone_number"],
                industry=validated_data["industry"],
                role=requested_role,
                account_status=AccountStatus.INACTIVE
            )

            temp_password = UserService.generate_valid_password(12)
            user.set_password(temp_password)
            db.session.add(user)
            db.session.commit()

            # Send invitation email
            verification_token = create_access_token(
                identity=str(user.id),
                expires_delta=timedelta(hours=24),
                additional_claims={"purpose": "account_verification"},
            )

            frontend_url = os.getenv("VITE_FRONTEND_URL", "http://localhost:5177")
            verify_link = f"{frontend_url}/verify?token={verification_token}"

            threading.Thread(
                target=send_invitation_email,
                args=(user.email, user.full_name, verify_link, current_user.full_name, temp_password),
                daemon=True
            ).start()

            return {
                "status": "success",
                "message": "User created successfully. Invitation email sent.",
                "data": UserService.serialize_user(user)
            }, 201

        except IntegrityError:
            db.session.rollback()
            return {"status": "error", "message": "Email or phone number already exists"}, 409
        except Exception as e:
            db.session.rollback()
            current_app.logger.exception("Error creating user")
            return {"status": "error", "message": "Server error"}, 500


class UserResource(Resource):
    """Handles GET, PATCH, and DELETE operations for individual users"""

    @require_role([Role.ADMIN, Role.SUPER_ADMIN])
    def get(self, user_id, current_user):
        """Get specific user details"""
        try:
            user = User.query.get(user_id)
            if not user:
                return {"status": "error", "message": "User not found"}, 404

            if not UserService.can_modify_user(current_user, user):
                return {"status": "error", "message": "Insufficient permissions"}, 403

            return {
                "status": "success",
                "message": "User retrieved successfully",
                "data": UserService.serialize_user(user)
            }, 200

        except Exception as e:
            current_app.logger.exception("Error fetching user")
            return {"status": "error", "message": "Server error"}, 500

    @require_role([Role.ADMIN, Role.SUPER_ADMIN])
    def patch(self, user_id, current_user):
        """Update user information"""
        payload = request.get_json(silent=True)

        if not payload:
            return {"status": "error", "message": "Invalid JSON format"}, 400

        try:
            user = User.query.get(user_id)
            if not user:
                return {"status": "error", "message": "User not found"}, 404

            if not UserService.can_modify_user(current_user, user):
                return {"status": "error", "message": "Cannot modify this user"}, 403

            errors, validated_data = UserValidator.validate_user_data(payload, is_update=True)
            if errors:
                return {
                    "status": "error",
                    "message": "Validation failed",
                    "errors": errors
                }, 400

            # Update fields if provided
            if validated_data["full_name"]:
                user.full_name = validated_data["full_name"]
            if validated_data["email"]:
                user.email = validated_data["email"]
            if validated_data["phone_number"]:
                user.phone_number = validated_data["phone_number"]
            if validated_data["industry"]:
                user.industry = validated_data["industry"]
            if validated_data["role"] and current_user.role == Role.SUPER_ADMIN:
                user.role = validated_data["role"]

            db.session.commit()

            return {
                "status": "success",
                "message": "User updated successfully",
                "data": UserService.serialize_user(user)
            }, 200

        except IntegrityError:
            db.session.rollback()
            return {"status": "error", "message": "Email or phone number already exists"}, 409
        except Exception as e:
            db.session.rollback()
            current_app.logger.exception("Error updating user")
            return {"status": "error", "message": "Server error"}, 500

    @require_role([Role.ADMIN, Role.SUPER_ADMIN])
    def delete(self, user_id, current_user):
        """Delete a user"""
        try:
            if current_user.id == user_id:
                return {"status": "error", "message": "Cannot delete your own account"}, 400

            user = User.query.get(user_id)
            if not user:
                return {"status": "error", "message": "User not found"}, 404

            if not UserService.can_modify_user(current_user, user):
                return {"status": "error", "message": "Cannot delete this user"}, 403

            db.session.delete(user)
            db.session.commit()

            return {"status": "success", "message": "User deleted successfully"}, 200

        except Exception as e:
            db.session.rollback()
            current_app.logger.exception("Error deleting user")
            return {"status": "error", "message": "Server error"}, 500


class UserStatusResource(Resource):
    """Handles user status updates"""

    @require_role([Role.ADMIN, Role.SUPER_ADMIN])
    def patch(self, user_id, current_user):
        """Activate/deactivate user account"""
        payload = request.get_json(silent=True)
        status = payload.get("status") if payload else None

        if status not in [s.value for s in AccountStatus]:
            return {
                "status": "error",
                "message": f"Status must be one of: {[s.value for s in AccountStatus]}"
            }, 400

        try:
            user = User.query.get(user_id)
            if not user:
                return {"status": "error", "message": "User not found"}, 404

            if not UserService.can_modify_user(current_user, user):
                return {"status": "error", "message": "Cannot modify this user"}, 403

            user.account_status = AccountStatus(status)
            db.session.commit()

            return {
                "status": "success",
                "message": f"User {status} successfully",
                "data": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.full_name,
                    "updatedAt": user.updated_at.isoformat() if user.updated_at else None
                }
            }, 200

        except Exception as e:
            db.session.rollback()
            current_app.logger.exception("Error updating user status")
            return {"status": "error", "message": "Server error"}, 500


# Register resources with API
api.add_resource(UserListResource, "/user-management")
api.add_resource(UserResource, "/user-management/<int:user_id>")
api.add_resource(UserStatusResource, "/user-management/<int:user_id>/status")