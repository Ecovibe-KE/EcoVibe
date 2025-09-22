from .contact import contact_bp
from .user import user_bp


def register_routes(app):
    app.register_blueprint(user_bp, url_prefix="/api")
    app.register_blueprint(contact_bp, url_prefix="/api")
