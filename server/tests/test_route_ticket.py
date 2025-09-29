import pytest
from flask_jwt_extended import create_access_token
from models import db
from models.user import User, Role, AccountStatus
from models.ticket import Ticket, TicketStatus
from models.ticket_message import TicketMessage


@pytest.fixture
def sample_users(session):
    """Create sample users for testing"""
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

    session.add_all(users)
    session.commit()

    return {
        "client": session.query(User).filter_by(email="client@test.com").first(),
        "admin": session.query(User).filter_by(email="admin@test.com").first(),

        "super_admin": session.query(User)
        .filter_by(email="superadmin@test.com")
        .first(),

        "client2": session.query(User).filter_by(email="client2@test.com").first(),
    }


@pytest.fixture
def sample_tickets(session, sample_users):
    """Create sample tickets for testing"""
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
    session.add_all([ticket1, ticket2, ticket3])
    session.commit()

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
    session.add_all(messages)
    session.commit()

    return list(session.query(Ticket).all())


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
