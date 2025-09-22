from .user import user_bp
from .ping import ping_bp


def register_routes(app):
    app.register_blueprint(ping_bp, url_prefix="/api")
    app.register_blueprint(user_bp, url_prefix="/api")
