import pytest
from app import app as flask_app


@pytest.fixture
def client():
    """
    Creates a test client for the Flask application.
    This fixture will be used by tests to make requests to the application.
    """
    flask_app.config["TESTING"] = True
    with flask_app.test_client() as client:
        yield client


def test_home_route_success(client):
    """
    GIVEN a Flask application
    WHEN the '/' route is requested (GET)
    THEN check that the response is valid with a 200 status code and correct content.
    """
    response = client.get("/")
    assert response.status_code == 200
    assert b"EcoVibe Completed Website!" in response.data


def test_home_route_content_type(client):
    """
    GIVEN a Flask application
    WHEN the '/' route is requested (GET)
    THEN check that the content type is 'text/html'.
    """
    response = client.get("/")
    assert "text/html" in response.content_type


def test_non_existent_route_404(client):
    """
    GIVEN a Flask application
    WHEN a non-existent route is requested (GET)
    THEN check that a 404 Not Found error is returned.
    """
    response = client.get("/this-route-does-not-exist")
    assert response.status_code == 404
