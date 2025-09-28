import pytest
from flask import Flask
from flask_jwt_extended import create_access_token
from models import db
from models.user import User, Role, AccountStatus
from models.ticket import Ticket, TicketStatus
from models.ticket_message import TicketMessage
from routes.ticket import tickets_bp


@pytest.fixture
def app():
    """Create test Flask application"""
    app = Flask(__name__)
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    app.config["JWT_SECRET_KEY"] = "test-secret-key"
    app.config["WTF_CSRF_ENABLED"] = False

    # Initialize extensions
    db.init_app(app)

    from flask_jwt_extended import JWTManager

    JWTManager(app)

    # Register blueprint
    app.register_blueprint(tickets_bp, url_prefix="/api")

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()


@pytest.fixture
def sample_users(app):
    """Create sample users for testing"""
    with app.app_context():
        users = [
            User(
                full_name="John Doe",
                email="client@test.com",
                phone_number="+254712345678",
                industry="Technology",
                role=Role.CLIENT,
                account_status=AccountStatus.ACTIVE,
            ),
            User(
                full_name="Jane Admin",
                email="admin@test.com",
                phone_number="+254712345679",
                industry="Management",
                role=Role.ADMIN,
                account_status=AccountStatus.ACTIVE,
            ),
            User(
                full_name="Super Admin",
                email="superadmin@test.com",
                phone_number="+254712345680",
                industry="Management",
                role=Role.SUPER_ADMIN,
                account_status=AccountStatus.ACTIVE,
            ),
            User(
                full_name="Alice Client",
                email="client2@test.com",
                phone_number="+254712345681",
                industry="Finance",
                role=Role.CLIENT,
                account_status=AccountStatus.ACTIVE,
            ),
        ]
        for u in users:
            u.set_password("Password123")

        db.session.add_all(users)
        db.session.commit()

        # Re-query to avoid DetachedInstanceError
        return {
            "client": db.session.query(User).filter_by(email="client@test.com").first(),
            "admin": db.session.query(User).filter_by(email="admin@test.com").first(),
            "super_admin": db.session.query(User)
            .filter_by(email="superadmin@test.com")
            .first(),
            "client2": db.session.query(User)
            .filter_by(email="client2@test.com")
            .first(),
        }


@pytest.fixture
def sample_tickets(app, sample_users):
    """Create sample tickets for testing"""
    with app.app_context():
        ticket1 = Ticket(
            client_id=sample_users["client"].id,
            admin_id=sample_users["admin"].id,
            subject="Test Ticket 1",
            status=TicketStatus.OPEN,
        )
        ticket2 = Ticket(
            client_id=sample_users["client"].id,
            admin_id=sample_users["admin"].id,
            subject="Test Ticket 2",
            status=TicketStatus.CLOSED,
        )
        ticket3 = Ticket(
            client_id=sample_users["client2"].id,
            admin_id=sample_users["super_admin"].id,
            subject="Test Ticket 3",
            status=TicketStatus.IN_PROGRESS,
        )
        db.session.add_all([ticket1, ticket2, ticket3])
        db.session.commit()

        messages = [
            TicketMessage(
                ticket_id=ticket1.id,
                sender_id=sample_users["client"].id,
                body="Initial message for ticket 1",
            ),
            TicketMessage(
                ticket_id=ticket1.id,
                sender_id=sample_users["admin"].id,
                body="Admin reply to ticket 1",
            ),
            TicketMessage(
                ticket_id=ticket2.id,
                sender_id=sample_users["client"].id,
                body="Initial message for ticket 2",
            ),
        ]
        db.session.add_all(messages)
        db.session.commit()

        # Re-query to avoid DetachedInstanceError
        return list(db.session.query(Ticket).all())


def create_jwt_token(app, user_id, role):
    """Helper function to create JWT token"""
    with app.app_context():
        additional_claims = {"role": role.value}
        return create_access_token(
            identity=user_id,
            additional_claims=additional_claims,
            expires_delta=None,  # no expiration during tests
            fresh=True,
        )
