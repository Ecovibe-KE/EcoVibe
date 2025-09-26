import os

import requests
import base64
import time
import threading
import json
import re
# from datetime import datetime, timezone
from datetime import datetime, timezone, timedelta

from dotenv import load_dotenv
from flask import current_app
from models.payment import MpesaTransaction, Payment, PaymentMethod
from models.invoice import Invoice  # Assuming you have Invoice model
from .mail_templates import send_mpesa_receipt_email, send_mpesa_stk_push_initiated_email
from .phone_validation import validate_phone_number, is_valid_phone
from models import db
load_dotenv()

class MPESATokenManager:
    def __init__(self):
        self.token = None
        self.expiry_time = None
        self.lock = threading.Lock()
        self.consumer_key = os.getenv("FLASK_MPESA_CONSUMER_KEY")
        self.consumer_secret = os.getenv("FLASK_MPESA_CONSUMER_SECRET")
        self.auth_url = os.getenv("FLASK_MPESA_AUTH_URL")
        self.mpesa_timeout = int(os.getenv("FLASK_MPESA_TIMEOUT"))

    def generate_access_token(self):
        """Generate MPESA API access token"""
        try:
            consumer_key = self.consumer_key
            consumer_secret = self.consumer_secret
            auth_url = self.auth_url

            if not all([consumer_key, consumer_secret, auth_url]):
                raise ValueError("MPESA configuration missing")

            credentials = f"{consumer_key}:{consumer_secret}"
            encoded_credentials = base64.b64encode(credentials.encode()).decode()

            headers = {
                'Authorization': f'Basic {encoded_credentials}',
                'Content-Type': 'application/json'
            }
            # print(f"authUrl: {auth_url} headers: {headers}")

            response = requests.get(auth_url, headers=headers, timeout=self.mpesa_timeout)
            response.raise_for_status()

            result = response.json()
            return result.get('access_token')

        except Exception as e:
            current_app.logger.error(f"Error generating access token: {e}")
            return None

    def is_token_valid(self):
        """Check if token is still valid"""
        if not self.token or not self.expiry_time:
            return False
        return datetime.now(timezone.utc) < (self.expiry_time - timedelta(minutes=5))

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
            self.expiry_time = datetime.now(timezone.utc) + timedelta(hours=1)
            current_app.logger.info(f"MPESA token refreshed. Expires at: {self.expiry_time}")
        return new_token


class MPESAUtility:
    def __init__(self):
        self.token_manager = MPESATokenManager()
        self.consumer_key = os.getenv("FLASK_MPESA_CONSUMER_KEY")
        self.consumer_secret = os.getenv("FLASK_MPESA_CONSUMER_SECRET")
        self.auth_url = os.getenv("FLASK_MPESA_AUTH_URL")
        self.mpesa_timeout = os.getenv("FLASK_MPESA_TIMEOUT")
        self.mpesa_passkey = os.getenv("FLASK_MPESA_PASSKEY")
        self.business_shortcode = os.getenv("FLASK_MPESA_BUSINESS_SHORTCODE")
        self.mpesa_callback_url = os.getenv("FLASK_MPESA_CALLBACK_URL")
        self.mpesa_stk_push_url = os.getenv("FLASK_MPESA_STK_PUSH_URL")

    def validate_mpesa_phone_number(self, phone_number, default_region="KE"):
        """
        Converts to MPESA format (254XXXXXXXXX)
        """
        try:
            # Use your existing validation function
            formatted_number = validate_phone_number(phone_number, default_region)

            # Convert to MPESA format (remove + and ensure 254 format)
            if formatted_number.startswith('+'):
                formatted_number = formatted_number[1:]

            # Ensure it's in 254 format for your model validation
            if formatted_number.startswith('0'):
                formatted_number = '254' + formatted_number[1:]
            elif formatted_number.startswith('7') and len(formatted_number) == 9:
                formatted_number = '254' + formatted_number

            # Validate against your model's regex pattern
            if not re.match(r"^254\d{9}$", formatted_number):
                raise ValueError("Phone number must be in format 254XXXXXXXXX")

            return formatted_number

        except ValueError as e:
            raise ValueError(f"Invalid MPESA phone number: {str(e)}")

    def validate_amount(self, amount):
        """Validate amount against your model constraints"""
        try:
            amount_int = int(amount)

            if amount_int <= 0:
                raise ValueError("Amount must be a positive integer")
            if amount_int > 150000:  # MPESA limit
                raise ValueError("Amount cannot exceed 150,000 KES")

            return amount_int

        except (ValueError, TypeError) as e:
            raise ValueError(f"Invalid amount: {str(e)}")

    def generate_password(self, timestamp):
        """Generate MPESA API password"""
        business_shortcode = self.business_shortcode
        passkey = self.mpesa_passkey

        data_to_encode = f"{business_shortcode}{passkey}{timestamp}"
        return base64.b64encode(data_to_encode.encode()).decode()

    def create_mpesa_transaction_record(self, amount, phone_number, invoice_id=None, description=""):
        try:
            # Create temporary transaction code (will be updated after callback)
            temp_transaction_code = f"TEMP{datetime.now().strftime('%H%M%S')}"

            transaction = MpesaTransaction(
                amount=amount,
                paid_by=phone_number,
                transaction_code=temp_transaction_code,
                payment_date=datetime.now(timezone.utc),
                currency="KES"
            )

            db.session.add(transaction)
            db.session.flush()  # Get the ID without committing

            # If invoice_id is provided, create a Payment record
            if invoice_id:
                payment = Payment(
                    invoice_id=invoice_id,
                    payment_method=PaymentMethod.MPESA,
                    payment_method_id=transaction.id
                )
                db.session.add(payment)

            db.session.commit()
            return transaction

        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Failed to create transaction record: {str(e)}")
            raise Exception(f"Failed to create transaction record: {str(e)}")

    def update_mpesa_transaction(self, checkout_request_id, result_code, result_desc,
                                 transaction_code=None, callback_data=None):
        """Update MPESA transaction after callback"""
        try:
            # For now, we'll find by temporary code pattern
            transaction = MpesaTransaction.query.filter(
                MpesaTransaction.transaction_code.like('TEMP%')
            ).order_by(MpesaTransaction.created_at.desc()).first()

            if not transaction:
                current_app.logger.error(f"Transaction not found for checkout: {checkout_request_id}")
                return None

            # Update transaction details
            if transaction_code:
                transaction.transaction_code = transaction_code

            # Update status based on result code
            if result_code == 0:
                transaction.status = 'completed'
            else:
                transaction.status = 'failed'

            transaction.result_code = result_code
            transaction.result_desc = result_desc

            db.session.commit()

            # Send email notification
            self.send_transaction_notification(transaction)

            return transaction

        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Failed to update transaction: {str(e)}")
            return None

    def send_transaction_notification(self, transaction):
        """Send email notification for transaction status"""
        try:
            if transaction.result_code == 0:
                threading.Thread(
                    target=send_mpesa_stk_push_initiated_email,
                    # args=(user.email, user.full_name, verify_link),
                    args=("levaksmaita@gmail.com", "user.full_name", "verify_link"),
                    daemon=True,
                ).start()
            else:
                # Failed payment
                threading.Thread(
                    target=send_mpesa_receipt_email,
                    # args=(user.email, user.full_name, verify_link),
                    args=("levaksmaita@gmail.com", "user.full_name", "verify_link"),
                    daemon=True,
                ).start()

        except Exception as e:
            current_app.logger.error(f"Failed to send notification: {str(e)}")

    def initiate_stk_push(self, amount, phone_number, invoice_id=None, description="Payment"):
        """
        Initiate STK push
        """
        try:
            # Validate inputs using your model constraints
            formatted_phone = self.validate_mpesa_phone_number(phone_number)
            validated_amount = self.validate_amount(amount)

            # Create transaction record
            transaction = self.create_mpesa_transaction_record(
                amount=validated_amount,
                phone_number=formatted_phone,
                invoice_id=invoice_id,
                description=description
            )

            # Get access token
            access_token = self.token_manager.get_token()
            if not access_token:
                raise Exception("Failed to obtain MPESA access token")

            # Prepare STK push request
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            password = self.generate_password(timestamp)

            print(f"description {description}")

            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }

            payload = {
                "BusinessShortCode":self.business_shortcode,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": validated_amount,
                "PartyA": formatted_phone,
                "PartyB": self.business_shortcode,
                "PhoneNumber": formatted_phone,
                "CallBackURL": self.mpesa_callback_url,
                "AccountReference": "ECOVIBE",
                "TransactionDesc": description
            }

            stk_push_url = self.mpesa_stk_push_url
            response = requests.request("POST", stk_push_url,
                                        headers=headers, json=payload)

            response.raise_for_status()

            response_data = response.json()
            print(f"response {response_data}")

            # Store MPESA request IDs for callback matching
            # transaction.merchant_request_id = response_data.get('MerchantRequestID')
            # transaction.checkout_request_id = response_data.get('CheckoutRequestID')
            db.session.commit()

            self.send_transaction_notification(response_data)

            return {
                'success': True,
                'transaction_id': 1,
                'checkout_request_id': response_data.get('CheckoutRequestID'),
                'merchant_request_id': response_data.get('MerchantRequestID'),
                'customer_message': response_data.get('CustomerMessage'),
                'transaction': 1
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
            if hasattr(e, 'response') and e.response:
                try:
                    error_detail = e.response.json()
                    error_message += f" - {error_detail}"
                except:
                    error_message += f" - Response: {e.response.text}"

            current_app.logger.error(error_message)
            return {
                'success': False,
                'error': error_message,
                'message': 'Failed to initiate STK push'
            }
        except Exception as e:
            current_app.logger.error(f"Unexpected error: {str(e)}")
            return {
                'success': False,
                'error': f"Unexpected error: {str(e)}",
                'message': 'Internal server error'
            }


# Global instance
mpesa_utility = MPESAUtility()