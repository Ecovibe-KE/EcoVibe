from .user import user_bp
from .ping import ping_bp


API_PREFIX = "/api"


def register_routes(app):
    app.register_blueprint(ping_bp, url_prefix=API_PREFIX)
    app.register_blueprint(user_bp, url_prefix=API_PREFIX)
