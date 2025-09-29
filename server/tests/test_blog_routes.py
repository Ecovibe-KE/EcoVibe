import json
from io import BytesIO
import pytest
from unittest.mock import patch, MagicMock
from models.user import AccountStatus, User, Role
from models.blog import Blog, BlogType
from models.newsletter_subscriber import NewsletterSubscriber


# Fixture to create a regular user
@pytest.fixture
def test_user(session):
    user = User(
        full_name="Test User",
        email="test@gmail.com",
        role=Role.CLIENT,
        account_status=AccountStatus.ACTIVE,
        industry="Technology",
        phone_number="+254712345678",
    )
    user.set_password("password.123@Champion")
    session.add(user)
    session.commit()
    return user


# Fixture to create an admin user
@pytest.fixture
def admin_user(session):
    user = User(
        full_name="Admin User",
        email="admin@gmail.com",
        role=Role.ADMIN,
        account_status=AccountStatus.ACTIVE,
        industry="Technology",
        phone_number="+254712345678",
    )
    user.set_password("password.123@Champion")
    session.add(user)
    session.commit()
    return user


# Fixture to create a sample blog post
@pytest.fixture
def sample_blog(session, admin_user):
    blog = Blog(
        title="Sample Blog Post",
        content="This is the content of the sample blog post.",
        author_name=admin_user.full_name,
        admin_id=admin_user.id,
        image=b"fake-image-data",
        image_content_type="image/png",
        category="Tech, Environment",
        reading_duration="5 hr read",
    )
    session.add(blog)
    session.commit()
    return blog


# Fixture to create a sample newsletter post
@pytest.fixture
def sample_newsletter(session, admin_user):
    newsletter = Blog(
        title="Sample Newsletter",
        content="This is the content of the sample newsletter.",
        author_name=admin_user.full_name,
        admin_id=admin_user.id,
        type=BlogType.NEWSLETTER,
        image=b"fake-newsletter-image-data",
        image_content_type="image/jpeg",
        category="Tech, Environment",
        reading_duration="5 hr read",
    )
    session.add(newsletter)
    session.commit()
    return newsletter


# Fixture to create a newsletter subscriber
@pytest.fixture
def newsletter_subscriber(session):
    subscriber = NewsletterSubscriber(email="subscriber@gmail.com")
    session.add(subscriber)
    session.commit()
    return subscriber


# Helper function for logging in a user and getting the token
def get_auth_token(client, user):
    response = client.post(
        "/api/login",
        data=json.dumps({"email": user.email, "password": "password.123@Champion"}),
        content_type="application/json",
    )
    return response.get_json()["data"]["access_token"]


# --- Test BlogListResource ---


def test_get_all_blogs_success(client, sample_blog):
    """Test successfully fetching all blogs."""
    response = client.get("/api/blogs")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert len(data["data"]) == 1
    assert data["data"][0]["title"] == sample_blog.title
    assert "preview" in data["data"][0]


def test_get_all_blogs_empty(client, session):
    """Test fetching blogs when none exist."""
    response = client.get("/api/blogs")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert len(data["data"]) == 0


# --- Test BlogResource ---


def test_get_single_blog_success(client, sample_blog):
    """Test successfully fetching a single blog."""
    response = client.get(f"/api/blogs/{sample_blog.id}")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert data["data"]["id"] == sample_blog.id
    assert data["data"]["title"] == sample_blog.title


def test_get_single_blog_not_found(client, session):
    """Test fetching a blog that does not exist."""
    response = client.get("/api/blogs/999")
    assert response.status_code == 404


# --- Test BlogNewsletterResource (POST) ---


@patch("threading.Thread.start")
def test_create_blog_success(mock_thread_start, client, admin_user):
    """Test successful creation of a blog post by an admin."""
    token = get_auth_token(client, admin_user)
    headers = {"Authorization": f"Bearer {token}"}

    data = {
        "title": "New Blog Post",
        "content": "This is a brand new blog post.",
        "image": (BytesIO(b"my-fake-image"), "test.jpg", "image/jpeg"),
    }

    response = client.post(
        "/api/blogs",
        headers=headers,
        data=data,
        content_type="multipart/form-data",
    )

    assert response.status_code == 201
    json_data = response.get_json()
    assert json_data["status"] == "success"
    assert json_data["data"]["title"] == "New Blog Post"
    assert not mock_thread_start.called  # Should not send newsletter for default type


def test_create_blog_unauthorized(client):
    """Test creating a blog without authentication."""
    data = {
        "title": "Unauthorized Post",
        "content": "This should fail.",
        "image": (BytesIO(b"my-fake-image"), "test.jpg"),
    }
    response = client.post(
        "/api/blogs",
        data=data,
        content_type="multipart/form-data",
    )
    assert response.status_code == 401


def test_create_blog_forbidden(client, test_user):
    """Test creating a blog by a non-admin user."""
    token = get_auth_token(client, test_user)
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "title": "Forbidden Post",
        "content": "This should also fail.",
        "image": (BytesIO(b"my-fake-image"), "test.jpg"),
    }
    response = client.post(
        "/api/blogs",
        headers=headers,
        data=data,
        content_type="multipart/form-data",
    )
    assert response.status_code == 403


def test_create_blog_missing_data(client, admin_user):
    """Test creating a blog with missing title and content."""
    token = get_auth_token(client, admin_user)
    headers = {"Authorization": f"Bearer {token}"}
    data = {"image": (BytesIO(b"my-fake-image"), "test.jpg")}
    response = client.post(
        "/api/blogs",
        headers=headers,
        data=data,
        content_type="multipart/form-data",
    )
    assert response.status_code == 400
    assert "Title and content are required" in response.get_data(as_text=True)


def test_create_blog_no_image(client, admin_user):
    """Test creating a blog with no image file."""
    token = get_auth_token(client, admin_user)
    headers = {"Authorization": f"Bearer {token}"}
    data = {"title": "No Image Post", "content": "This has no image."}
    response = client.post(
        "/api/blogs",
        headers=headers,
        data=data,
        content_type="multipart/form-data",
    )
    assert response.status_code == 400
    assert "No image file provided" in response.get_data(as_text=True)


# TODO: Fix this test
# --- Test BlogNewsletterResource (POST) ---
# @patch("routes.blog.send_newsletter_email")
# def test_create_newsletter_sends_email(
# mock_send_email, client, admin_user, newsletter_subscriber):
#     """Test that creating a newsletter triggers email sending."""
#     from datetime import date
#     token = get_auth_token(client, admin_user)
#     headers = {"Authorization": f"Bearer {token}"}

#     data = {
#         "title": "New Newsletter",
#         "content": "This is a newsletter that should be sent out.",
#         "type": BlogType.NEWSLETTER.value,
#         "image": (BytesIO(b"my-fake-image"), "test.jpg", "image/jpeg"),
#         "category": "Newsletter Category",
#         "reading_duration": "3 min read",
#     }

#     with patch("threading.Thread",
# MagicMock(side_effect=lambda target, args: target(*args))) as mock_thread:
#         response = client.post(
#             "/api/blogs",
#             headers=headers,
#             data=data,
#             content_type="multipart/form-data",
#         )

#         assert response.status_code == 201
#         # Assert that the Thread was instantiated once
#         assert mock_thread.call_count == 1
#         # Assert that start() was called on the thread instance
#         mock_thread.return_value.start.assert_called_once()
#         mock_send_email.assert_called_once_with(
#             "subscriber@gmail.com",
#             "New Newsletter",
#             "This is a newsletter that should be sent out.",
#             "localhost:3000/blogs/1",
#             "localhost:3000/blogs/1",
#             "localhost:3000/blogs/1",
#             "Latest Newsletter from EcoVibe",
#             date.today().year,
#             "localhost:5000/blogs/image/1"
#         )


# --- Test BlogImageResource ---


def test_get_blog_image_success(client, sample_blog):
    """Test successfully fetching a blog's image."""
    response = client.get(f"/api/blogs/image/{sample_blog.id}")
    assert response.status_code == 200
    assert response.mimetype == sample_blog.image_content_type
    assert response.data == sample_blog.image


def test_get_blog_image_not_found(client, session):
    """Test fetching an image for a non-existent blog."""
    response = client.get("/api/blogs/image/999")
    assert response.status_code == 404


# --- Test SendNewsletterResource ---


@patch("routes.blog.send_newsletter_email")
def test_send_newsletter_manually_success(
    mock_send_email, client, admin_user, sample_newsletter, newsletter_subscriber
):
    """Test successfully triggering a newsletter send manually."""
    token = get_auth_token(client, admin_user)
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post(
        f"/api/blogs/send-newsletter/{sample_newsletter.id}",
        headers=headers,
    )

    assert response.status_code == 200
    assert "Newsletter sent successfully" in response.get_data(as_text=True)
    mock_send_email.assert_called_once()


def test_send_newsletter_manually_unauthorized(client, sample_newsletter):
    """Test triggering a newsletter send without authentication."""
    response = client.post(f"/api/blogs/send-newsletter/{sample_newsletter.id}")
    assert response.status_code == 401


def test_send_newsletter_manually_not_a_newsletter(client, admin_user, sample_blog):
    """Test triggering a send for a blog that is not a newsletter."""
    token = get_auth_token(client, admin_user)
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post(
        f"/api/blogs/send-newsletter/{sample_blog.id}",
        headers=headers,
    )
    assert response.status_code == 400
    assert "Blog is not a newsletter type" in response.get_data(as_text=True)


def test_send_newsletter_manually_not_found(client, admin_user):
    """Test triggering a send for a non-existent blog."""
    token = get_auth_token(client, admin_user)
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post(
        "/api/blogs/send-newsletter/999",
        headers=headers,
    )
    assert response.status_code == 404
