# routes/auth.py

from flask import Blueprint
from flask_restful import Api, Resource
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from models import db
from models.user import User, AccountStatus

auth_bp = Blueprint("auth", __name__)
api = Api(auth_bp)


class VerifyResource(Resource):
    @jwt_required()
    def post(self):
        try:
            user_id = int(get_jwt_identity())
            claims = get_jwt()
        except Exception:
            return {"status": "error", "message": "Invalid or expired token"}, 401

        # Only allow tokens created for account verification
        if claims.get("purpose") != "account_verification":
            return {"status": "error", "message": "Invalid token purpose"}, 400

        user = User.query.get(user_id)
        if not user:
            return {"status": "error", "message": "User not found"}, 404

        if user.account_status == AccountStatus.ACTIVE:
            return {"status": "success", "message": "Account already verified"}, 200

        user.account_status = AccountStatus.ACTIVE
        db.session.commit()

        return {"status": "success", "message": "Account verified successfully"}, 200


api.add_resource(VerifyResource, "/verify")
