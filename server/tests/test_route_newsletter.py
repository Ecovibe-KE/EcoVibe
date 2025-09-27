import json
from models.newsletter_subscriber import NewsletterSubscriber


def test_subscribe_newsletter_successfully(client, session):
    """Test for successful newsletter subscription"""
    response = client.post(
        "/api/newsletter-subscribers",
        data=json.dumps({"email": "test@gmail.com"}),
        content_type="application/json",
    )
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data["status"] == "success"
    assert data["message"] == "Newsletter subscription successful"
    assert "test@gmail.com" in data["data"]["email"]


def test_subscribe_with_no_data(client, session):
    """Test subscribing with no data provided"""
    response = client.post(
        "/api/newsletter-subscribers",
        data=json.dumps({}),
        content_type="application/json",
    )
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data["status"] == "error"
    assert data["message"] == "No data provided"


def test_subscribe_with_empty_email(client, session):
    """Test subscribing with an empty email string"""
    response = client.post(
        "/api/newsletter-subscribers",
        data=json.dumps({"email": ""}),
        content_type="application/json",
    )
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data["status"] == "error"
    assert data["message"] == "Email is required"


def test_subscribe_with_invalid_email_format(client, session):
    """Test subscribing with an invalid email format"""
    response = client.post(
        "/api/newsletter-subscribers",
        data=json.dumps({"email": "invalid-email"}),
        content_type="application/json",
    )
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data["status"] == "error"
    assert data["message"] == "Invalid email format"


def test_subscribe_with_already_subscribed_email(client, session):
    """Test subscribing with an email that is already subscribed"""
    subscriber = NewsletterSubscriber(email="test@gmail.com")
    session.add(subscriber)
    session.commit()
    response = client.post(
        "/api/newsletter-subscribers",
        data=json.dumps({"email": "test@gmail.com"}),
        content_type="application/json",
    )
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data["status"] == "error"
    assert data["message"] == "Email is already subscribed"


def test_get_all_subscribers(client, session):
    """Test retrieving all newsletter subscribers"""
    session.add(NewsletterSubscriber(email="test1@gmail.com"))
    session.add(NewsletterSubscriber(email="test2@gmail.com"))
    session.commit()
    response = client.get("/api/newsletter-subscribers")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data["status"] == "success"
    assert len(data["data"]) == 2


def test_get_all_subscribers_when_none(client, session):
    """Test retrieving all subscribers when there are none"""
    response = client.get("/api/newsletter-subscribers")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data["status"] == "success"
    assert len(data["data"]) == 0


def test_delete_subscriber_successfully(client, session):
    """Test deleting a subscriber successfully"""
    subscriber = NewsletterSubscriber(email="test@gmail.com")
    session.add(subscriber)
    session.commit()
    response = client.delete(
        "/api/newsletter-subscribers",
        data=json.dumps({"email": "test@gmail.com"}),
        content_type="application/json",
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data["status"] == "success"
    assert data["message"] == "Subscriber removed successfully"


def test_delete_subscriber_with_no_data(client, session):
    """Test deleting a subscriber with no data provided"""
    response = client.delete(
        "/api/newsletter-subscribers",
        data=json.dumps({}),
        content_type="application/json",
    )
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data["status"] == "error"
    assert data["message"] == "No data provided"


def test_delete_subscriber_with_empty_email(client, session):
    """Test deleting a subscriber with an empty email string"""
    response = client.delete(
        "/api/newsletter-subscribers",
        data=json.dumps({"email": ""}),
        content_type="application/json",
    )
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data["status"] == "error"
    assert data["message"] == "Email is required"


def test_delete_non_existent_subscriber(client, session):
    """Test deleting a subscriber that does not exist"""
    response = client.delete(
        "/api/newsletter-subscribers",
        data=json.dumps({"email": "nonexistent@gmail.com"}),
        content_type="application/json",
    )
    assert response.status_code == 404
    data = json.loads(response.data)
    assert data["status"] == "error"
    assert data["message"] == "Subscriber not found"
