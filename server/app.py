from flask import Flask
import os
from .models import db  # SQLAlchemy instance
from .routes.user import bp

<<<<<<< HEAD

def create_app():
    app = Flask(__name__)

    # Configure DB URL
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    else:
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:////home/edith/EcoVibe/server/app.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Init extensions
    db.init_app(app)

    # Register blueprint
    app.register_blueprint(bp, url_prefix="/api")

    @app.route("/")
    def home():
        return "EcoVibe Completed Website!"

    with app.app_context():
        db.create_all()

    return app
=======
app = Flask(__name__)
app.config.from_prefixed_env()


@app.route("/")
def home():
    return "EcoVibe Completed Website!."
>>>>>>> e033de5dd711c8ebbea4994602e5fbb70f6d335a


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5555)
