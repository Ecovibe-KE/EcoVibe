import os
from .contact import contact_bp
from .mpesa import mpesa_bp
from .auth import auth_bp
from .ping import ping_bp
from .blog import blogs_bp
from .newsletter import newsletter_bp
from .ticket import tickets_bp
from .document import document_bp
from .payment import payment_bp
from .dashboard import dashboard_bp


from .user_management import user_management_bp

FLASK_API = os.getenv("FLASK_API", "/api")

API = FLASK_API


def register_routes(app):
    app.register_blueprint(ping_bp, url_prefix=API)
    app.register_blueprint(contact_bp, url_prefix=API)
    app.register_blueprint(auth_bp, url_prefix=API)
    app.register_blueprint(mpesa_bp, url_prefix=API)
    app.register_blueprint(blogs_bp, url_prefix=API)
    app.register_blueprint(user_management_bp, url_prefix=API)
    app.register_blueprint(newsletter_bp, url_prefix=API)
    app.register_blueprint(tickets_bp, url_prefix=API)
    app.register_blueprint(document_bp, url_prefix=API)
    app.register_blueprint(payment_bp, url_prefix=API)
    app.register_blueprint(dashboard_bp, url_prefix=API)
