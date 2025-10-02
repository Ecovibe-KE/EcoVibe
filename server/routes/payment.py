from flask import Blueprint, request, jsonify
from flask_restful import Api, Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone, date
from sqlalchemy import desc

from models import db
from models.user import User, Role
from models.payment import Payment, PaymentMethod, MpesaTransaction, CashTransaction
from models.invoice import Invoice, InvoiceStatus

from models.service import Service

payment_bp = Blueprint("payments", __name__)
api = Api(payment_bp)


# --- Helpers ---
def get_current_user():
    """Get current user from JWT token"""
    uid = int(get_jwt_identity())
    return User.query.get(uid)


def require_admin():
    """Check if current user is admin"""
    user = get_current_user()
    return user and user.role in [Role.ADMIN, Role.SUPER_ADMIN]


def error(message, code=400):
    return {"status": "error", "message": message, "data": None}, code


def success(message, data=None, code=200):
    return {"status": "success", "message": message, "data": data}, code


# --- Invoice Resources ---
class InvoiceListResource(Resource):
    @jwt_required()
    def get(self):
        """Get invoices - all for admin, only user's for client"""
        current_user = get_current_user()

        if require_admin():
            # Admin gets all invoices
            invoices = Invoice.query.order_by(desc(Invoice.created_at)).all()
        else:
            # Client gets only their invoices
            invoices = (
                Invoice.query.filter_by(client_id=current_user.id)
                .order_by(desc(Invoice.created_at))
                .all()
            )

        # Format response with services and transaction data
        invoices_data = []
        for invoice in invoices:
            invoice_data = self.format_invoice_response(invoice)
            invoices_data.append(invoice_data)

        return success("Invoices retrieved successfully", {"invoices": invoices_data})

    def format_invoice_response(self, invoice):
        """Format invoice response with services and transaction data"""
        invoice_data = invoice.to_dict()

        # Add client name for admin view
        if require_admin() and invoice.client:
            invoice_data["client_name"] = invoice.client.full_name
            invoice_data["client_data"] = invoice.client.to_dict()

        # Add service description and details
        if invoice.service:
            invoice_data["description"] = invoice.service.name
            invoice_data["services"] = [invoice.service.name]
            invoice_data["service_details"] = invoice.service.to_dict()
        else:
            invoice_data["description"] = "Service Invoice"
            invoice_data["services"] = ["General Service"]

        # Add transaction data
        transaction_data = {}

        # Check if payments exist - try multiple ways to access payments
        payments_found = False
        latest_payment = None

        # Method 1: Try via relationship first
        if hasattr(invoice, "payments") and invoice.payments:
            payments_list = list(invoice.payments)
            if payments_list:
                payments_found = True
                latest_payment = sorted(
                    payments_list, key=lambda x: x.created_at, reverse=True
                )[0]

        if not payments_found:
            try:
                direct_payments = Payment.query.filter_by(invoice_id=invoice.id).all()
                if direct_payments:
                    payments_found = True
                    latest_payment = sorted(
                        direct_payments, key=lambda x: x.created_at, reverse=True
                    )[0]
            except Exception:
                pass  # Silently handle payment query errors

        if payments_found and latest_payment:
            # Get payment details
            payment_dict = latest_payment.to_dict()
            payment_metadata = payment_dict.get("metadata", {})

            # Build transaction data based on payment method
            if latest_payment.payment_method == PaymentMethod.MPESA:
                transaction_data = {
                    "transactionId": f"TRX{latest_payment.id:06d}",
                    "status": self.get_payment_status(latest_payment),
                    "payment_method": "mpesa",
                    "mpesa_receipt_number": payment_metadata.get(
                        "mpesa_receipt_number"
                    ),
                    "phone_number": payment_metadata.get("phone_number"),
                    "amount": payment_metadata.get("amount"),
                    "payment_date": payment_metadata.get("payment_date"),
                }
            elif latest_payment.payment_method == PaymentMethod.CASH:
                transaction_data = {
                    "transactionId": f"TRX{latest_payment.id:06d}",
                    "status": self.get_payment_status(latest_payment),
                    "payment_method": "cash",
                    "received_by": payment_metadata.get("received_by"),
                    "amount": payment_metadata.get("amount"),
                    "payment_date": payment_metadata.get("payment_date"),
                }
            elif latest_payment.payment_method == PaymentMethod.CARD:
                transaction_data = {
                    "transactionId": f"TRX{latest_payment.id:06d}",
                    "status": self.get_payment_status(latest_payment),
                    "payment_method": "card",
                    "amount": payment_metadata.get("amount"),
                    "payment_date": payment_metadata.get("payment_date"),
                }
            else:
                transaction_data = {
                    "transactionId": f"TRX{latest_payment.id:06d}",
                    "status": self.get_payment_status(latest_payment),
                    "payment_method": latest_payment.payment_method.value,
                }

        invoice_data["transaction"] = transaction_data

        # Format dates for UI
        invoice_data["date"] = (
            (invoice.created_at.strftime("%Y-%m-%d")) if invoice.created_at else None
        )
        invoice_data["dueDate"] = (
            (invoice.due_date.strftime("%Y-%m-%d")) if invoice.due_date else None
        )

        return invoice_data

    def get_payment_status(self, payment):
        """Get payment status for transaction data"""
        if hasattr(payment, "status"):
            return payment.status.value
        # Default status based on invoice status
        if payment.invoice.status == InvoiceStatus.paid:
            return "completed"
        elif payment.invoice.status == InvoiceStatus.pending:
            return "pending"
        else:
            return "failed"


class ClientInvoiceListResource(Resource):
    @jwt_required()
    def get(self):
        """Get invoices - all for admin, only user's for client"""
        current_user = get_current_user()

        if require_admin():
            # Admin gets all invoices
            invoices = Invoice.query.order_by(desc(Invoice.created_at)).all()
        else:
            # Client gets only their invoices
            invoices = (
                Invoice.query.filter_by(client_id=current_user.id)
                .order_by(desc(Invoice.created_at))
                .all()
            )

        print(f"invoices{invoices}")
        # Format response with services and transaction data
        invoices_data = []
        for invoice in invoices:
            invoice_data = self.format_invoice_response(invoice)
            invoices_data.append(invoice_data)

        return success("Invoices retrieved successfully", {"invoices": invoices_data})

    def format_invoice_response(self, invoice):
        """Format invoice response with services and transaction data"""
        invoice_data = invoice.to_dict()

        print(f"DEBUG: Processing invoice ID: {invoice.id}")
        print(f"DEBUG: Invoice object: {invoice}")
        print(f"DEBUG: Invoice payments attribute: {hasattr(invoice, 'payments')}")

        # ===== DEBUG: LIST ALL PAYMENTS IN DATABASE =====
        print("=" * 60)
        print("DEBUG: ALL PAYMENTS IN DATABASE")
        print("=" * 60)
        try:
            all_payments = Payment.query.all()
            print(f"Total payments in database: {len(all_payments)}")

            for i, payment in enumerate(all_payments):
                # Check if this payment belongs to the current invoice
                if payment.invoice_id == invoice.id:
                    print(f"  --> INVOICE {invoice.id}!")

        except Exception as e:
            print(f"DEBUG: Error querying all payments: {e}")

        print("=" * 60)
        try:
            direct_payments = Payment.query.filter_by(invoice_id=invoice.id).all()

            for i, payment in enumerate(direct_payments):
                print(
                    f"Direct Payment {i + 1}: "
                    f"ID={payment.id}, "
                    f"Method={payment.payment_method}"
                )

        except Exception as e:
            print(f"DEBUG: Error in direct payment query: {e}")
        print("-" * 60)

        # Add client name for admin view
        if require_admin() and invoice.client:
            invoice_data["client_name"] = invoice.client.full_name
            invoice_data["client_data"] = invoice.client.to_dict()

        # Add service description and details
        if invoice.service:
            invoice_data["description"] = invoice.service.name
            invoice_data["services"] = [invoice.service.name]
            invoice_data["service_details"] = invoice.service.to_dict()
        else:
            invoice_data["description"] = "Service Invoice"
            invoice_data["services"] = ["General Service"]

        # Add transaction data
        transaction_data = {}

        # Check if payments exist - try multiple ways to access payments
        payments_found = False
        latest_payment = None

        # Method 1: Try via relationship first
        if hasattr(invoice, "payments") and invoice.payments:
            payments_list = list(invoice.payments)
            if payments_list:
                payments_found = True
                latest_payment = sorted(
                    payments_list, key=lambda x: x.created_at, reverse=True
                )[0]

        # Method 2: If relationship fails, try direct query
        if not payments_found:
            try:
                direct_payments = Payment.query.filter_by(invoice_id=invoice.id).all()
                if direct_payments:
                    payments_found = True
                    latest_payment = sorted(
                        direct_payments, key=lambda x: x.created_at, reverse=True
                    )[0]
            except Exception as e:
                print(f"DEBUG: Direct query also failed: {e}")

        if payments_found and latest_payment:
            print(f"DEBUG: Latest payment ID: {latest_payment.id}")
            print(f"DEBUG: Payment method: {latest_payment.payment_method}")

            # Get payment details
            payment_dict = latest_payment.to_dict()
            print(f"DEBUG: Payment dict: {payment_dict}")

            payment_metadata = payment_dict.get("metadata", {})
            print(f"DEBUG: Payment metadata: {payment_metadata}")

            # Build transaction data based on payment method
            if latest_payment.payment_method == PaymentMethod.MPESA:
                transaction_data = {
                    "transactionId": f"TRX{latest_payment.id:06d}",
                    "status": self.get_payment_status(latest_payment),
                    "payment_method": "mpesa",
                    "mpesa_receipt_number": payment_metadata.get(
                        "mpesa_receipt_number"
                    ),
                    "phone_number": payment_metadata.get("phone_number"),
                    "amount": payment_metadata.get("amount"),
                    "payment_date": payment_metadata.get("payment_date"),
                }
            elif latest_payment.payment_method == PaymentMethod.CASH:
                transaction_data = {
                    "transactionId": f"TRX{latest_payment.id:06d}",
                    "status": self.get_payment_status(latest_payment),
                    "payment_method": "cash",
                    "received_by": payment_metadata.get("received_by"),
                    "amount": payment_metadata.get("amount"),
                    "payment_date": payment_metadata.get("payment_date"),
                }
            elif latest_payment.payment_method == PaymentMethod.CARD:
                transaction_data = {
                    "transactionId": f"TRX{latest_payment.id:06d}",
                    "status": self.get_payment_status(latest_payment),
                    "payment_method": "card",
                    "amount": payment_metadata.get("amount"),
                    "payment_date": payment_metadata.get("payment_date"),
                }
            else:
                transaction_data = {
                    "transactionId": f"TRX{latest_payment.id:06d}",
                    "status": self.get_payment_status(latest_payment),
                    "payment_method": latest_payment.payment_method.value,
                }
        else:
            print(
                f"DEBUG: No payments "
                f"found for invoice {invoice.id} "
                f"through any method"
            )

        invoice_data["transaction"] = transaction_data

        # Format dates for UI
        invoice_data["date"] = (
            invoice.created_at.strftime("%Y-%m-%d") if invoice.created_at else None
        )
        invoice_data["dueDate"] = (
            invoice.due_date.strftime("%Y-%m-%d") if invoice.due_date else None
        )
        return invoice_data

    def get_payment_status(self, payment):
        """Get payment status for transaction data"""
        if hasattr(payment, "status"):
            return payment.status.value
        # Default status based on invoice status
        if payment.invoice.status == InvoiceStatus.paid:
            return "completed"
        elif payment.invoice.status == InvoiceStatus.pending:
            return "pending"
        else:
            return "failed"


class InvoiceResource(Resource):
    @jwt_required()
    def get(self, invoice_id):
        """Get specific invoice details"""
        current_user = get_current_user()

        invoice = Invoice.query.get(invoice_id)
        if not invoice:
            return error("Invoice not found", 404)

        # Check permission - admin or invoice owner
        if not require_admin() and invoice.client_id != current_user.id:
            return error(
                "Forbidden: " "You do not have permission to " "view this invoice", 403
            )

        invoice_formatter = InvoiceListResource()
        invoice_data = invoice_formatter.format_invoice_response(invoice)

        return success("Invoice retrieved successfully", {"invoice": invoice_data})


# --- Payment Resources ---
class PaymentListResource(Resource):
    @jwt_required()
    def get(self):
        """Get payments based on user role"""
        current_user = get_current_user()

        if require_admin():
            # Admin gets all payments
            payments = Payment.query.order_by(desc(Payment.created_at)).all()
        else:
            # Client gets payments for their invoices
            payments = (
                Payment.query.join(Invoice)
                .filter(Invoice.client_id == current_user.id)
                .order_by(desc(Payment.created_at))
                .all()
            )

        payments_data = [p.to_dict() for p in payments]
        return success("Payments retrieved successfully", {"payments": payments_data})

    @jwt_required()
    def post(self):
        """Create a new payment"""
        if not require_admin():
            return error(
                "Forbidden: " "You do not have permission to " "perform this action",
                403,
            )

        payload = request.get_json(silent=True) or {}
        invoice_id = payload.get("invoice_id")
        method = payload.get("payment_method")
        method_id = payload.get("payment_method_id")

        if not invoice_id or not method:
            return error("Invalid input provided", 400)

        invoice = Invoice.query.get(invoice_id)
        if not invoice:
            return error("Invoice not found", 404)

        # Convert payment method
        if method.lower() == "mpesa":
            pmethod = PaymentMethod.MPESA
        else:
            pmethod = PaymentMethod.CASH
        # Validate method-specific transaction
        if pmethod == PaymentMethod.MPESA and not MpesaTransaction.query.get(method_id):
            return error("M-Pesa transaction not found", 404)
        if pmethod == PaymentMethod.CASH and not CashTransaction.query.get(method_id):
            return error("Cash transaction not found", 404)

        try:
            new_payment = Payment(
                invoice_id=invoice_id,
                payment_method=pmethod,
                payment_method_id=method_id,
                created_at=datetime.now(timezone.utc),
            )
            db.session.add(new_payment)

            # Update invoice status if fully paid
            total_paid = sum(p.amount for p in invoice.payments if hasattr(p, "amount"))
            if total_paid >= invoice.amount:
                invoice.status = InvoiceStatus.paid

            db.session.commit()

            return success("Payment created successfully", new_payment.to_dict(), 201)

        except Exception as e:
            db.session.rollback()
            print(f"Payment creation error: {e}")
            return error("An unexpected error occurred", 500)


class PaymentResource(Resource):
    @jwt_required()
    def get(self, payment_id):
        """Get specific payment"""
        if not require_admin():
            return error(
                "Forbidden: " "You do not have permission to " "perform this action",
                403,
            )

        payment = Payment.query.get(payment_id)
        if not payment:
            return error("Payment not found", 404)

        return success("Payment retrieved successfully", payment.to_dict())


class CancelTransactionResource(Resource):
    @jwt_required()
    def post(self):
        """Cancel a pending transaction"""
        current_user = get_current_user()
        payload = request.get_json(silent=True) or {}

        invoice_id = payload.get("invoice_id")
        transaction_id = payload.get("transaction_id")

        # Validate required fields
        if not invoice_id and not transaction_id:
            return error("Either invoice_id or transaction_id is required", 400)

        try:
            # Find the invoice to cancel
            invoice = None
            if invoice_id:
                invoice = Invoice.query.filter_by(id=invoice_id).first()
                if not invoice:
                    return error("Invoice not found", 404)

            # Check permissions - user must be admin or the client who owns the invoice
            if not require_admin() and invoice.client_id != current_user.id:
                return error("Unauthorized to cancel this transaction", 403)

            # Check if invoice can be cancelled (only pending invoices can be cancelled)
            if invoice.status != InvoiceStatus.pending:
                return error(
                    f"Cannot cancel invoice with status: " f"{invoice.status.value}",
                    400,
                )

            # Update invoice status to cancelled
            invoice.status = InvoiceStatus.cancelled

            db.session.commit()

            return success(
                "Transaction cancelled successfully", {"invoice": invoice.to_dict()}
            )

        except Exception as e:
            db.session.rollback()
            print(f"Cancel transaction error: {e}")
            return error("Failed to cancel transaction", 500)


# --- Register routes ---
api.add_resource(InvoiceListResource, "/invoices")
api.add_resource(InvoiceResource, "/invoices/<int:invoice_id>")
api.add_resource(PaymentListResource, "/payments")
api.add_resource(PaymentResource, "/payments/<int:payment_id>")
api.add_resource(CancelTransactionResource, "/transaction/cancel")
api.add_resource(ClientInvoiceListResource, "/clientInvoices")
