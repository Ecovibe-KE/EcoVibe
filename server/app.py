from flask import Flask
from flask_migrate import Migrate
from routes import register_routes
from models import db

import os
from dotenv import load_dotenv

load_dotenv()

migrate = Migrate()


def create_app(config_name="development"):
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
        blogs,
        bookings,
        comment,
        document,
        invoices,
        newsletter_subscribers,
        payments,
        services,
        ticket_messages,
        tickets,
        tokens,
        user,
    )

    register_routes(app)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5555)))
