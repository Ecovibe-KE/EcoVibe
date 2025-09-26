import os
from .contact import contact_bp
from .user import user_bp
from .auth import auth_bp
from .ping import ping_bp
from .user_management import user_management_bp

FLASK_API = os.getenv("FLASK_API", "/api")

API = FLASK_API


def register_routes(app):
    app.register_blueprint(ping_bp, url_prefix=API)
    app.register_blueprint(user_bp, url_prefix=API)
    app.register_blueprint(contact_bp, url_prefix=API)
    app.register_blueprint(auth_bp, url_prefix=API)
    app.register_blueprint(user_management_bp, url_prefix=API)
