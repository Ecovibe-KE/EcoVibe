from flask import Blueprint, request, jsonify, current_app

from models import db
from models.payment import MpesaTransaction, Payment, PaymentMethod
from models.invoice import Invoice
from utils.mpesa_utils import mpesa_utility


mpesa_bp = Blueprint("mpesa", __name__)


@mpesa_bp.route('/stk-push', methods=['POST'])
def initiate_stk_push():
    """
    Initiate MPESA STK push payment
    Expected JSON:
    {
        "amount": 100,
        "phone_number": "254712345678",
        "invoice_id": 1,  # optional
        "description": "Payment for invoice #1"
    }
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                'success': False,
                'message': 'No JSON data provided'
            }), 400

        # Extract parameters
        amount = data.get('amount')
        phone_number = data.get('phone_number')
        invoice_id = data.get('invoice_id')
        description = data.get('description', 'Payment')

        # Validate required parameters
        if not all([amount, phone_number]):
            return jsonify({
                'success': False,
                'message': 'Missing required parameters: amount, phone_number'
            }), 400

        # Validate invoice exists if provided
        if invoice_id:
            invoice = Invoice.query.get(invoice_id)
            if not invoice:
                return jsonify({
                    'success': False,
                    'message': 'Invoice not found'
                }), 404

        current_app.logger.info(
            f"Initiating MPESA payment: Amount={amount}, Phone={phone_number}, Invoice={invoice_id}")


        # Initiate STK push
        result = mpesa_utility.initiate_stk_push(
            amount=amount,
            phone_number=phone_number,
            invoice_id=invoice_id,
            description=description
        )

        if result['success']:
            current_app.logger.info(f"STK push initiated: Transaction ID {result.get('transaction_id')}")
            return jsonify(result)
        else:
            current_app.logger.error(f"STK push failed: {result.get('error')}")
            return jsonify(result), 400

    except Exception as e:
        current_app.logger.error(f"Error initiating STK push: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500


@mpesa_bp.route('/callback', methods=['POST'])
def mpesa_callback():
    """
    Handle MPESA payment callback
    """
    try:
        callback_data = request.get_json()
        current_app.logger.info(f"Received MPESA callback: {callback_data}")

        # Parse MPESA callback structure
        if 'Body' in callback_data and 'stkCallback' in callback_data['Body']:
            stk_callback = callback_data['Body']['stkCallback']
            checkout_request_id = stk_callback.get('CheckoutRequestID')
            result_code = stk_callback.get('ResultCode')
            result_desc = stk_callback.get('ResultDesc')

            # Extract transaction details from callback metadata
            transaction_code = None
            amount = None
            phone_number = None

            if 'CallbackMetadata' in stk_callback:
                for item in stk_callback['CallbackMetadata']['Item']:
                    if item.get('Name') == 'MpesaReceiptNumber':
                        transaction_code = item.get('Value')
                    elif item.get('Name') == 'Amount':
                        amount = item.get('Value')
                    elif item.get('Name') == 'PhoneNumber':
                        phone_number = item.get('Value')

            # Update transaction status
            transaction = mpesa_utility.update_mpesa_transaction(
                checkout_request_id=checkout_request_id,
                result_code=result_code,
                result_desc=result_desc,
                transaction_code=transaction_code,
                callback_data=callback_data
            )

            if transaction:
                current_app.logger.info(f"Transaction updated: {transaction.transaction_code} - Result: {result_code}")

                # Additional business logic for successful payments
                if result_code == 0 and transaction_code:
                    # Update invoice status if applicable
                    payment = Payment.query.filter_by(payment_method_id=transaction.id).first()
                    if payment and payment.invoice:
                        # Mark invoice as paid or update status
                        payment.invoice.status = 'paid'  # Adjust based on your Invoice model
                        db.session.commit()

            return jsonify({'ResultCode': 0, 'ResultDesc': 'Success'})

        return jsonify({'ResultCode': 1, 'ResultDesc': 'Invalid callback format'}), 400

    except Exception as e:
        current_app.logger.error(f"Error processing MPESA callback: {str(e)}")
        return jsonify({'ResultCode': 1, 'ResultDesc': 'Error processing callback'}), 500


@mpesa_bp.route('/transactions', methods=['GET'])
def get_mpesa_transactions():
    """Get MPESA transactions with filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')

        query = MpesaTransaction.query

        if status:
            if hasattr(MpesaTransaction, 'status'):
                query = query.filter(MpesaTransaction.status == status)

        transactions = query.order_by(MpesaTransaction.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return jsonify({
            'success': True,
            'transactions': [t.to_dict() for t in transactions.items],
            'total': transactions.total,
            'pages': transactions.pages,
            'current_page': page
        })

    except Exception as e:
        current_app.logger.error(f"Error fetching transactions: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error fetching transactions: {str(e)}'
        }), 500


@mpesa_bp.route('/transactions/<int:transaction_id>', methods=['GET'])
def get_mpesa_transaction(transaction_id):
    """Get specific MPESA transaction"""
    try:
        transaction = MpesaTransaction.query.get_or_404(transaction_id)
        return jsonify({
            'success': True,
            'transaction': transaction.to_dict()
        })

    except Exception as e:
        current_app.logger.error(f"Error fetching transaction {transaction_id}: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Transaction not found: {str(e)}'
        }), 404


@mpesa_bp.route('/token/status', methods=['GET'])
def get_token_status():
    """Check MPESA token status"""
    try:
        token_manager = mpesa_utility.token_manager
        return jsonify({
            'success': True,
            'has_token': token_manager.token is not None,
            'is_valid': token_manager.is_token_valid(),
            'expires_at': token_manager.expiry_time.isoformat() if token_manager.expiry_time else None
        })

    except Exception as e:
        current_app.logger.error(f"Error checking token status: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error checking token status: {str(e)}'
        }), 500