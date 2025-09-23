from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS
from routes import register_routes
from models import db
from config import config_by_name
import os

migrate = Migrate()


def create_app(config_name=None):
    """
    Create and configure a Flask application instance.

    Parameters:
        config_name (str): Optional: The configuration profile to use ('development',
            'staging', 'production', 'testing'). If not provided, it defaults to the
            value of the FLASK_APP_ENV environment variable, or 'development'.

    Returns:
        flask.Flask: A configured Flask application.
    """
    if config_name is None:
        config_name = os.getenv("FLASK_APP_ENV", "development")

    app = Flask(__name__)

    # Load configuration from the config object
    app.config.from_object(config_by_name[config_name])

    db.init_app(app)
    migrate.init_app(app, db)
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

    register_routes(app)
    # Use the origins from the config object
    origins = app.config["FLASK_CORS_ALLOWED_ORIGINS"]
    CORS(app, resources={r"/api/*": {"origins": origins}}, supports_credentials=True)
    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5555)))
