import pytest
from app import create_app, db as _db
import sys
import os
from models.user import User, Role
from models.service import Service, ServiceStatus
from models.booking import Booking, BookingStatus
from models.invoice import Invoice, InvoiceStatus

root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)


@pytest.fixture(autouse=True)
def patch_email(monkeypatch):
    """Disable actual email sending for all tests."""
    monkeypatch.setattr(
        "utils.mail_templates.send_verification_email",
        lambda *a, **k: None,
    )


@pytest.fixture(scope="session")
def app(request):
    """Session-wide test Flask application."""
    app = create_app("testing")
    ctx = app.app_context()
    ctx.push()

    def teardown():
        ctx.pop()

    request.addfinalizer(teardown)
    return app


@pytest.fixture(scope="function")
def client(app):
    """A test client for the app."""
    return app.test_client()


@pytest.fixture(scope="function")
def db(app, request):
    """Session-wide test database."""
    _db.app = app
    _db.create_all()

    def teardown():
        _db.drop_all()

    request.addfinalizer(teardown)
    return _db


@pytest.fixture(scope="function")
def session(db, request):
    """Creates a new database session for a test."""
    connection = db.engine.connect()
    transaction = connection.begin()

    options = dict(bind=connection, binds={})
    session = db._make_scoped_session(options=options)

    db.session = session

    def teardown():
        transaction.rollback()
        connection.close()
        session.remove()

    request.addfinalizer(teardown)
    return session


@pytest.fixture
def create_test_user(db):
    """Fixture to create test users"""

    def _create_user(email, role, industry="Test Industry"):
        user = User(
            full_name="Test User",
            email=email,
            phone_number="+254712345678",
            role=role,
            industry=industry,
            account_status="active",
        )
        user.set_password("TestPass123")
        db.session.add(user)
        db.session.commit()
        return user

    return _create_user


@pytest.fixture
def create_test_service(db):
    """Fixture to create test services"""

    def _create_service(admin_id, title="Test Service", price=100.0, duration="1 hr"):
        service = Service(
            title=title,
            description="Test service description",
            price=price,
            duration=duration,
            image=b"fake_image_data",
            status=ServiceStatus.ACTIVE,
            admin_id=admin_id,
            currency="KES",
        )
        db.session.add(service)
        db.session.commit()
        return service

    return _create_service
