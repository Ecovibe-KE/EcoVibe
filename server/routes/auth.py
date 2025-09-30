# routes/auth.py

import os
import threading
from datetime import datetime, timezone, timedelta
from flask import Blueprint, request, current_app
from flask_restful import Api, Resource
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
    get_jwt,
    create_access_token,
)
from sqlalchemy.exc import SQLAlchemyError
from models import db
from models.user import User, AccountStatus
from models.token import Token
from utils.token import create_refresh_token_for_user
from utils.mail_templates import send_reset_email
from utils.password import _is_valid_password
from utils.mail_templates import send_verification_email


# Blueprint for auth endpoints
auth_bp = Blueprint("auth", __name__)
api = Api(auth_bp)


class VerifyResource(Resource):
    """Confirm account verification token and activate user."""

    @jwt_required()
    def post(self):
        try:
            user_id = int(get_jwt_identity())
            claims = get_jwt()
        except Exception:
            return {
                "status": "error",
                "message": "Invalid or expired token",
                "data": None,
            }, 401

        if claims.get("purpose") != "account_verification":
            return {
                "status": "error",
                "message": "Invalid token purpose",
                "data": None,
            }, 400

        user = User.query.get(user_id)
        if not user:
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

        new_access_token = create_access_token(identity=str(user.id))

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

            frontend_url = os.getenv("VITE_SERVER_BASE_URL", "http://localhost:5173")
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
                    "If this account is not verified, an activation link will be sent."
                ),
                "data": {},
            }, 200

        try:
            verify_token = create_access_token(
                identity=str(user.id),
                expires_delta=timedelta(hours=24),
                additional_claims={"purpose": "account_verification"},
            )

            frontend_url = os.getenv("VITE_SERVER_BASE_URL", "http://localhost:5173")
            verify_link = f"{frontend_url}/verify-account?token={verify_token}"

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


# register routes on blueprint
api.add_resource(VerifyResource, "/verify")
api.add_resource(LoginResource, "/login")
api.add_resource(LogoutResource, "/logout")
api.add_resource(RefreshResource, "/refresh")
api.add_resource(MeResource, "/me")
api.add_resource(ForgotPasswordResource, "/forgot-password")
api.add_resource(ResetPasswordResource, "/reset-password")
api.add_resource(ChangePasswordResource, "/change-password")
