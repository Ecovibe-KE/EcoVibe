import requests
import base64
import os
from datetime import datetime, timezone
import json
from flask import current_app
from models import db
from models.payment import MpesaTransaction


class MpesaTokenManager:
    def __init__(self):
        self.token = None
        self.expiry_time = None

    def get_token(self):
        """Get valid access token from Daraja API"""
        if self.token and self.is_token_valid():
            return self.token

        consumer_key = os.getenv("FLASK_MPESA_CONSUMER_KEY")
        consumer_secret = os.getenv("FLASK_MPESA_CONSUMER_SECRET")
        auth_url = os.getenv("FLASK_MPESA_AUTH_URL")
        mpesa_timeout = int(os.getenv("FLASK_MPESA_TIMEOUT", "30"))

        if not all([consumer_key, consumer_secret, auth_url]):
            raise Exception("MPESA environment variables not properly configured")

        try:
            # Encode credentials
            credentials = f"{consumer_key}:{consumer_secret}"
            encoded_credentials = base64.b64encode(credentials.encode()).decode()

            headers = {"Authorization": f"Basic {encoded_credentials}"}
            response = requests.get(auth_url, headers=headers, timeout=mpesa_timeout)
            response.raise_for_status()

            token_data = response.json()
            self.token = token_data.get("access_token")

            # FIX: Convert expires_in to integer safely
            expires_in = token_data.get("expires_in", 3600)
            try:
                expires_in = int(expires_in)
            except (ValueError, TypeError):
                expires_in = 3600

            # Set expiry time with safety margin
            self.expiry_time = datetime.now(timezone.utc).timestamp() + expires_in - 60
            return self.token

        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to get MPESA token: {str(e)}")

    def is_token_valid(self):
        """Check if token is still valid"""
        if not self.token or not self.expiry_time:
            return False
        return datetime.now(timezone.utc).timestamp() < self.expiry_time


class MpesaUtility:
    def __init__(self):
        self.token_manager = MpesaTokenManager()

    def get_mpesa_credentials(self):
        """Get MPESA API credentials from environment variables"""
        business_shortcode = os.getenv("FLASK_MPESA_BUSINESS_SHORTCODE")

        if business_shortcode:
            business_shortcode = str(business_shortcode)

        return {
            "business_shortcode": business_shortcode,
            "passkey": os.getenv("FLASK_MPESA_PASSKEY"),
            "callback_url": os.getenv("FLASK_MPESA_CALLBACK_URL"),
            "stk_push_url": os.getenv("FLASK_MPESA_STK_PUSH_URL"),
            "query_url": os.getenv("FLASK_MPESA_QUERY_URL"),
            "timeout": int(os.getenv("FLASK_MPESA_TIMEOUT", "30")),
        }

    def generate_password(self, business_shortcode, passkey):
        """Generate Lipa Na M-PESA Online Password"""
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")

        business_shortcode_str = str(business_shortcode)
        passkey_str = str(passkey)
        data_to_encode = business_shortcode_str + passkey_str + timestamp
        encoded_string = base64.b64encode(data_to_encode.encode()).decode()
        return encoded_string, timestamp

    def initiate_stk_push(
        self, amount, phone_number, invoice_id=None, description="Payment"
    ):
        """
        Initiate STK push to customer phone
        """
        try:
            # Get access token
            access_token = self.token_manager.get_token()

            # Get MPESA credentials from environment
            credentials = self.get_mpesa_credentials()
            business_shortcode = credentials["business_shortcode"]
            passkey = credentials["passkey"]
            callback_url = credentials["callback_url"]
            stk_push_url = credentials["stk_push_url"]
            timeout = credentials["timeout"]

            if not all([business_shortcode, passkey, callback_url, stk_push_url]):
                missing = []
                if not business_shortcode:
                    missing.append("FLASK_MPESA_BUSINESS_SHORTCODE")
                if not passkey:
                    missing.append("FLASK_MPESA_PASSKEY")
                if not callback_url:
                    missing.append("FLASK_MPESA_CALLBACK_URL")
                if not stk_push_url:
                    missing.append("FLASK_MPESA_STK_PUSH_URL")
                raise Exception(
                    f"Missing MPESA environment variables: {', '.join(missing)}"
                )

            # Generate password and timestamp
            password, timestamp = self.generate_password(business_shortcode, passkey)

            # print(f"callback_url{callback_url}")
            # Prepare request payload
            payload = {
                "BusinessShortCode": business_shortcode,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": int(amount),
                "PartyA": str(phone_number),
                "PartyB": business_shortcode,
                "PhoneNumber": str(phone_number),
                "CallBackURL": callback_url,
                "AccountReference": (
                    f"Invoice{invoice_id}" if invoice_id else "Ecovibe payment"
                ),
                "TransactionDesc": description[:20],
            }

            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            }

            # print(f"Payload {payload}")
            # print(f"headers {headers}")

            # Make API request
            response = requests.post(
                stk_push_url, json=payload, headers=headers, timeout=timeout
            )
            response.raise_for_status()

            response_data = response.json()

            # Check if request was successful
            if response_data.get("ResponseCode") == "0":
                return {
                    "success": True,
                    "MerchantRequestID": response_data.get("MerchantRequestID"),
                    "CheckoutRequestID": response_data.get("CheckoutRequestID"),
                    "ResponseCode": response_data.get("ResponseCode"),
                    "ResponseDescription": response_data.get("ResponseDescription"),
                    "CustomerMessage": response_data.get("CustomerMessage"),
                }
            else:
                error_message = response_data.get(
                    "ResponseDescription", "STK push failed"
                )
                return {
                    "success": False,
                    "error": error_message,
                    "response_code": response_data.get("ResponseCode"),
                }

        except requests.exceptions.RequestException as e:
            # Extract error message from response if available
            error_msg = str(e)
            if hasattr(e, "response") and e.response is not None:
                try:
                    error_data = e.response.json()
                    error_msg = error_data.get(
                        "errorMessage", error_data.get("errorMessage", str(e))
                    )
                except Exception as e:
                    error_msg = (
                        getattr(e, "response", None).text
                        if hasattr(e, "response")
                        else str(e)
                    )

            return {"success": False, "error": f"STK push failed: {error_msg}"}
        except Exception as e:
            return {"success": False, "error": f"Error initiating STK push: {str(e)}"}

    def update_mpesa_transaction(
        self,
        checkout_request_id,
        result_code,
        result_desc,
        transaction_code=None,
        callback_data=None,
    ):
        """
        Update MpesaTransaction with callback data
        """
        try:
            transaction = MpesaTransaction.query.filter_by(
                checkout_request_id=checkout_request_id
            ).first()

            if not transaction:
                return None

            # Update transaction details
            transaction.result_code = result_code
            transaction.result_desc = result_desc
            transaction.mpesa_receipt_number = transaction_code
            transaction.raw_callback_data = callback_data
            transaction.callback_received = True
            transaction.callback_received_at = datetime.now(timezone.utc)

            # Update status based on result code
            if str(result_code) == '0':
                transaction.status = "completed"
                if transaction_code:
                    transaction.transaction_code = transaction_code
            else:
                transaction.status = "failed"

            db.session.commit()

            return transaction

        except Exception:
            current_app.logger.exception(
                f"Error updating MPESA transaction "
                f"{checkout_request_id}"
            )
            db.session.rollback()
            raise

    def check_transaction_status(self, checkout_request_id):
        """
        Check status of a transaction using Daraja API
        """
        try:
            access_token = self.token_manager.get_token()
            credentials = self.get_mpesa_credentials()
            business_shortcode = credentials["business_shortcode"]
            passkey = credentials["passkey"]
            query_url = credentials["query_url"]
            timeout = credentials["timeout"]

            if not all([business_shortcode, passkey, query_url]):
                raise Exception("MPESA query environment variables not configured")

            password, timestamp = self.generate_password(business_shortcode, passkey)

            payload = {
                "BusinessShortCode": business_shortcode,
                "Password": password,
                "Timestamp": timestamp,
                "CheckoutRequestID": checkout_request_id,
            }

            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            }

            response = requests.post(
                query_url, json=payload, headers=headers, timeout=timeout
            )
            response_data = response.json()

            if response_data.get("ResponseCode") == "0":
                return {
                    "success": True,
                    "result_code": response_data.get("ResultCode"),
                    "result_desc": response_data.get("ResultDesc"),
                }
            else:
                return {
                    "success": False,
                    "error": response_data.get("ResponseDescription"),
                }

        except Exception as e:
            return {"success": False, "error": str(e)}


# Global instance
mpesa_utility = MpesaUtility()
