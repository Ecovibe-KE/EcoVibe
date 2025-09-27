# routes/auth.py
from flask import Blueprint, request
from utils.token import create_refresh_token_for_user
from datetime import datetime, timezone
from flask_restful import Api, Resource
from models.token import Token
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
    get_jwt,
    create_access_token,
)

from models import db
from models.user import User, AccountStatus

# Blueprint + API for authentication-related endpoints
auth_bp = Blueprint("auth", __name__)
api = Api(auth_bp)


class VerifyResource(Resource):
    @jwt_required()
    def post(self):
        # Extract user ID + token claims from JWT
        try:
            user_id = int(get_jwt_identity())
            claims = get_jwt()
        except Exception:
            print("error Exception")
            return {
                "status": "error",
                "message": "Invalid or expired token",
            }, 401

        # Ensure token was generated for verification, not login
        if claims.get("purpose") != "account_verification":

            print("error account_verification")
            return {
                "status": "error",
                "message": "Invalid token purpose",
            }, 400

        # Look up the user in the database
        user = User.query.get(user_id)
        if not user:
            print("error User not found")
            return {
                "status": "error",
                "message": "User not found",
            }, 404

        # If user is already active, nothing more to do
        if user.account_status == AccountStatus.ACTIVE:
            return {
                "status": "success",
                "message": "Account already verified",
            }, 200

        # Otherwise, activate user account
        user.account_status = AccountStatus.ACTIVE
        db.session.commit()

        return {
            "status": "success",
            "message": "Account verified successfully",
        }, 200


# Login
class LoginResource(Resource):
    def post(self):
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip().lower()
        password = data.get("password")

        if not email or not password:
            return {"error": "email and password are required"}, 400

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return {"error": "invalid credentials"}, 401

        if user.account_status != AccountStatus.ACTIVE:
            return {"error": f"account is {user.account_status.value}"}, 403
        try:
            Token.query.filter_by(user_id=user.id).delete()
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {"error": "server error"}, 500

        # 🔑 Create DB-backed refresh token
        refresh_token = create_refresh_token_for_user(user)

        # JWT for short-lived access token
        access_token = create_access_token(identity=str(user.id))
        user_data = {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "industry": user.industry,
            "phone_number": user.phone_number,
            "role": user.role.value,
        }

        return {
            "message": "Login successful",
            "user": user_data,
            "access_token": access_token,
            "refresh_token": refresh_token,
        }, 200


# Refresh
class RefreshResource(Resource):
    def post(self):
        data = request.get_json(silent=True) or {}
        token_value = data.get("refresh_token")

        if not token_value:
            return {"error": "refresh token is required"}, 400

        # Look up the token in DB
        token = Token.query.filter_by(value=token_value).first()
        now = datetime.now(timezone.utc)

        if not token or not token.expiry_time or token.expiry_time <= now:
            return {"error": "invalid or expired refresh token"}, 401

        user = User.query.get(token.user_id)
        if not user:
            return {"error": "user not found"}, 404

        # Issue a new access token
        new_access_token = create_access_token(identity=str(user.id))

        return {
            "access_token": new_access_token,
            "user": user.to_safe_dict(include_email=True, include_phone=True),
        }, 200


# Logout
class LogoutResource(Resource):
    def post(self):
        data = request.get_json(silent=True) or {}
        token_value = data.get("refresh_token")

        if not token_value:
            return {"error": "refresh token is required"}, 400

        token = Token.query.filter_by(value=token_value).first()

        if not token:
            return {"error": "invalid refresh token"}, 401
        try:
            db.session.delete(token)
            db.session.commit()
            return {"message": "Logged out successfully"}, 200
        except Exception:
            db.session.rollback()
            return {"error": "Server error, logout failed"}, 500


# Me
class MeResource(Resource):
    @jwt_required()
    def get(self):
        uid = int(get_jwt_identity())
        user = User.query.get_or_404(uid)
        return user.to_safe_dict(include_email=True, include_phone=True), 200


# Attach resource to /verify route
api.add_resource(VerifyResource, "/verify")
api.add_resource(LoginResource, "/login")
api.add_resource(LogoutResource, "/logout")
api.add_resource(RefreshResource, "/refresh")
api.add_resource(MeResource, "/me")
