# contact.py
import logging
import os

from flask import Blueprint, request, jsonify
import re
from flask_restful import Api, Resource
from server.utils.mail_templates import send_contact_email
from dotenv import load_dotenv

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

# Create the blueprint
contact_bp = Blueprint('contact', __name__, url_prefix="/api")

api = Api(contact_bp)
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
SMTP_USER = os.getenv("SMTP_USER")


class ContactListResource(Resource):
    def post(self):
        """Handle contact form submissions"""
        try:
            data = request.get_json() or {}
            if not data:
                return {"error": "No data provided"}, 400

            required_fields = ['name', 'phone', 'industry', 'email', 'message']
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                return {"error": f"Missing required fields: {', '.join(missing_fields)}"}, 400

            name = data.get("name")
            industry = data.get("industry")
            email = data.get("email")
            phone = data.get("phone")
            message = data.get("message")
            print(name, industry, email, phone, message)


            # Send admin notification
            admin_email = os.getenv("ADMIN_EMAIL", SMTP_USER)
            message1 = send_contact_email(admin_email, 'admin', data)

            # Send user confirmation
            message2 = send_contact_email(data['email'], 'client', data)
            return {"message": "Contact form submitted successfully"}, 200

        except Exception as e:
            logger.error(f"Unexpected error in send_contact_form: {str(e)}")
            return {"error": "Internal server error"}, 500



api.add_resource(ContactListResource, '/contact')
