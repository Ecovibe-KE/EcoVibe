import os
import secrets
import string
import threading
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import jwt_required, get_jwt_identity
from email_validator import validate_email, EmailNotValidError

from models import db
from models.user import User, Role, AccountStatus
from utils.mail_templates import send_invitation_email

user_management_bp = Blueprint("user_management", __name__)


def require_role(required_roles):
    """Decorator to require specific roles for endpoint access"""

    def decorator(f):
        @jwt_required()
        def decorated_function(*args, **kwargs):
            current_user_id = get_jwt_identity()
            current_user = User.query.get(current_user_id)

            if not current_user:
                return jsonify({"status": "error", "message": "User not found"}), 404

            if current_user.role not in required_roles:
                return jsonify({"status": "error", "message": "Insufficient permissions"}), 403

            return f(*args, **kwargs, current_user=current_user)

        # Rename the function to avoid endpoint conflicts
        decorated_function.__name__ = f.__name__
        return decorated_function

    return decorator


def _validate_user_data(payload, is_update=False):
    """Validate user data for create/update operations"""
    errors = {}

    # Full name validation
    full_name = str(payload.get("full_name", "")).strip()
    if not full_name and not is_update:
        errors["full_name"] = "Full name is required"
    elif full_name and len(full_name) < 2:
        errors["full_name"] = "Full name must be at least 2 characters"

    # Email validation
    email_raw = str(payload.get("email", "")).strip().lower()
    if not email_raw and not is_update:
        errors["email"] = "Email is required"
    elif email_raw:
        try:
            email = validate_email(email_raw).email.lower()
        except EmailNotValidError:
            errors["email"] = "Invalid email format"

    # Phone validation
    phone_number = str(payload.get("phone_number", "")).strip()
    if not phone_number and not is_update:
        errors["phone_number"] = "Phone number is required"
    elif phone_number and len(phone_number) < 10:
        errors["phone_number"] = "Phone number must be at least 10 digits"

    # Role validation
    role = payload.get("role")
    if role and role not in [r.value for r in Role]:
        errors["role"] = f"Role must be one of: {[r.value for r in Role]}"

    return errors, {
        "full_name": full_name,
        "email": email if 'email' in locals() else email_raw,
        "phone_number": phone_number,
        "role": Role(role) if role else None,
        "industry": str(payload.get("industry", "")).strip()
    }


@user_management_bp.route("/users", methods=["GET"])
@require_role([Role.ADMIN, Role.SUPER_ADMIN])
def get_users(current_user):
    """Get paginated list of users with filtering"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        role_filter = request.args.get("role")
        status_filter = request.args.get("status")
        search = request.args.get("search", "").strip()

        # Build query
        query = User.query

        # Apply filters
        if role_filter:
            query = query.filter(User.role == Role(role_filter))
        if status_filter:
            query = query.filter(User.account_status == AccountStatus(status_filter))
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                db.or_(
                    User.full_name.ilike(search_term),
                    User.email.ilike(search_term),
                    User.phone_number.ilike(search_term)
                )
            )

        # Paginate results
        users_pagination = query.order_by(User.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        users_data = []
        for user in users_pagination.items:
            user_data = user.to_safe_dict(
                include_email=True,
                include_phone=True,
                include_role=True
            )
            # Hide sensitive information from non-superadmins
            if current_user.role != Role.SUPER_ADMIN:
                user_data.pop("email", None)
                user_data.pop("phone_number", None)
            users_data.append(user_data)

        return jsonify({
            "status": "success",
            "data": {
                "users": users_data,
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "total": users_pagination.total,
                    "pages": users_pagination.pages
                }
            }
        }), 200

    except Exception as e:
        current_app.logger.exception("Error fetching users")
        return jsonify({"status": "error", "message": "Server error"}), 500


@user_management_bp.route("/users", methods=["POST"])
@require_role([Role.ADMIN, Role.SUPER_ADMIN])
def create_user(current_user):
    """Create a new user (Admin functionality)"""
    payload = request.get_json(silent=True)

    if payload is None:
        return jsonify({"status": "error", "message": "Invalid JSON format"}), 400

    # Validate input data
    errors, validated_data = _validate_user_data(payload)
    if errors:
        return jsonify({
            "status": "error",
            "message": "Validation failed",
            "errors": errors
        }), 400

    try:
        # Check for duplicates
        if User.query.filter_by(email=validated_data["email"]).first():
            return jsonify({
                "status": "error",
                "message": "Email already exists"
            }), 409

        if User.query.filter_by(phone_number=validated_data["phone_number"]).first():
            return jsonify({
                "status": "error",
                "message": "Phone number already exists"
            }), 409

        # Prevent creating users with higher role than current user
        requested_role = validated_data["role"] or Role.CLIENT
        if (current_user.role == Role.ADMIN and
                requested_role in [Role.SUPER_ADMIN, Role.ADMIN]):
            return jsonify({
                "status": "error",
                "message": "Cannot create users with admin or SUPER_ADMIN role"
            }), 403

        # Create user
        user = User(
            full_name=validated_data["full_name"],
            email=validated_data["email"],
            phone_number=validated_data["phone_number"],
            industry=validated_data["industry"],
            role=requested_role,
            account_status=AccountStatus.INACTIVE
        )

        # Generate temporary password (user will reset it)
        temp_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
        user.set_password(temp_password)

        db.session.add(user)
        db.session.commit()

        # Send invitation email
        frontend_url = os.getenv("VITE_FRONTEND_URL", "http://localhost:5173")
        invitation_link = f"{frontend_url}/set-password?user_id={user.id}"

        threading.Thread(
            target=send_invitation_email,
            args=(user.email, user.full_name, invitation_link, current_user.full_name),
            daemon=True
        ).start()

        return jsonify({
            "status": "success",
            "message": "User created successfully. Invitation email sent.",
            "data": user.to_safe_dict(include_email=True, include_phone=True, include_role=True)
        }), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "Email or phone number already exists"
        }), 409
    except Exception as e:
        db.session.rollback()
        current_app.logger.exception("Error creating user")
        return jsonify({"status": "error", "message": "Server error"}), 500


@user_management_bp.route("/users/<int:user_id>", methods=["PUT"])
@require_role([Role.ADMIN, Role.SUPER_ADMIN])
def update_user(current_user, user_id):
    """Update user information"""
    payload = request.get_json(silent=True)

    if payload is None:
        return jsonify({"status": "error", "message": "Invalid JSON format"}), 400

    try:
        user = User.query.get_or_404(user_id)

        # Check permissions
        if (current_user.role == Role.ADMIN and
                user.role in [Role.SUPER_ADMIN, Role.ADMIN]):
            return jsonify({
                "status": "error",
                "message": "Cannot modify other admin users"
            }), 403

        errors, validated_data = _validate_user_data(payload, is_update=True)
        if errors:
            return jsonify({
                "status": "error",
                "message": "Validation failed",
                "errors": errors
            }), 400

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

        return jsonify({
            "status": "success",
            "message": "User updated successfully",
            "data": user.to_safe_dict(include_email=True, include_phone=True, include_role=True)
        }), 200

    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "Email or phone number already exists"
        }), 409
    except Exception as e:
        db.session.rollback()
        current_app.logger.exception("Error updating user")
        return jsonify({"status": "error", "message": "Server error"}), 500


@user_management_bp.route("/users/<int:user_id>/status", methods=["PATCH"])
@require_role([Role.ADMIN, Role.SUPER_ADMIN])
def update_user_status(current_user, user_id):
    """Activate/deactivate user account"""
    payload = request.get_json(silent=True)
    status = payload.get("status") if payload else None

    if status not in [s.value for s in AccountStatus]:
        return jsonify({
            "status": "error",
            "message": f"Status must be one of: {[s.value for s in AccountStatus]}"
        }), 400

    try:
        user = User.query.get_or_404(user_id)

        # Check permissions
        if (current_user.role == Role.ADMIN and
                user.role in [Role.SUPER_ADMIN, Role.ADMIN]):
            return jsonify({
                "status": "error",
                "message": "Cannot modify other admin users"
            }), 403

        user.account_status = AccountStatus(status)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": f"User account {status} successfully",
            "data": user.to_safe_dict(include_role=True)
        }), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.exception("Error updating user status")
        return jsonify({"status": "error", "message": "Server error"}), 500


@user_management_bp.route("/users/<int:user_id>", methods=["DELETE"])
@require_role([Role.SUPER_ADMIN])
def delete_user(current_user, user_id):
    """Delete a user (only for SUPER_ADMIN)"""
    try:
        if current_user.id == user_id:
            return jsonify({
                "status": "error",
                "message": "Cannot delete your own account"
            }), 400

        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "User deleted successfully"
        }), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.exception("Error deleting user")
        return jsonify({"status": "error", "message": "Server error"}), 500