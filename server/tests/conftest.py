import pytest
from app import create_app, db as _db
import sys
import os

root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)


# @pytest.fixture
# def client():
#     app = create_app("testing")
#     app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
#         "FLASK_TEST_SQLALCHEMY_DATABASE_URI"
#     )

#     with app.app_context():
#         db.create_all()  # ✅ Create all tables for testing

#     with app.test_client() as client:
#         yield client

#     # Optional cleanup
#     with app.app_context():
#         db.drop_all()


@pytest.fixture(autouse=True)
def patch_email(monkeypatch):
    """Disable actual email sending for all tests in this file."""
    monkeypatch.setattr(
        "utils.mail_templates.send_verification_email",
        lambda *a, **k: None,  # no-op
    )


@pytest.fixture(scope="session")
def app(request):
    """Session-wide test `Flask` application."""
    app = create_app("testing")

    # Establish an application context before running the tests.
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
    _db.create_all()  # <-- creates *all* tables every test run

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
