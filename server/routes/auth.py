# routes/auth.py
from flask import Blueprint
from flask_restful import Api, Resource
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
    get_jwt,
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


# Attach resource to /verify route
api.add_resource(VerifyResource, "/verify")
