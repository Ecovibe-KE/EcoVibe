from flask import Blueprint, request, jsonify
from flask_restful import Api, Resource
from email_validator import validate_email, EmailNotValidError
from utils.responses import restful_response

from models import db
from models.newsletter_subscriber import NewsletterSubscriber


newsletter_bp = Blueprint("newsletter", __name__)

api = Api(newsletter_bp)


class NewsletterResource(Resource):
    def post(self):
        """Handle newsletter subscription"""
        data = request.get_json() or {}
        if not data:
            return restful_response(
                status="error", message="No data provided", status_code=400
            )

        email = data.get("email", "").strip()
        if not email:
            return restful_response(
                status="error", message="Email is required", status_code=400
            )

        try:
            validate_email(email)
        except EmailNotValidError:
            return restful_response(
                status="error", message="Invalid email format", status_code=400
            )

        # Check if the email is already subscribed
        existing_subscriber = NewsletterSubscriber.query.filter_by(
            email=email.lower()
        ).first()
        if existing_subscriber:
            return restful_response(
                status="error", message="Email is already subscribed", status_code=400
            )

        # Create a new newsletter subscriber
        new_subscriber = NewsletterSubscriber(email=email.lower())
        db.session.add(new_subscriber)
        db.session.commit()

        return restful_response(
            status="success",
            message="Newsletter subscription successful",
            data=new_subscriber.to_dict(),
            status_code=201,
        )

    def get(self):
        """Retrieve all newsletter subscribers"""
        subscribers = NewsletterSubscriber.query.all()
        subscribers_data = [subscriber.to_dict() for subscriber in subscribers]
        return restful_response(
            status="success",
            data=subscribers_data,
            message="Newsletter subscribers retrieved successfully",
            status_code=200,
        )

    def delete(self):
        """Delete a newsletter subscriber by email"""
        data = request.get_json() or {}
        if not data:
            return restful_response(
                status="error", message="No data provided", status_code=400
            )

        email = data.get("email", "").strip()
        if not email:
            return restful_response(
                status="error", message="Email is required", status_code=400
            )

        subscriber = NewsletterSubscriber.query.filter_by(email=email.lower()).first()
        if not subscriber:
            return restful_response(
                status="error", message="Subscriber not found", status_code=404
            )

        db.session.delete(subscriber)
        db.session.commit()

        return restful_response(
            status="success", message="Subscriber removed successfully", status_code=200
        )


api.add_resource(NewsletterResource, "/newsletter-subscribers")
