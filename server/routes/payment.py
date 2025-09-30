from flask import Blueprint, request, jsonify
from flask_restful import Api, Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone

from models import db
from models.user import User, Role
from models.payment import Payment, PaymentMethod, MpesaTransaction, CashTransaction
from models.invoice import Invoice, InvoiceStatus

payment_bp = Blueprint("payments", __name__)
api = Api(payment_bp)


# --- Helpers ---
def require_admin():
    uid = int(get_jwt_identity())
    user = User.query.get(uid)
    return user and user.role in [Role.ADMIN, Role.SUPER_ADMIN]


def error(message, code=400):
    return {"status": "error", "message": message, "data": None}, code


# --- Resources ---
class PaymentListResource(Resource):
    @jwt_required()
    def get(self):
        if not require_admin():
            return error(
                "Forbidden: You do not have permission to perform this action.", 403
            )
        items = Payment.query.order_by(Payment.created_at.desc()).all()
        return {
            "status": "success",
            "message": "Payments retrieved successfully",
            "data": [p.to_dict() for p in items],
        }, 200

    @jwt_required()
    def post(self):
        if not require_admin():
            return error(
                "Forbidden: You do not have permission to perform this action.", 403
            )
        payload = request.get_json(silent=True) or {}
        invoice_id = payload.get("invoice_id")
        method = payload.get("payment_method")
        method_id = payload.get("payment_method_id")

        if not invoice_id or not method:
            return error("Invalid input provided", 400)

        invoice = Invoice.query.get(invoice_id)
        if not invoice:
            return error("Resource not found", 404)

        pmethod = (
            PaymentMethod.MPESA if method.lower() == "mpesa" else PaymentMethod.CASH
        )
        if pmethod == PaymentMethod.MPESA and not MpesaTransaction.query.get(method_id):
            return error("Invalid input provided", 400)
        if pmethod == PaymentMethod.CASH and not CashTransaction.query.get(method_id):
            return error("Invalid input provided", 400)

        try:
            new_payment = Payment(
                invoice_id=invoice_id,
                payment_method=pmethod,
                payment_method_id=method_id,
                created_at=datetime.now(timezone.utc),
            )
            db.session.add(new_payment)

            total_paid = sum(p.metadata.get("amount", 0) for p in invoice.payments)
            if total_paid >= invoice.amount:
                invoice.status = InvoiceStatus.paid

            db.session.commit()
        except Exception:
            db.session.rollback()
            return error("An unexpected error occurred", 500)

        return {
            "status": "success",
            "message": "Payment created successfully",
            "data": new_payment.to_dict(),
        }, 201


class PaymentResource(Resource):
    @jwt_required()
    def get(self, payment_id):
        if not require_admin():
            return error(
                "Forbidden: You do not have permission to perform this action.", 403
            )
        p = Payment.query.get(payment_id)
        if not p:
            return error("Resource not found", 404)
        return {
            "status": "success",
            "message": "Payment retrieved successfully",
            "data": p.to_dict(),
        }, 200

    @jwt_required()
    def put(self, payment_id):
        if not require_admin():
            return error(
                "Forbidden: You do not have permission to perform this action.", 403
            )
        p = Payment.query.get(payment_id)
        if not p:
            return error("Resource not found", 404)

        payload = request.get_json(silent=True) or {}
        if "invoice_id" in payload:
            invoice = Invoice.query.get(payload["invoice_id"])
            if not invoice:
                return error("Resource not found", 404)
            p.invoice_id = payload["invoice_id"]

        if "payment_method" in payload:
            method = payload["payment_method"]
            p.payment_method = (
                PaymentMethod.MPESA if method.lower() == "mpesa" else PaymentMethod.CASH
            )

        if "payment_method_id" in payload:
            p.payment_method_id = payload["payment_method_id"]

        try:
            db.session.commit()

            invoice = Invoice.query.get(p.invoice_id)
            total_paid = sum(x.metadata.get("amount", 0) for x in invoice.payments)
            if total_paid >= invoice.amount:
                invoice.status = InvoiceStatus.paid
                db.session.commit()

        except Exception:
            db.session.rollback()
            return error("An unexpected error occurred", 500)

        return {
            "status": "success",
            "message": "Payment updated successfully",
            "data": p.to_dict(),
        }, 200

    @jwt_required()
    def delete(self, payment_id):
        if not require_admin():
            return error(
                "Forbidden: You do not have permission to perform this action.", 403
            )
        p = Payment.query.get(payment_id)
        if not p:
            return error("Resource not found", 404)

        try:
            db.session.delete(p)
            db.session.commit()
        except Exception:
            db.session.rollback()
            return error("An unexpected error occurred", 500)

        return {
            "status": "success",
            "message": "Payment deleted successfully",
            "data": None,
        }, 200


# --- Register routes ---
api.add_resource(PaymentListResource, "/payments")
api.add_resource(PaymentResource, "/payments/<int:payment_id>")
