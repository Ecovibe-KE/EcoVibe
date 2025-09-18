from flask import Flask
import os
from .models import db  # SQLAlchemy instance
from flask_restful import Api
from .routes.user import Register


def create_app():
    app = Flask(__name__)

    # Configure DB URL
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    else:
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:////home/edith/Ecovibe/EcoVibe/server/app.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Init extensions
    db.init_app(app)
    api = Api(app)
    api.add_resource(Register, "/register")

    @app.route("/")
    def home():
        return "EcoVibe Completed Website!"

    with app.app_context():
        db.create_all()

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
