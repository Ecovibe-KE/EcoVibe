import sys
import os
from pathlib import Path

from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from models import db
from dotenv import load_dotenv

current_dir = Path(__file__).parent
parent_dir = current_dir.parent
sys.path.insert(0, str(parent_dir))

from routes import register_routes

load_dotenv()

migrate = Migrate()


def create_app():
    app = Flask(__name__)
    app.config.from_prefixed_env()
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("SQLALCHEMY_DATABASE_URI")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = os.getenv("SQLALCHEMY_TRACK_MODIFICATIONS", "False") == "True"

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
    CORS(app)
    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5555)))
