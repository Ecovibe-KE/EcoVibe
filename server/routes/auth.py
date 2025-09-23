# routes/auth.py (verify resource)

from flask import Blueprint
from flask_restful import Api, Resource
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db
from models.user import User, AccountStatus

auth_bp = Blueprint("auth", __name__)
api = Api(auth_bp)


class VerifyResource(Resource):
    @jwt_required()   # expects Authorization: Bearer <token>
    def post(self):
        """Verify account using the JWT token in Authorization header"""
        try:
            # identity was set as str(user.id) in register
            user_id = get_jwt_identity()
            user_id = int(user_id)  # cast back to int for DB
        except Exception:
            return {"status": "error", "message": "invalid or expired token"}, 401

        user = User.query.get(user_id)
        if not user:
            return {"status": "error", "message": "user not found"}, 404

        if user.account_status == AccountStatus.ACTIVE:
            return {"status": "success", "message": "account already verified"}, 200

        user.account_status = AccountStatus.ACTIVE
        db.session.commit()

        return {"status": "success", "message": "account verified successfully"}, 200


api.add_resource(VerifyResource, "/verify")
