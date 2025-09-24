import json
from models.user import User


def test_register_user_success(client, session):
    """Test user registration with valid data."""
    response = client.post(
        "/api/register",
        data=json.dumps(
            {
                "full_name": "John Doe",
                "email": "john.doe@gmail.com",
                "password": "Password123",
                "industry": "Tech",
                "phone_number": "+254712345678",
            }
        ),
        content_type="application/json",
    )
    assert response.status_code == 201
    assert "success" in response.get_data(as_text=True)


def test_register_user_existing_email(client, session):
    """Test registration with an existing email."""
    user = User(
        full_name="Jane Doe",
        email="jane.doe@gmail.com",
        industry="Health",
        phone_number="+254712345679",
    )
    user.set_password("Password123")
    session.add(user)
    session.commit()

    response = client.post(
        "/api/register",
        data=json.dumps(
            {
                "full_name": "Jane Doe",
                "email": "jane.doe@gmail.com",
                "password": "Password123",
                "industry": "Health",
                "phone_number": "+254712345670",
            }
        ),
        content_type="application/json",
    )
    assert response.status_code == 409
    assert "Email already exists" in response.get_data(as_text=True)


def test_register_user_missing_full_name(client, session):
    """Test registration with a missing full_name."""
    response = client.post(
        "/api/register",
        data=json.dumps(
            {
                "email": "john.doe@gmail.com",
                "password": "Password123",
                "industry": "Tech",
                "phone_number": "+254712345678",
            }
        ),
        content_type="application/json",
    )
    assert response.status_code == 400
    assert "full_name cannot be empty" in response.get_data(as_text=True)


def test_register_user_missing_email(client, session):
    """Test registration with a missing email."""
    response = client.post(
        "/api/register",
        data=json.dumps(
            {
                "full_name": "John Doe",
                "password": "Password123",
                "industry": "Tech",
                "phone_number": "+254712345678",
            }
        ),
        content_type="application/json",
    )
    assert response.status_code == 400
    assert "The email address is not valid." in response.get_data(as_text=True)


def test_register_user_missing_password(client, session):
    """Test registration with a missing password."""
    response = client.post(
        "/api/register",
        data=json.dumps(
            {
                "full_name": "John Doe",
                "email": "john.doe@gmail.com",
                "industry": "Tech",
                "phone_number": "+254712345678",
            }
        ),
        content_type="application/json",
    )
    assert response.status_code == 400
    assert (
        "Password must have at least 8 chars, one uppercase, one digit."
        in response.get_data(as_text=True)
    )


def test_register_user_missing_industry(client, session):
    """Test registration with a missing industry."""
    response = client.post(
        "/api/register",
        data=json.dumps(
            {
                "full_name": "John Doe",
                "email": "john.doe@gmail.com",
                "password": "Password123",
                "phone_number": "+254712345678",
            }
        ),
        content_type="application/json",
    )
    assert response.status_code == 400
    assert "industry cannot be empty" in response.get_data(as_text=True)


def test_register_user_missing_phone_number(client, session):
    """Test registration with a missing phone_number."""
    response = client.post(
        "/api/register",
        data=json.dumps(
            {
                "full_name": "John Doe",
                "email": "john.doe@gmail.com",
                "password": "Password123",
                "industry": "Tech",
            }
        ),
        content_type="application/json",
    )
    assert response.status_code == 400
    assert "phone_number cannot be empty" in response.get_data(as_text=True)


def test_register_user_invalid_password(client, session):
    """Test registration with an invalid password."""
    response = client.post(
        "/api/register",
        data=json.dumps(
            {
                "full_name": "John Doe",
                "email": "john.doe@gmail.com",
                "password": "short",
                "industry": "Tech",
                "phone_number": "+254712345678",
            }
        ),
        content_type="application/json",
    )
    assert response.status_code == 400
    assert (
        "Password must have at least 8 chars, one uppercase, one digit."
        in response.get_data(as_text=True)
    )


def test_register_user_invalid_email(client, session):
    """Test registration with an invalid email format."""
    response = client.post(
        "/api/register",
        data=json.dumps(
            {
                "full_name": "John Doe",
                "email": "invalid-email",
                "password": "Password123",
                "industry": "Tech",
                "phone_number": "+254712345678",
            }
        ),
        content_type="application/json",
    )
    assert response.status_code == 400
    assert "The email address is not valid." in response.get_data(as_text=True)


def test_register_user_existing_phone_number(client, session):
    """Test registration with an existing phone number."""
    user = User(
        full_name="Jane Doe",
        email="jane.doe@gmail.com",
        industry="Health",
        phone_number="+254712345678",
    )
    user.set_password("Password123")
    session.add(user)
    session.commit()

    response = client.post(
        "/api/register",
        data=json.dumps(
            {
                "full_name": "John Doe",
                "email": "john.doe@gmail.com",
                "password": "Password123",
                "industry": "Tech",
                "phone_number": "+254712345678",
            }
        ),
        content_type="application/json",
    )
    assert response.status_code == 409
    assert "Phone number already exists" in response.get_data(as_text=True)


def test_register_user_empty_payload(client, session):
    """Test registration with an empty JSON payload."""
    response = client.post(
        "/api/register",
        data=json.dumps({}),
        content_type="application/json",
    )
    assert response.status_code == 400
    assert "full_name cannot be empty" in response.get_data(as_text=True)


def test_register_user_invalid_json(client, session):
    """Test registration with invalid JSON."""
    response = client.post(
        "/api/register",
        data="invalid json",
        content_type="application/json",
    )
    assert response.status_code == 400
    assert "Invalid JSON format" in response.get_data(as_text=True)
