import logging
import os
import re
import threading

from dotenv import load_dotenv
from email_validator import validate_email, EmailNotValidError
from flask import Blueprint, request, jsonify
from flask_restful import Api, Resource

from utils.mail_templates import send_contact_email
from utils.phone_validation import validate_phone_number, is_valid_phone

logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

# Create the blueprint
contact_bp = Blueprint("contact", __name__)

api = Api(contact_bp)
FLASK_ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
FLASK_SMTP_USER = os.getenv("SMTP_USER")


class ContactListResource(Resource):
    def post(self):
        """Handle contact form submissions"""
        try:
            data = request.get_json() or {}
            if not data:
                return {"error": "No data provided"}, 400

            sanitized_data = {
                key: sanitize_input(value)
                for key, value in data.items()
                if isinstance(value, str)
            }

            required_fields = ["name", "phone", "industry", "email", "message"]
            missing_fields = [
                field for field in required_fields if not sanitized_data.get(field)
            ]
            if missing_fields:
                return {
                    "error": f"Missing required fields: {', '.join(missing_fields)}"
                }, 400

            try:
                validate_email(sanitized_data["email"])
            except EmailNotValidError:
                return {"error": "Invalid email format"}, 400

            # Validate phone number
            if not is_valid_phone(sanitized_data["phone"]):
                return {"error": "Invalid phone number format"}, 400

            # Set length limits
            if len(sanitized_data.get("message", "")) > 1000:
                return {"error": "Message too long"}, 400

            if len(sanitized_data.get("name", "")) > 100:
                return {"error": "Name too long"}, 400

            email_thread = threading.Thread(
                target=send_emails_in_background, args=(data,)
            )
            email_thread.daemon = True  # Thread will be killed when main thread exits
            email_thread.start()

            return {
                "message": "Contact form submitted successfully. "
                "You will receive a confirmation email shortly."
            }, 200

        except Exception as e:
            logger.error(f"Unexpected error in send_contact_form: {str(e)}")
            return {"error": "Internal server error"}, 500


def send_emails_in_background(data):
    """Background function to send emails"""
    try:
        # Send admin notification
        admin_email = os.getenv("ADMIN_EMAIL", FLASK_SMTP_USER)
        send_contact_email(admin_email, "admin", data)

        # Send user confirmation
        send_contact_email(data["email"], "client", data)
    except Exception as e:
        print(f"Error sending emails: {e}")


def sanitize_input(input_string):
    """Sanitize input to prevent XSS and injection attacks"""
    if not isinstance(input_string, str):
        return ""
    # Remove potentially dangerous characters
    return re.sub(r'[<>"\'%;()&]', "", input_string).strip()


api.add_resource(ContactListResource, "/contact")
