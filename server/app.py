from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS
from routes import register_routes
from models import db
from dotenv import load_dotenv
import os
from flask_jwt_extended import JWTManager

load_dotenv()

migrate = Migrate()
jwt = JWTManager()


def create_app(config_name="development"):
    """
    Create and configure a Flask application instance.

    Parameters:
        config_name (str): Configuration profile to use. If "testing", the app uses
            the FLASK_TEST_SQLALCHEMY_DATABASE_URI environment variable and enables
            Flask's TESTING mode; otherwise configuration is loaded from
            environment variables using Flask's prefixed env loader.

    Returns:
        flask.Flask: A configured Flask application with the SQLAlchemy extension
        initialized, Flask-Migrate bound, application models imported, and routes
        registered.
    """
    app = Flask(__name__)
    if config_name == "testing":
        app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
            "FLASK_TEST_SQLALCHEMY_DATABASE_URI"
        )
        app.config["TESTING"] = True
    else:
        app.config.from_prefixed_env()

    # Load  Jwt secret key
    app.config["JWT_SECRET_KEY"] = os.getenv("FLASK_JWT_SECRET_KEY", "super-secret")

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

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
    )

    # Register Blueprints
    register_routes(app)

    # CORs setup
    origins = os.getenv("FLASK_CORS_ALLOWED_ORIGINS", "").split(",")
    CORS(
        app,
        resources={r"/api/*": {"origins": origins}, r"/verify": {"origins": origins}},
        supports_credentials=True,
    )
    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5555)))
