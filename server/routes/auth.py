# routes/auth.py

import os
import threading
from datetime import datetime, timezone, timedelta
from flask import Blueprint, request, jsonify, current_app
from flask_restful import Api, Resource
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
    get_jwt,
    create_access_token,
)

from models import db
from models.user import User, AccountStatus
from models.token import Token
from utils.token import create_refresh_token_for_user
from utils.mail_templates import send_reset_email
from utils.password import is_valid_password


# ------------------------------------------------------------
# Blueprint & API setup
# ------------------------------------------------------------
auth_bp = Blueprint("auth", __name__)
api = Api(auth_bp)


# ------------------------------------------------------------
# VERIFY ACCOUNT
# User clicks email link -> verify account with JWT token
# ------------------------------------------------------------
class VerifyResource(Resource):
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

        # Token must be for account verification only
        if claims.get("purpose") != "account_verification":
            return {
                "status": "error",
                "message": "Invalid token purpose",
                "data": None,
            }, 400

        # Look up user in DB
        user = User.query.get(user_id)
        if not user:
            return {
                "status": "error",
                "message": "User not found",
                "data": None,
            }, 404

        # If already verified, short-circuit
        if user.account_status == AccountStatus.ACTIVE:
            return {
                "status": "success",
                "message": "Account already verified",
                "data": None,
            }, 200

        # Otherwise activate the account
        user.account_status = AccountStatus.ACTIVE
        db.session.commit()

        return {
            "status": "success",
            "message": "Account verified successfully",
            "data": None,
        }, 200


# ------------------------------------------------------------
# LOGIN
# Authenticate user -> return access + refresh tokens
# ------------------------------------------------------------
class LoginResource(Resource):
    def post(self):
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip().lower()
        password = data.get("password")

        # Validate input
        if not email or not password:
            return {
                "status": "error",
                "message": "Email and password are required",
                "data": None,
            }, 400

        # Check user exists + password
        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return {
                "status": "error",
                "message": "Invalid credentials",
                "data": None,
            }, 401

        # Block inactive accounts
        if user.account_status != AccountStatus.ACTIVE:
            return {
                "status": "error",
                "message": f"Account is {user.account_status.value}",
                "data": None,
            }, 403

        # Clear old refresh tokens for this user
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

        # Create fresh tokens
        refresh_token = create_refresh_token_for_user(user)
        access_token = create_access_token(identity=str(user.id))

        # User data returned to client
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


# ------------------------------------------------------------
# REFRESH TOKEN
# Exchange refresh token -> get new access token
# ------------------------------------------------------------
class RefreshResource(Resource):
    def post(self):
        data = request.get_json(silent=True) or {}
        token_value = data.get("refresh_token")

        if not token_value:
            return {
                "status": "error",
                "message": "Refresh token is required",
                "data": None,
            }, 400

        # Validate token from DB
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

        # Issue a new short-lived access token
        new_access_token = create_access_token(identity=str(user.id))

        return {
            "status": "success",
            "message": "Access token refreshed",
            "data": {
                "access_token": new_access_token,
                "user": user.to_safe_dict(include_email=True, include_phone=True),
            },
        }, 200


# ------------------------------------------------------------
# LOGOUT
# Kill refresh token so it can’t be reused
# ------------------------------------------------------------
class LogoutResource(Resource):
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
                "data": None,
            }, 200
        except Exception:
            db.session.rollback()
            return {
                "status": "error",
                "message": "Server error, logout failed",
                "data": None,
            }, 500


# ------------------------------------------------------------
# ME
# Return current user info (requires valid access token)
# ------------------------------------------------------------
class MeResource(Resource):
    @jwt_required()
    def get(self):
        uid = int(get_jwt_identity())
        user = User.query.get_or_404(uid)
        return {
            "status": "success",
            "message": "User retrieved successfully",
            "data": user.to_safe_dict(include_email=True, include_phone=True),
        }, 200


# ------------------------------------------------------------
# FORGOT PASSWORD
# User requests a reset link -> email is sent (always respond same)
# ------------------------------------------------------------
class ForgotPasswordResource(Resource):
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

        # Always return same message to avoid leaking valid emails
        if not user:
            return {
                "status": "success",
                "message": (
                    "If this email is registered, a reset link has " "been sent"
                ),
                "data": None,
            }, 200

        try:
            # Create short-lived password reset token
            reset_token = create_access_token(
                identity=str(user.id),
                expires_delta=timedelta(minutes=30),
                additional_claims={"purpose": "password_reset"},
            )

            # Build reset link for frontend
            frontend_url = os.getenv("VITE_FRONTEND_URL", "http://localhost:5173")
            reset_link = f"{frontend_url}/reset-password?token={reset_token}"

            # Send email in background (non-blocking)
            threading.Thread(
                target=send_reset_email,
                args=(user.email, user.full_name, reset_link),
                daemon=True,
            ).start()

            return {
                "status": "success",
                "message": (
                    "If this email is registered, a reset link has " "been sent"
                ),
                "data": None,
            }, 200

        except Exception:
            current_app.logger.exception("Error sending reset email")
            return {
                "status": "error",
                "message": "Server error. Please try again later.",
                "data": None,
            }, 500


# ------------------------------------------------------------
# RESET PASSWORD
# User clicks reset link -> set new password
# ------------------------------------------------------------
class ResetPasswordResource(Resource):
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

        if not is_valid_password(new_password):
            return {
                "status": "error",
                "message": (
                    "Password must have at least 8 characters, "
                    "one uppercase letter, and one digit."
                ),
                "data": None,
            }, 400

        try:
            # Revoke all refresh tokens for this user
            Token.query.filter_by(user_id=user.id).delete()

            # Save new password
            user.set_password(new_password)
            db.session.commit()

            return {
                "status": "success",
                "message": "Password reset successful",
                "data": None,
            }, 200

        except Exception:
            db.session.rollback()
            return {
                "status": "error",
                "message": "Server error. Please try again later.",
                "data": None,
            }, 500


# ------------------------------------------------------------
# CHANGE PASSWORD
# Logged-in user changes password (requires old + new)
# ------------------------------------------------------------
class ChangePasswordResource(Resource):
    @jwt_required()
    def post(self):
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

        if not is_valid_password(new_password):
            return {
                "status": "error",
                "message": (
                    "Password must have at least 8 characters, "
                    "one uppercase letter, and one digit."
                ),
                "data": None,
            }, 400

        try:
            # Revoke all refresh tokens for this user
            Token.query.filter_by(user_id=user.id).delete()

            # Save new password
            user.set_password(new_password)
            db.session.commit()

            return {
                "status": "success",
                "message": "Password changed successfully",
                "data": None,
            }, 200

        except Exception:
            db.session.rollback()
            return {
                "status": "error",
                "message": "Server error. Please try again later.",
                "data": None,
            }, 500


# ------------------------------------------------------------
# Register all routes
# ------------------------------------------------------------
api.add_resource(VerifyResource, "/verify")
api.add_resource(LoginResource, "/login")
api.add_resource(LogoutResource, "/logout")
api.add_resource(RefreshResource, "/refresh")
api.add_resource(MeResource, "/me")
api.add_resource(ForgotPasswordResource, "/forgot-password")
api.add_resource(ResetPasswordResource, "/reset-password")
api.add_resource(ChangePasswordResource, "/change-password")
