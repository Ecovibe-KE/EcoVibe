from .contact import contact_bp
from .user import user_bp

API = "/api"


def register_routes(app):
    app.register_blueprint(user_bp, url_prefix=API)
    app.register_blueprint(contact_bp, url_prefix=API)
