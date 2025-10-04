import json
import pytest
from datetime import datetime, date, timedelta
from unittest.mock import patch, MagicMock
from models.user import AccountStatus, User, Role
from models.booking import Booking, BookingStatus
from models.service import Service, ServiceStatus


# --- Fixtures ---


@pytest.fixture
def test_user(session):
    """Create a regular client user."""
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


@pytest.fixture
def admin_user(session):
    """Create an admin user."""
    user = User(
        full_name="Admin User",
        email="admin@gmail.com",
        role=Role.ADMIN,
        account_status=AccountStatus.ACTIVE,
        industry="Technology",
        phone_number="+254712345679",
    )
    user.set_password("password.123@Champion")
    session.add(user)
    session.commit()
    return user


@pytest.fixture
def sample_service(session, admin_user):
    """Create a sample service."""
    service = Service(
        title="Consultation Service",  # Changed from 'name' to 'title'
        description="Professional consultation service",
        duration="1 hour",
        price=5000.0,  # Changed from string to float
        currency="KES",
        admin_id=admin_user.id,
        image=b"fake-image-data",  # Added required image field
        status=ServiceStatus.ACTIVE,  # Added required status field
    )
    session.add(service)
    session.commit()
    return service


@pytest.fixture
def sample_booking(session, test_user, sample_service):
    """Create a sample booking."""
    booking = Booking(
        booking_date=date.today() + timedelta(days=1),
        start_time=datetime.now() + timedelta(days=1, hours=1),
        end_time=datetime.now() + timedelta(days=1, hours=2),
        status=BookingStatus.pending,
        client_id=test_user.id,
        service_id=sample_service.id,
    )
    session.add(booking)
    session.commit()
    return booking


@pytest.fixture
def another_user(session):
    """Create another client user for authorization tests."""
    user = User(
        full_name="Another User",
        email="another@gmail.com",
        role=Role.CLIENT,
        account_status=AccountStatus.ACTIVE,
        industry="Finance",
        phone_number="+254712345680",
    )
    user.set_password("password.123@Champion")
    session.add(user)
    session.commit()
    return user


# --- Helper functions ---


def get_auth_token(client, user):
    """Helper to get authentication token."""
    response = client.post(
        "/api/login",
        data=json.dumps({"email": user.email, "password": "password.123@Champion"}),
        content_type="application/json",
    )
    return response.get_json()["data"]["access_token"]


def create_booking_data(service_id, days_from_today=1, start_hours=1, end_hours=2):
    """Helper to create booking data with proper date/time formatting."""
    booking_date = date.today() + timedelta(days=days_from_today)
    start_time = datetime.now() + timedelta(days=days_from_today, hours=start_hours)
    end_time = datetime.now() + timedelta(days=days_from_today, hours=end_hours)

    return {
        "booking_date": booking_date.strftime("%Y-%m-%d"),
        "start_time": start_time.isoformat(),
        "end_time": end_time.isoformat(),
        "service_id": service_id,
        "status": "pending",
    }


# --- Test BookingListResource GET ---


def test_get_bookings_as_admin(client, admin_user, sample_booking, test_user):
    """Test admin can see all bookings."""
    token = get_auth_token(client, admin_user)
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/bookings", headers=headers)

    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert len(data["data"]) == 1
    assert data["data"][0]["id"] == sample_booking.id
    assert data["message"] == "Bookings retrieved successfully"


def test_get_bookings_as_client(client, test_user, sample_booking):
    """Test client can only see their own bookings."""
    token = get_auth_token(client, test_user)
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/bookings", headers=headers)

    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert len(data["data"]) == 1
    assert data["data"][0]["id"] == sample_booking.id


def test_get_bookings_unauthorized(client):
    """Test getting bookings without authentication."""
    response = client.get("/api/bookings")
    assert response.status_code == 401


def test_get_bookings_empty(client, admin_user):
    """Test getting bookings when none exist."""
    token = get_auth_token(client, admin_user)
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/bookings", headers=headers)

    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert len(data["data"]) == 0


# --- Test BookingListResource POST ---


def test_create_booking_as_client_success(client, test_user, sample_service):
    """Test client can create their own booking."""
    token = get_auth_token(client, test_user)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    booking_data = create_booking_data(sample_service.id)

    response = client.post(
        "/api/bookings", headers=headers, data=json.dumps(booking_data)
    )

    assert response.status_code == 201
    data = response.get_json()
    assert data["status"] == "success"
    assert data["data"]["client_id"] == test_user.id
    assert data["data"]["service_id"] == sample_service.id
    assert data["message"] == "Booking created successfully"


def test_create_booking_as_admin_for_client(
    client, admin_user, test_user, sample_service
):
    """Test admin can create booking for any client."""
    token = get_auth_token(client, admin_user)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    booking_data = create_booking_data(sample_service.id)
    booking_data["client_id"] = test_user.id

    response = client.post(
        "/api/bookings", headers=headers, data=json.dumps(booking_data)
    )

    assert response.status_code == 201
    data = response.get_json()
    assert data["status"] == "success"
    assert data["data"]["client_id"] == test_user.id


def test_create_booking_unauthorized(client, sample_service):
    """Test creating booking without authentication."""
    booking_data = create_booking_data(sample_service.id)

    response = client.post(
        "/api/bookings", data=json.dumps(booking_data), content_type="application/json"
    )

    assert response.status_code == 401


def test_create_booking_missing_service_id(client, test_user):
    """Test creating booking without service_id."""
    token = get_auth_token(client, test_user)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    booking_data = create_booking_data(service_id=None)
    del booking_data["service_id"]

    response = client.post(
        "/api/bookings", headers=headers, data=json.dumps(booking_data)
    )

    assert response.status_code == 400
    data = response.get_json()
    assert data["status"] == "error"
    assert "Service is required" in data["message"]


def test_create_booking_invalid_service_id(client, test_user):
    """Test creating booking with invalid service_id."""
    token = get_auth_token(client, test_user)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    booking_data = create_booking_data(service_id=999)  # Non-existent service

    response = client.post(
        "/api/bookings", headers=headers, data=json.dumps(booking_data)
    )

    assert response.status_code == 400
    data = response.get_json()
    assert data["status"] == "error"
    assert "Invalid client or service ID" in data["message"]


def test_create_booking_past_date(client, test_user, sample_service):
    """Test creating booking with past date."""
    token = get_auth_token(client, test_user)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    booking_data = create_booking_data(
        sample_service.id, days_from_today=-1
    )  # Past date

    response = client.post(
        "/api/bookings", headers=headers, data=json.dumps(booking_data)
    )

    assert response.status_code == 400
    data = response.get_json()
    assert data["status"] == "error"
    assert "Booking date cannot be in the past" in data["message"]


def test_create_booking_end_time_before_start(client, test_user, sample_service):
    """Test creating booking with end time before start time."""
    token = get_auth_token(client, test_user)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    booking_data = create_booking_data(sample_service.id)
    # Swap start and end times
    start = booking_data["start_time"]
    booking_data["start_time"] = booking_data["end_time"]
    booking_data["end_time"] = start

    response = client.post(
        "/api/bookings", headers=headers, data=json.dumps(booking_data)
    )

    assert response.status_code == 400
    data = response.get_json()
    assert data["status"] == "error"
    assert "End time must be after the start time" in data["message"]


# --- Test BookingResource GET ---


def test_get_single_booking_success(client, test_user, sample_booking):
    """Test successfully fetching a single booking."""
    token = get_auth_token(client, test_user)
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get(f"/api/bookings/{sample_booking.id}", headers=headers)

    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert data["data"]["id"] == sample_booking.id
    assert data["data"]["client_name"] == test_user.full_name
    # Note: service_name might be None since we're not mocking the relationship in test


def test_get_single_booking_not_found(client, test_user):
    """Test fetching non-existent booking."""
    token = get_auth_token(client, test_user)
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/bookings/999", headers=headers)

    assert response.status_code == 404
    data = response.get_json()
    assert data["status"] == "error"
    assert "Booking not found" in data["message"]


def test_get_single_booking_unauthorized(client, sample_booking):
    """Test fetching booking without authentication."""
    response = client.get(f"/api/bookings/{sample_booking.id}")
    assert response.status_code == 401


# --- Test BookingResource PATCH ---


def test_update_booking_as_owner_success(client, test_user, sample_booking):
    """Test client can update their own booking."""
    token = get_auth_token(client, test_user)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    update_data = {"status": "confirmed"}

    response = client.patch(
        f"/api/bookings/{sample_booking.id}",
        headers=headers,
        data=json.dumps(update_data),
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert data["data"]["status"] == "confirmed"
    assert data["message"] == "Booking updated successfully"


def test_update_booking_as_admin_success(client, admin_user, sample_booking):
    """Test admin can update any booking."""
    token = get_auth_token(client, admin_user)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    new_date = (date.today() + timedelta(days=2)).strftime("%Y-%m-%d")
    update_data = {"booking_date": new_date, "status": "completed"}

    response = client.patch(
        f"/api/bookings/{sample_booking.id}",
        headers=headers,
        data=json.dumps(update_data),
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert data["data"]["status"] == "completed"


def test_update_booking_unauthorized(client, sample_booking):
    """Test updating booking without authentication."""
    update_data = {"status": "confirmed"}

    response = client.patch(
        f"/api/bookings/{sample_booking.id}",
        data=json.dumps(update_data),
        content_type="application/json",
    )

    assert response.status_code == 401


def test_update_booking_forbidden(client, another_user, sample_booking):
    """Test user cannot update another user's booking."""
    token = get_auth_token(client, another_user)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    update_data = {"status": "confirmed"}

    response = client.patch(
        f"/api/bookings/{sample_booking.id}",
        headers=headers,
        data=json.dumps(update_data),
    )

    assert response.status_code == 403
    data = response.get_json()
    assert data["status"] == "error"
    assert "Not authorized to edit this booking" in data["message"]


def test_update_booking_not_found(client, test_user):
    """Test updating non-existent booking."""
    token = get_auth_token(client, test_user)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    update_data = {"status": "confirmed"}

    response = client.patch(
        "/api/bookings/999", headers=headers, data=json.dumps(update_data)
    )

    assert response.status_code == 404


def test_update_booking_invalid_data(client, test_user, sample_booking):
    """Test updating booking with invalid data."""
    token = get_auth_token(client, test_user)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    update_data = {"booking_date": "invalid-date-format"}

    response = client.patch(
        f"/api/bookings/{sample_booking.id}",
        headers=headers,
        data=json.dumps(update_data),
    )

    assert response.status_code == 400


# --- Test BookingResource DELETE ---


def test_delete_booking_as_owner_success(client, test_user, sample_booking):
    """Test client can delete their own booking."""
    token = get_auth_token(client, test_user)
    headers = {"Authorization": f"Bearer {token}"}

    response = client.delete(f"/api/bookings/{sample_booking.id}", headers=headers)

    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert data["message"] == "Booking deleted successfully"


def test_delete_booking_as_admin_success(client, admin_user, sample_booking):
    """Test admin can delete any booking."""
    token = get_auth_token(client, admin_user)
    headers = {"Authorization": f"Bearer {token}"}

    response = client.delete(f"/api/bookings/{sample_booking.id}", headers=headers)

    assert response.status_code == 200


def test_delete_booking_unauthorized(client, sample_booking):
    """Test deleting booking without authentication."""
    response = client.delete(f"/api/bookings/{sample_booking.id}")
    assert response.status_code == 401


def test_delete_booking_forbidden(client, another_user, sample_booking):
    """Test user cannot delete another user's booking."""
    token = get_auth_token(client, another_user)
    headers = {"Authorization": f"Bearer {token}"}

    response = client.delete(f"/api/bookings/{sample_booking.id}", headers=headers)

    assert response.status_code == 403
    data = response.get_json()
    assert data["status"] == "error"
    assert "Not authorized to delete this booking" in data["message"]


def test_delete_booking_not_found(client, test_user):
    """Test deleting non-existent booking."""
    token = get_auth_token(client, test_user)
    headers = {"Authorization": f"Bearer {token}"}

    response = client.delete("/api/bookings/999", headers=headers)

    assert response.status_code == 404


# --- Test Edge Cases ---


def test_create_booking_with_all_fields(client, test_user, sample_service):
    """Test creating booking with all possible fields."""
    token = get_auth_token(client, test_user)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    booking_data = create_booking_data(sample_service.id)
    booking_data["status"] = "confirmed"  # Include status

    response = client.post(
        "/api/bookings", headers=headers, data=json.dumps(booking_data)
    )

    assert response.status_code == 201
    data = response.get_json()
    assert data["status"] == "success"


def test_update_booking_partial_fields(client, test_user, sample_booking):
    """Test updating only some fields of a booking."""
    token = get_auth_token(client, test_user)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # Only update status, leave other fields unchanged
    update_data = {"status": "cancelled"}

    response = client.patch(
        f"/api/bookings/{sample_booking.id}",
        headers=headers,
        data=json.dumps(update_data),
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data["data"]["status"] == "cancelled"
    # Original fields should remain unchanged
    assert data["data"]["booking_date"] == sample_booking.booking_date.isoformat()
