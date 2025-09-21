from flask import Flask
from flask_migrate import Migrate
from routes import register_routes
from models import db
from dotenv import load_dotenv
import os

load_dotenv()

migrate = Migrate()


def create_app():
    app = Flask(__name__)
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
