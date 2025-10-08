from flask import Flask, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from routes import register_routes
from models import db
from dotenv import load_dotenv
import os
from flask_jwt_extended import JWTManager
import re
from datetime import timedelta

load_dotenv()

migrate = Migrate()
jwt = JWTManager()


def create_app(config_name="development"):
    """
    Create and configure a Flask application instance.
    """
    app = Flask(__name__)
    if config_name == "testing":
        app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
            "FLASK_TEST_SQLALCHEMY_DATABASE_URI"
        )
        app.config["TESTING"] = True

    else:
        app.config.from_prefixed_env()

    # Load JWT secret key
    app.config["JWT_SECRET_KEY"] = os.getenv("FLASK_JWT_SECRET_KEY", "super-secret")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=360)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7)

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # ---------------------------
    # JWT error handlers
    # ---------------------------

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return (
            jsonify({"status": "error", "message": "Token has expired", "data": None}),
            401,
        )

    @jwt.invalid_token_loader
    def invalid_token_callback(reason):
        return (
            jsonify(
                {"status": "error", "message": f"Invalid token: {reason}", "data": None}
            ),
            401,
        )

    @jwt.unauthorized_loader
    def missing_token_callback(reason):
        return (
            jsonify(
                {"status": "error", "message": f"Missing token: {reason}", "data": None}
            ),
            401,
        )

    from models import (
        blog,
        booking,
        comment,
        document,
        invoice,
        newsletter_subscriber,
        payment,
        service,
        ticket_message,
        ticket,
        token,
        user,
        master,
    )

    # Register Blueprints
    register_routes(app)

    # CORs setup
    netlify_pr_regex = r"^https:\/\/deploy-preview-\d+--ecovibe-develop\.netlify\.app$"
    firebase_pr_regex = r"^https:\/\/.*pr-?\d+.*\.web\.app\/?$"
    dynamic_pr_cors_origins = [
        re.compile(netlify_pr_regex),
        re.compile(firebase_pr_regex),
    ]
    origins = (
        os.getenv("FLASK_CORS_ALLOWED_ORIGINS").split(",") + dynamic_pr_cors_origins
    )
    CORS(
        app,
        resources={r"/api/*": {"origins": origins}, r"/verify": {"origins": origins}},
        supports_credentials=True,
    )
    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5555)))
