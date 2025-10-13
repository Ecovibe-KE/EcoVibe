import logging
import os
import re
import threading
from datetime import datetime

from dotenv import load_dotenv
from email_validator import validate_email, EmailNotValidError
from flask import Blueprint, request, jsonify
from flask_restful import Api, Resource
from flask_cors import CORS

from utils.mail_templates import send_quote_email
from utils.phone_validation import validate_phone_number, is_valid_phone

# Load environment variables
load_dotenv()

logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

# Create the blueprint
quote_bp = Blueprint("quote", __name__)
CORS(quote_bp)  # Enable CORS for the quote routes

api = Api(quote_bp)
FLASK_ADMIN_EMAIL = os.getenv("FLASK_ADMIN_EMAIL")
FLASK_SMTP_USER = os.getenv("FLASK_SMTP_USER")


class QuoteListResource(Resource):
    def post(self):
        """Handle quote request submissions"""
        try:
            data = request.get_json() or {}
            logger.info(f"Received quote request: {data}")

            if not data:
                return {"error": "No data provided"}, 400

            # Sanitize all string inputs
            sanitized_data = {
                key: sanitize_input(value) if isinstance(value, str) else value
                for key, value in data.items()
            }

            # Validate required fields based on frontend form
            required_fields = ["name", "email", "phone", "service"]
            missing_fields = [
                field for field in required_fields if not sanitized_data.get(field)
            ]

            if missing_fields:
                return {
                    "error": f"Missing required fields: {', '.join(missing_fields)}"
                }, 400

            # Validate email format
            try:
                validate_email(sanitized_data["email"])
            except EmailNotValidError:
                return {"error": "Invalid email format"}, 400

            # Validate phone number
            if not is_valid_phone(sanitized_data["phone"]):
                return {"error": "Invalid phone number format"}, 400

            # Set length limits for all fields
            field_limits = {
                "name": 100,
                "email": 100,
                "phone": 20,
                "company": 100,
                "service": 100,
                "projectDetails": 2000
            }

            for field, limit in field_limits.items():
                if sanitized_data.get(field) and len(sanitized_data[field]) > limit:
                    return {"error": f"{field} too long (max {limit} characters)"}, 400

            # Add timestamp if not provided from frontend
            if not sanitized_data.get("timestamp"):
                sanitized_data["timestamp"] = datetime.utcnow().isoformat()

            # Start background email process
            email_thread = threading.Thread(
                target=send_emails_in_background, args=(sanitized_data,)
            )
            email_thread.daemon = True
            email_thread.start()

            return {
                "message": "Quote request submitted successfully. "
                           "We will get back to you within 24 hours.",
                "success": True
            }, 200

        except Exception as e:
            logger.error(f"Unexpected error in quote submission: {str(e)}")
            return {"error": "Internal server error. Please try again later."}, 500


def send_emails_in_background(data):
    """Background function to send emails to admin and client"""
    try:
        # Send admin notification
        admin_email = os.getenv("FLASK_ADMIN_EMAIL", FLASK_SMTP_USER)
        if admin_email:
            send_quote_email(admin_email, "admin", data)
            logger.info(f"Admin notification sent to {admin_email}")
        else:
            logger.warning("No admin email configured")

        # Send client confirmation
        client_email = data.get("email")
        if client_email:
            send_quote_email(client_email, "client", data)
            logger.info(f"Confirmation email sent to {client_email}")
        else:
            logger.warning("No client email provided for confirmation")

    except Exception as e:
        logger.error(f"Error sending emails in background: {e}")


def sanitize_input(input_string):
    """Sanitize input to prevent XSS and injection attacks"""
    if not isinstance(input_string, str):
        return ""
    # Remove potentially dangerous characters but preserve essential punctuation
    return re.sub(r'[<>"\';()&]', "", input_string).strip()


# Add the resource with the correct endpoint
api.add_resource(QuoteListResource, "/quote")
