from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.payment import MpesaTransaction, Payment, PaymentMethod
from models.invoice import Invoice
from models.user import User
from datetime import datetime, timezone
from utils.mpesa_utils import mpesa_utility

from models.invoice import InvoiceStatus

mpesa_bp = Blueprint("mpesa", __name__)


@mpesa_bp.route("/mpesa/stk-push", methods=["POST"])
@jwt_required()
def initiate_stk_push():
    """
    Initiate MPESA STK push payment
    Expected JSON:
    {
        "amount": 100,
        "phone_number": "254712345678",
        "invoice_id": 1,
        "description": "Payment for invoice #1"
    }
    """
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        if not current_user:
            return jsonify({"success": False, "message": "User not found"}), 404

        data = request.get_json()

        if not data:
            return jsonify({"success": False, "message": "No JSON data provided"}), 400

        # Extract parameters
        amount = data.get("amount")
        phone_number = data.get("phone_number")
        invoice_id = data.get("invoice_id")
        description = data.get("description", "Payment")

        # Validate required parameters
        if not all([amount, phone_number]):
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Missing required parameters: amount, phone_number",
                    }
                ),
                400,
            )

        # Convert amount to integer and validate
        try:
            amount = float(amount)
            if amount <= 0:
                raise ValueError("Amount must be positive")
            amount = int(amount)  # M-Pesa expects integer amounts
        except (ValueError, TypeError):
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Amount must be a valid positive number",
                    }
                ),
                400,
            )

        # Validate phone number format
        is_valid, error_message = validate_phone_number(phone_number)
        if not is_valid:
            return (
                jsonify({"success": False, "message": error_message}),
                400,
            )

        # Validate invoice exists if provided
        invoice = None
        if invoice_id:
            invoice = Invoice.query.get(invoice_id)
            if not invoice:
                return jsonify({"success": False, "message": "Invoice not found"}), 404

        # Create pending MpesaTransaction record
        mpesa_transaction = MpesaTransaction(
            amount=amount,
            paid_by=phone_number,
            phone_number=phone_number,
            invoice_id=invoice_id,
            status="pending",
            created_at=datetime.now(timezone.utc),
            payment_date=datetime.now(timezone.utc),
        )

        db.session.add(mpesa_transaction)
        db.session.flush()  # Get the ID without committing

        # Initiate STK push using mpesa_utility
        result = mpesa_utility.initiate_stk_push(
            amount=amount,
            phone_number=phone_number,
            invoice_id=invoice_id,
            description=description,
        )

        if result["success"]:
            # Update transaction with STK push response data
            mpesa_transaction.merchant_request_id = result.get("MerchantRequestID")
            mpesa_transaction.checkout_request_id = result.get("CheckoutRequestID")
            mpesa_transaction.response_code = result.get("ResponseCode")
            mpesa_transaction.response_description = result.get("ResponseDescription")
            mpesa_transaction.customer_message = result.get("CustomerMessage")

            # Create Payment record only after successful STK push
            payment = None
            if invoice_id:  # Only create Payment record if invoice_id is provided
                payment = Payment(
                    invoice_id=invoice_id,
                    payment_method=PaymentMethod.MPESA,
                    mpesa_transaction_id=mpesa_transaction.id,
                    created_at=datetime.now(timezone.utc),
                )
                db.session.add(payment)

            db.session.commit()

            return jsonify(
                {
                    "success": True,
                    "transaction_id": mpesa_transaction.id,
                    "payment_id": payment.id if payment else None,
                    "checkout_request_id": mpesa_transaction.checkout_request_id,
                    "customer_message": mpesa_transaction.customer_message,
                    "message": "STK push initiated successfully",
                }
            )
        else:
            # STK push failed, update transaction status
            mpesa_transaction.status = "failed"
            mpesa_transaction.response_description = result.get("error")
            db.session.commit()

            return (
                jsonify(
                    {
                        "success": False,
                        "message": result.get("error", "STK push failed"),
                    }
                ),
                400,
            )

    except Exception as e:
        db.session.rollback()
        return (
            jsonify({"success": False, "message": f"Internal server error: {str(e)}"}),
            500,
        )


def validate_phone_number(phone_number):
    """
    Validate phone number format.

    Args:
        phone_number (str): Phone number to validate

    Returns:
        tuple: (is_valid, error_message)
    """
    if not phone_number:
        return False, "Phone number is required"

    if not phone_number.startswith("254"):
        return False, "Phone number must start with 254"

    if len(phone_number) != 12:
        return False, "Phone number must be exactly 12 digits"

    if not phone_number.isdigit():
        return False, "Phone number must contain only digits"

    return True, None


@mpesa_bp.route("/mpesa/callback", methods=["POST"])
def mpesa_callback():
    """
    MPESA payment callback - No JWT required for callbacks
    """
    try:
        callback_data = request.get_json()

        if not callback_data:
            return jsonify({"ResultCode": 1, "ResultDesc": "Empty callback data"}), 400

        # Parse MPESA callback structure
        if "Body" in callback_data and "stkCallback" in callback_data["Body"]:
            stk_callback = callback_data["Body"]["stkCallback"]
            checkout_request_id = stk_callback.get("CheckoutRequestID")
            result_code = stk_callback.get("ResultCode")
            result_desc = stk_callback.get("ResultDesc")

            if not checkout_request_id:
                return (
                    jsonify(
                        {"ResultCode": 1, "ResultDesc": "Missing CheckoutRequestID"}
                    ),
                    400,
                )

            # Find transaction by checkout_request_id
            transaction = MpesaTransaction.query.filter_by(
                checkout_request_id=checkout_request_id
            ).first()

            if not transaction:
                return (
                    jsonify({"ResultCode": 1, "ResultDesc": "Transaction not found"}),
                    404,
                )

            # Extract transaction details from callback metadata
            transaction_code = None
            transaction_date = None

            if "CallbackMetadata" in stk_callback:
                for item in stk_callback["CallbackMetadata"]["Item"]:
                    name = item.get("Name")
                    value = item.get("Value")

                    if name == "MpesaReceiptNumber":
                        transaction_code = value
                    elif name == "TransactionDate":
                        transaction_date = value

            # Update transaction with callback data
            transaction.result_code = result_code
            transaction.result_desc = result_desc
            transaction.mpesa_receipt_number = transaction_code
            transaction.transaction_date = transaction_date
            transaction.raw_callback_data = callback_data
            transaction.callback_received = True
            transaction.callback_received_at = datetime.now(timezone.utc)

            # Update status based on result code
            if result_code == 0:
                transaction.status = "completed"
                if transaction_code:
                    transaction.transaction_code = transaction_code

                # Create Payment record
                payment = Payment(
                    invoice_id=transaction.invoice_id,
                    payment_method=PaymentMethod.MPESA,
                    mpesa_transaction_id=transaction.id,
                    created_at=datetime.now(timezone.utc),
                )
                invoice = Invoice.query.filter_by(id=transaction.invoice_id).first()
                if invoice:
                    invoice.status = InvoiceStatus.paid
                db.session.add(payment)
            else:
                transaction.status = "failed"

            db.session.commit()
            return jsonify({"ResultCode": 0, "ResultDesc": "Success"})

        return jsonify({"ResultCode": 1, "ResultDesc": "Invalid callback format"}), 400

    except Exception as e:
        db.session.rollback()
        current_app.logger.exception(f"Error processing callback {e}")
        return (
            jsonify({"ResultCode": 1, "ResultDesc": "Error processing callback"}),
            500,
        )


@mpesa_bp.route("/mpesa/transactions", methods=["GET"])
@jwt_required()
def get_mpesa_transactions():
    """Get MPESA transactions with filtering - JWT protected"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        status = request.args.get("status")

        query = MpesaTransaction.query

        if status:
            query = query.filter(MpesaTransaction.status == status)

        transactions = query.order_by(MpesaTransaction.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return jsonify(
            {
                "success": True,
                "transactions": [t.to_dict() for t in transactions.items],
                "total": transactions.total,
                "pages": transactions.pages,
                "current_page": page,
            }
        )

    except Exception as e:
        return (
            jsonify(
                {"success": False, "message": f"Error fetching transactions: {str(e)}"}
            ),
            500,
        )


@mpesa_bp.route("/mpesa/transactions/<int:transaction_id>", methods=["GET"])
@jwt_required()
def get_mpesa_transaction(transaction_id):
    """Get specific MPESA transaction - JWT protected"""
    try:
        transaction = MpesaTransaction.query.get_or_404(transaction_id)

        return jsonify({"success": True, "transaction": transaction.to_dict()})

    except Exception as e:
        return (
            jsonify({"success": False, "message": f"Transaction not found: {str(e)}"}),
            404,
        )


@mpesa_bp.route(
    "/mpesa/transaction/status/<string:checkout_request_id>", methods=["GET"]
)
@jwt_required()
def get_transaction_status(checkout_request_id):
    """Check transaction status by checkout_request_id - JWT protected"""
    try:

        # First check in database
        transaction = MpesaTransaction.query.filter_by(
            checkout_request_id=checkout_request_id
        ).first()

        if not transaction:
            return jsonify({"success": False, "message": "Transaction not found"}), 404

        # If callback already received, return current status
        if transaction.callback_received:
            return jsonify(
                {
                    "success": True,
                    "status": transaction.status,
                    "result_code": transaction.result_code,
                    "result_desc": transaction.result_desc,
                    "mpesa_receipt_number": transaction.mpesa_receipt_number,
                }
            )

        # If no callback yet, query Daraja API
        result = mpesa_utility.check_transaction_status(checkout_request_id)

        if result["success"]:
            # Update transaction with query result
            transaction.result_code = result.get("result_code")
            transaction.result_desc = result.get("result_desc")

            # This comparison will now work correctly since result_code is integer
            if result.get("result_code") == 0:
                transaction.status = "completed"
            else:
                transaction.status = "failed"

            db.session.commit()

        return jsonify(
            {
                "success": True,
                "status": transaction.status,
                "result_code": transaction.result_code,
                "result_desc": transaction.result_desc,
            }
        )

    except Exception as e:
        return (
            jsonify(
                {
                    "success": False,
                    "message": f"Error checking transaction status: {str(e)}",
                }
            ),
            500,
        )


@mpesa_bp.route("/mpesa/token/status", methods=["GET"])
@jwt_required()
def get_token_status():
    """Check MPESA token status - JWT protected"""
    try:
        token_manager = mpesa_utility.token_manager

        return jsonify(
            {
                "success": True,
                "has_token": token_manager.token is not None,
                "is_valid": token_manager.is_token_valid(),
                "expires_at": (
                    token_manager.expiry_time.isoformat()
                    if token_manager.expiry_time
                    else None
                ),
            }
        )

    except Exception as e:
        return (
            jsonify(
                {"success": False, "message": f"Error checking token status: {str(e)}"}
            ),
            500,
        )
