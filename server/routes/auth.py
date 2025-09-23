from flask_restful import Resource
from flask_jwt_extended import decode_token
from models import db, User
from models.user import AccountStatus
from flask import Blueprint, request

auth_bp = Blueprint("auth", __name__)

class VerifyAccount(Resource):
    def post(self):
        data = request.get_json(silent=True) or {}
        token = data.get("token")

        if not token:
            return {"status": "error", "message": "token is required"}, 400

        try:
            decoded = decode_token(token)
            if decoded.get("purpose") != "account_verification":
                return {"status": "error", "message": "invalid token"}, 400
        except Exception:
            return {"status": "error", "message": "invalid or expired token"}, 400

        user_id = decoded["sub"]
        user = User.query.get(user_id)

        if not user:
            return {"status": "error", "message": "user not found"}, 404

        if user.account_status == AccountStatus.ACTIVE:
            return {"status": "success", "message": "account already verified"}, 200

        user.account_status = AccountStatus.ACTIVE
        db.session.commit()

        return {"status": "success", "message": "account verified successfully"}, 200



auth_bp.add_resource(VerifyAccount, "/verify")