# routes/auth.py
import os
import threading
from datetime import datetime, timezone, timedelta

from flask import Blueprint, request, current_app, jsonify
from flask_restful import Api, Resource
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
    get_jwt,
    create_access_token,
)
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from email_validator import validate_email, EmailNotValidError

from models import db
from models.user import User, AccountStatus
from models.token import Token
from utils.token import create_refresh_token_for_user
from utils.mail_templates import send_reset_email, send_verification_email
from utils.password import _is_valid_password


# Blueprint for auth endpoints
auth_bp = Blueprint("auth", __name__)
api = Api(auth_bp)


class RegisterResource(Resource):
    """Handle POST /register"""

    def post(self):
        payload = request.get_json(silent=True)

        # Reject if body is missing or malformed JSON
        if payload is None:
            return {
                "status": "error",
                "message": "Invalid JSON format",
                "data": None,
            }, 400

        # Extract + sanitize fields
        full_name = str(payload.get("full_name", "")).strip()
        email_raw = str(payload.get("email", "")).strip()
        password = payload.get("password")
        industry = str(payload.get("industry", "")).strip()
        phone_number = str(payload.get("phone_number", "")).strip()

        # Validate required fields
        if not full_name:
            return {
                "status": "error",
                "message": "full_name cannot be empty",
                "data": None,
            }, 400
        if not industry:
            return {
                "status": "error",
                "message": "industry cannot be empty",
                "data": None,
            }, 400
        if not phone_number:
            return {
                "status": "error",
                "message": "phone_number cannot be empty",
                "data": None,
            }, 400

        # Validate password strength
        if not _is_valid_password(password):
            return {
                "status": "error",
                "message": "Password must have at least 8 chars, "
                "one uppercase, one digit.",
                "data": None,
            }, 400

        # Validate email format
        try:
            email = validate_email(email_raw).email.lower()
        except EmailNotValidError:
            return {
                "status": "error",
                "message": "The email address is not valid.",
                "data": None,
            }, 400

        try:
            # Check duplicates
            if User.query.filter_by(email=email).first():
                return {
                    "status": "error",
                    "message": "Email already exists",
                    "data": None,
                }, 409
            if User.query.filter_by(phone_number=phone_number).first():
                return {
                    "status": "error",
                    "message": "Phone number already exists",
                    "data": None,
                }, 409

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

            # Create JWT verification token
            verification_token = create_access_token(
                identity=str(user.id),
                expires_delta=timedelta(hours=24),
                additional_claims={"purpose": "account_verification"},
            )

            frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
            verify_link = (
                f"{frontend_url}/verify?token={verification_token}&email={user.email}"
            )

            # Send email asynchronously
            threading.Thread(
                target=send_verification_email,
                args=(user.email, user.full_name, verify_link),
                daemon=True,
            ).start()

            return {
                "status": "success",
                "message": "Registration successful. "
                "Please check your email to verify your account.",
                "data": user.to_safe_dict(include_email=True, include_phone=True),
            }, 201

        except ValueError as e:
            db.session.rollback()
            return {"status": "error", "message": str(e), "data": None}, 400
        except IntegrityError as e:
            db.session.rollback()
            current_app.logger.exception("IntegrityError while registering user")

            constraint = getattr(getattr(e.orig, "diag", None), "constraint_name", "")
            error_messages = {
                "uq_user_email": "Email already exists",
                "uq_user_phone_number": "Phone number already exists",
            }
            if constraint in error_messages:
                return {
                    "status": "error",
                    "message": error_messages[constraint],
                    "data": None,
                }, 409

            return {"status": "error", "message": str(e), "data": None}, 400
        except IntegrityError:
            db.session.rollback()
            return {
                "status": "error",
                "message": "Email or phone number already exists.",
                "data": None,
            }, 409
        except Exception:
            db.session.rollback()
            current_app.logger.exception("Unexpected error during registration")
            return {"status": "error", "message": "Server error", "data": None}, 500


class VerifyResource(Resource):
    """Confirm account verification token and activate user."""

    @jwt_required()
    def post(self):
        try:
            user_id = int(get_jwt_identity())
            claims = get_jwt()
        except Exception:
            print("error Exception")
            return {
                "status": "error",
                "message": "Invalid or expired token",
                "data": None,
            }, 401

        if claims.get("purpose") != "account_verification":

            print("error account_verification")
            return {
                "status": "error",
                "message": "Invalid token purpose",
                "data": None,
            }, 400

        user = User.query.get(user_id)
        if not user:
            print("error User not found")
            return {
                "status": "error",
                "message": "User not found",
                "data": None,
            }, 404

        if user.account_status == AccountStatus.ACTIVE:
            return {
                "status": "success",
                "message": "Account already verified",
                "data": {},
            }, 200

        user.account_status = AccountStatus.ACTIVE
        db.session.commit()

        return {
            "status": "success",
            "message": "Account verified successfully",
            "data": {},
        }, 200


class LoginResource(Resource):
    """Authenticate credentials and return access + refresh tokens."""

    def post(self):
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip().lower()
        password = data.get("password")

        if not email or not password:
            return {
                "status": "error",
                "message": "Email and password are required",
                "data": None,
            }, 400

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return {
                "status": "error",
                "message": "Invalid credentials",
                "data": None,
            }, 401

        if user.account_status != AccountStatus.ACTIVE:
            return {
                "status": "error",
                "message": f"Account is {user.account_status.value}",
                "data": None,
            }, 403

        try:
            Token.query.filter_by(user_id=user.id).delete()
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {
                "status": "error",
                "message": "Server error",
                "data": None,
            }, 500

        refresh_token = create_refresh_token_for_user(user)
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={"purpose": "auth"},
        )

        user_data = {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "industry": user.industry,
            "phone_number": user.phone_number,
            "role": user.role.value,
            "account_status": user.account_status.value,
        }

        return {
            "status": "success",
            "message": "Login successful",
            "data": {
                "user": user_data,
                "access_token": access_token,
                "refresh_token": refresh_token,
            },
        }, 200


class RefreshResource(Resource):
    """Swap a valid refresh token for a new access token."""

    def post(self):
        data = request.get_json(silent=True) or {}
        token_value = data.get("refresh_token")

        if not token_value:
            return {
                "status": "error",
                "message": "Refresh token is required",
                "data": None,
            }, 400

        token = Token.query.filter_by(value=token_value).first()
        now = datetime.now(timezone.utc)
        if not token or not token.expiry_time or token.expiry_time <= now:
            return {
                "status": "error",
                "message": "Invalid or expired refresh token",
                "data": None,
            }, 401

        user = User.query.get(token.user_id)
        if not user:
            return {
                "status": "error",
                "message": "User not found",
                "data": None,
            }, 404

        new_access_token = create_access_token(
            identity=str(user.id),
            additional_claims={"purpose": "auth"},
        )

        return {
            "status": "success",
            "message": "Access token refreshed",
            "data": {
                "access_token": new_access_token,
                "user": user.to_safe_dict(include_email=True, include_phone=True),
            },
        }, 200


class LogoutResource(Resource):
    """Invalidate a refresh token."""

    def post(self):
        data = request.get_json(silent=True) or {}
        token_value = data.get("refresh_token")

        if not token_value:
            return {
                "status": "error",
                "message": "Refresh token is required",
                "data": None,
            }, 400

        token = Token.query.filter_by(value=token_value).first()
        if not token:
            return {
                "status": "error",
                "message": "Invalid refresh token",
                "data": None,
            }, 401

        try:
            db.session.delete(token)
            db.session.commit()
            return {
                "status": "success",
                "message": "Logged out successfully",
                "data": {},
            }, 200
        except Exception:
            db.session.rollback()
            return {
                "status": "error",
                "message": "Server error, logout failed",
                "data": None,
            }, 500


class MeResource(Resource):
    """Return or update the current logged-in user's profile."""

    @jwt_required()
    def get(self):
        claims = get_jwt()
        if claims.get("purpose") != "auth":
            return {
                "status": "error",
                "message": "Invalid token purpose",
                "data": None,
            }, 401

        uid = int(get_jwt_identity())
        user = User.query.get_or_404(uid)

        return {
            "status": "success",
            "message": "Details retrieved successfully",
            "data": {
                "id": user.id,
                "industry": user.industry,
                "full_name": user.full_name,
                "email": user.email,
                "phone_number": user.phone_number,
                "role": user.role.value if user.role else None,
                "profile_image_url": user.profile_image_url,
                "account_status": (
                    user.account_status.value if user.account_status else None
                ),
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "updated_at": user.updated_at.isoformat() if user.updated_at else None,
            },
        }, 200

    @jwt_required()
    def put(self):
        claims = get_jwt()
        if claims.get("purpose") != "auth":
            return {
                "status": "error",
                "message": "Invalid token purpose",
                "data": None,
            }, 401

        uid = int(get_jwt_identity())
        user = User.query.get_or_404(uid)
        data = request.get_json() or {}

        try:
            if "full_name" in data:
                user.full_name = data["full_name"]
            if "industry" in data:
                user.industry = data["industry"]
            if "phone_number" in data:
                user.phone_number = data["phone_number"]
            if "profile_image_url" in data:
                user.profile_image_url = data["profile_image_url"]

            db.session.commit()

            return {
                "status": "success",
                "message": "Profile updated successfully",
                "data": {
                    "id": user.id,
                    "full_name": user.full_name,
                    "email": user.email,
                    "industry": user.industry,
                    "phone_number": user.phone_number,
                    "role": user.role.value if user.role else None,
                    "profile_image_url": user.profile_image_url,
                },
            }, 200

        except ValueError as exc:
            db.session.rollback()
            return {
                "status": "error",
                "message": str(exc),
                "data": None,
            }, 400

        except SQLAlchemyError:
            db.session.rollback()
            return {
                "status": "error",
                "message": "Server error. Please try again later.",
                "data": None,
            }, 500


class ForgotPasswordResource(Resource):
    """Send a reset link to the given email (always respond the same)."""

    def post(self):
        data = request.get_json(silent=True) or {}
        email_raw = (data.get("email") or "").strip().lower()

        if not email_raw:
            return {
                "status": "error",
                "message": "Email is required",
                "data": None,
            }, 400

        user = User.query.filter_by(email=email_raw).first()

        if not user:
            return {
                "status": "success",
                "message": ("If this email is registered, a reset link has been sent"),
                "data": None,
            }, 200

        try:
            reset_token = create_access_token(
                identity=str(user.id),
                expires_delta=timedelta(minutes=30),
                additional_claims={"purpose": "password_reset"},
            )

            frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
            reset_link = f"{frontend_url}/reset-password?token={reset_token}"

            threading.Thread(
                target=send_reset_email,
                args=(user.email, user.full_name, reset_link),
                daemon=True,
            ).start()

            return {
                "status": "success",
                "message": "If this email is registered, a reset link has been sent",
                "data": {},
            }, 200

        except Exception:
            current_app.logger.exception("Error sending reset email")
            return {
                "status": "error",
                "message": "Server error. Please try again later.",
                "data": None,
            }, 500


class ResetPasswordResource(Resource):
    """Set a new password after verifying reset token."""

    @jwt_required()
    def post(self):
        claims = get_jwt()
        if claims.get("purpose") != "password_reset":
            return {
                "status": "error",
                "message": "Invalid token purpose",
                "data": None,
            }, 400

        uid = int(get_jwt_identity())
        user = User.query.get(uid)
        if not user:
            return {
                "status": "error",
                "message": "User not found",
                "data": None,
            }, 404

        data = request.get_json(silent=True) or {}
        new_password = data.get("new_password")

        if not new_password:
            return {
                "status": "error",
                "message": "New password is required",
                "data": None,
            }, 400

        if not _is_valid_password(new_password):
            return {
                "status": "error",
                "message": (
                    "Password must have at least 8 characters, "
                    "one uppercase letter, and one digit."
                ),
                "data": None,
            }, 400

        try:
            Token.query.filter_by(user_id=user.id).delete()
            user.set_password(new_password)
            db.session.commit()

            return {
                "status": "success",
                "message": "Password reset successful",
                "data": {},
            }, 200

        except Exception:
            db.session.rollback()
            return {
                "status": "error",
                "message": "Server error. Please try again later.",
                "data": None,
            }, 500


class ChangePasswordResource(Resource):
    """Change password for logged-in user."""

    @jwt_required()
    def post(self):
        claims = get_jwt()
        if claims.get("purpose") != "auth":
            return {
                "status": "error",
                "message": "Invalid token purpose",
                "data": None,
            }, 401

        uid = int(get_jwt_identity())
        user = User.query.get(uid)
        if not user:
            return {
                "status": "error",
                "message": "User not found",
                "data": None,
            }, 404

        data = request.get_json(silent=True) or {}
        current_password = data.get("current_password")
        new_password = data.get("new_password")

        if not current_password or not new_password:
            return {
                "status": "error",
                "message": "Current and new password are required",
                "data": None,
            }, 400

        if not user.check_password(current_password):
            return {
                "status": "error",
                "message": "Current password is incorrect",
                "data": None,
            }, 401

        if not _is_valid_password(new_password):
            return {
                "status": "error",
                "message": (
                    "Password must have at least 8 characters, "
                    "one uppercase letter, and one digit."
                ),
                "data": None,
            }, 400

        try:
            Token.query.filter_by(user_id=user.id).delete()
            user.set_password(new_password)
            db.session.commit()

            return {
                "status": "success",
                "message": "Password changed successfully",
                "data": {},
            }, 200

        except Exception:
            db.session.rollback()
            return {
                "status": "error",
                "message": "Server error. Please try again later.",
                "data": None,
            }, 500


class ResendVerificationResource(Resource):
    """Resend the account verification link if account is not active."""

    def post(self):
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip().lower()

        if not email:
            return {
                "status": "error",
                "message": "Email is required",
                "data": None,
            }, 400

        user = User.query.filter_by(email=email).first()

        # Always return success response to avoid leaking user status
        if not user or user.account_status == AccountStatus.ACTIVE:
            return {
                "status": "success",
                "message": (
                    "If this account is not verified,an activation link will be sent."
                ),
                "data": {},
            }, 200

        try:
            verify_token = create_access_token(
                identity=str(user.id),
                expires_delta=timedelta(hours=24),
                additional_claims={"purpose": "account_verification"},
            )

            frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
            verify_link = (
                f"{frontend_url}/verify?token={verify_token}&email={user.email}"
            )

            threading.Thread(
                target=send_verification_email,
                args=(user.email, user.full_name, verify_link),
                daemon=True,
            ).start()

            return {
                "status": "success",
                "message": (
                    "If this account is not verified, an activation link will be sent."
                ),
                "data": {},
            }, 200

        except Exception:
            current_app.logger.exception("Error sending verification email")
            return {
                "status": "error",
                "message": "Server error. Please try again later.",
                "data": None,
            }, 500


# Register routes on blueprint
api.add_resource(RegisterResource, "/register")
api.add_resource(VerifyResource, "/verify")
api.add_resource(LoginResource, "/login")
api.add_resource(LogoutResource, "/logout")
api.add_resource(RefreshResource, "/refresh")
api.add_resource(MeResource, "/me")
api.add_resource(ForgotPasswordResource, "/forgot-password")
api.add_resource(ResetPasswordResource, "/reset-password")
api.add_resource(ChangePasswordResource, "/change-password")
api.add_resource(ResendVerificationResource, "/resend-verification")
