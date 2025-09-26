import requests
import base64
import time
import threading
from datetime import datetime, timedelta
import json
from config import Config
from models import db, MpesaTransaction

from phone_validation import validate_phone_number, is_valid_phone


class MPESATokenManager:
    def __init__(self):
        self.token = None
        self.expiry_time = None
        self.lock = threading.Lock()
        self.config = Config()

    def generate_access_token(self):
        """Generate MPESA API access token"""
        try:
            credentials = f"{self.config.MPESA_CONSUMER_KEY}:{self.config.MPESA_CONSUMER_SECRET}"
            encoded_credentials = base64.b64encode(credentials.encode()).decode()

            headers = {
                'Authorization': f'Basic {encoded_credentials}',
                'Content-Type': 'application/json'
            }

            response = requests.get(self.config.MPESA_AUTH_URL, headers=headers, timeout=30)
            response.raise_for_status()

            result = response.json()
            return result.get('access_token')

        except requests.exceptions.RequestException as e:
            print(f"Error generating access token: {e}")
            return None

    def is_token_valid(self):
        """Check if token is still valid"""
        if not self.token or not self.expiry_time:
            return False
        return datetime.now() < (self.expiry_time - timedelta(minutes=5))

    def get_token(self):
        """Get valid token, generate new one if expired"""
        with self.lock:
            if self.is_token_valid():
                return self.token
            return self.refresh_token()

    def refresh_token(self):
        """Generate new token"""
        new_token = self.generate_access_token()
        if new_token:
            self.token = new_token
            self.expiry_time = datetime.now() + timedelta(hours=1)
            print(f"Token refreshed. Expires at: {self.expiry_time}")
        return new_token


class MPESAUtils:
    def __init__(self):
        self.config = Config()
        self.token_manager = MPESATokenManager()

    def validate_mpesa_phone_number(self, phone_number, default_region="KE"):
        """Enhanced phone validation using your existing function"""
        try:
            formatted_number = validate_phone_number(phone_number, default_region)

            # Remove '+' for MPESA API
            if formatted_number.startswith('+'):
                formatted_number = formatted_number[1:]

            if not formatted_number.startswith('254'):
                raise ValueError("MPESA requires Kenyan phone numbers (254XXX)")

            return formatted_number

        except ValueError as e:
            raise ValueError(f"Invalid MPESA phone number: {str(e)}")

    def validate_amount(self, amount):
        """Enhanced amount validation for MPESA"""
        try:
            amount_float = float(amount)

            if amount_float < 1:
                raise ValueError("Amount must be at least 1 KES")
            if amount_float > 150000:
                raise ValueError("Amount cannot exceed 150,000 KES")
            if amount_float != int(amount_float):
                raise ValueError("MPESA amounts must be whole numbers")

            return int(amount_float)

        except (ValueError, TypeError) as e:
            raise ValueError(f"Invalid amount: {str(e)}")

    def generate_password(self, timestamp):
        """Generate MPESA API password"""
        data_to_encode = f"{self.config.BUSINESS_SHORTCODE}{self.config.PASSKEY}{timestamp}"
        return base64.b64encode(data_to_encode.encode()).decode()

    def create_transaction_record(self, amount, phone_number, transaction_desc, paid_by):
        """Create a new transaction record in the database"""
        try:
            transaction = MpesaTransaction(
                amount=amount,
                paid_by=paid_by,
                phone_number=phone_number,
                transaction_desc=transaction_desc,
                payment_date=datetime.utcnow().date(),
                currency='KES'
            )

            db.session.add(transaction)
            db.session.commit()

            return transaction

        except Exception as e:
            db.session.rollback()
            raise Exception(f"Failed to create transaction record: {str(e)}")

    def update_transaction_status(self, transaction_id, status, result_code=None,
                                  result_desc=None, transaction_code=None, callback_data=None):
        """Update transaction status after callback"""
        try:
            transaction = MpesaTransaction.query.get(transaction_id)
            if not transaction:
                raise ValueError("Transaction not found")

            transaction.status = status
            if result_code is not None:
                transaction.result_code = result_code
            if result_desc is not None:
                transaction.result_desc = result_desc
            if transaction_code and transaction_code != transaction.transaction_code:
                transaction.transaction_code = transaction_code
            if callback_data:
                transaction.callback_data = json.dumps(callback_data)
                transaction.callback_received = True

            db.session.commit()
            return transaction

        except Exception as e:
            db.session.rollback()
            raise Exception(f"Failed to update transaction: {str(e)}")

    def initiate_stk_push(self, amount, phone_number, transaction_desc, paid_by, access_token=None):
        """
        Enhanced STK push with database transaction recording
        """
        try:
            # Validate inputs
            formatted_phone = self.validate_mpesa_phone_number(phone_number)
            validated_amount = self.validate_amount(amount)

            # Create transaction record
            transaction = self.create_transaction_record(
                amount=validated_amount,
                phone_number=formatted_phone,
                transaction_desc=transaction_desc,
                paid_by=paid_by
            )

            # Get access token
            if not access_token:
                access_token = self.token_manager.get_token()

            if not access_token:
                # Update transaction status if token fails
                self.update_transaction_status(
                    transaction.id,
                    'failed',
                    result_desc='Failed to obtain MPESA access token'
                )
                return {
                    'success': False,
                    'error': 'Failed to obtain MPESA access token',
                    'message': 'Authentication failed',
                    'transaction_id': transaction.id
                }

            # Prepare STK push request
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            password = self.generate_password(timestamp)

            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }

            payload = {
                "BusinessShortCode": self.config.BUSINESS_SHORTCODE,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": self.config.TRANSACTION_TYPE,
                "Amount": validated_amount,
                "PartyA": formatted_phone,
                "PartyB": self.config.BUSINESS_SHORTCODE,
                "PhoneNumber": formatted_phone,
                "CallBackURL": self.config.CALLBACK_URL,
                "AccountReference": transaction_desc[:12],
                "TransactionDesc": transaction_desc[:13]
            }

            response = requests.post(
                self.config.MPESA_STK_PUSH_URL,
                headers=headers,
                json=payload,
                timeout=30
            )
            response.raise_for_status()

            response_data = response.json()

            # Update transaction with MPESA response details
            transaction.merchant_request_id = response_data.get('MerchantRequestID')
            transaction.checkout_request_id = response_data.get('CheckoutRequestID')
            db.session.commit()

            return {
                'success': True,
                'data': response_data,
                'message': 'STK push initiated successfully',
                'transaction_id': transaction.id,
                'checkout_request_id': response_data.get('CheckoutRequestID'),
                'merchant_request_id': response_data.get('MerchantRequestID'),
                'response_code': response_data.get('ResponseCode'),
                'customer_message': response_data.get('CustomerMessage'),
                'transaction': transaction.to_dict()
            }

        except ValueError as e:
            # Validation errors
            return {
                'success': False,
                'error': str(e),
                'message': 'Validation failed'
            }
        except requests.exceptions.RequestException as e:
            error_message = f"MPESA API error: {e}"
            if hasattr(e, 'response') and e.response is not None:
                try:
                    error_detail = e.response.json()
                    error_message += f" - {error_detail}"
                except:
                    error_message += f" - Response: {e.response.text}"

            # Update transaction status on API failure
            if 'transaction' in locals():
                self.update_transaction_status(
                    transaction.id,
                    'failed',
                    result_desc=error_message
                )

            return {
                'success': False,
                'error': error_message,
                'message': 'Failed to initiate STK push',
                'transaction_id': transaction.id if 'transaction' in locals() else None
            }
        except Exception as e:
            # Update transaction status on general failure
            if 'transaction' in locals():
                self.update_transaction_status(
                    transaction.id,
                    'failed',
                    result_desc=f"Unexpected error: {str(e)}"
                )

            return {
                'success': False,
                'error': f"Unexpected error: {str(e)}",
                'message': 'Internal server error',
                'transaction_id': transaction.id if 'transaction' in locals() else None
            }


# Global instance
mpesa_utils = MPESAUtils()