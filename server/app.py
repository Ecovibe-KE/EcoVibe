from flask import Flask
from flask_migrate import Migrate
from routes import register_routes
from models import db
from dotenv import load_dotenv
import os

load_dotenv()

migrate = Migrate()


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

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5555)))
