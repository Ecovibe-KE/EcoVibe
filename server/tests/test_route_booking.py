import json
import pytest
from datetime import datetime, timedelta, timezone
from models.booking import Booking, BookingStatus
from models.user import User, Role, AccountStatus
from models.service import Service, ServiceStatus
from models.invoice import Invoice, InvoiceStatus


class TestHelperFunctions:
    """Test helper functions used in booking routes"""

    def test_calculate_end_time(self):
        """Test end time calculation from service duration"""
        from routes.booking import calculate_end_time

        # Test 2 hours duration
        start_time = datetime(2024, 1, 15, 9, 0, tzinfo=timezone.utc)
        duration = "2 hr"
        end_time = calculate_end_time(start_time, duration)
        expected = datetime(2024, 1, 15, 11, 0, tzinfo=timezone.utc)
        assert end_time == expected

        # Test 1 hour 30 minutes duration
        duration = "1 hr 30 min"
        end_time = calculate_end_time(start_time, duration)
        expected = datetime(2024, 1, 15, 10, 30, tzinfo=timezone.utc)
        assert end_time == expected

        # Test invalid duration format
        duration = "invalid format"
        end_time = calculate_end_time(start_time, duration)
        expected = start_time
        assert end_time == expected


class TestBookingListResource:
    """Test BookingListResource endpoints"""

    def test_get_bookings_unauthenticated(self, client, session):
        """Test getting bookings without authentication"""
        response = client.get("/api/bookings")
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data["status"] == "error"
        msg = data["message"]
        assert "Missing token" in msg or "Authorization" in msg

    def test_get_bookings_as_admin(self, client, session):
        """Test admin can see all bookings"""
        # Create admin user
        admin = User(
            full_name="Test Admin",
            email="admin@test.com",
            phone_number="+254712345678",
            role=Role.ADMIN,
            industry="Technology",
            account_status=AccountStatus.ACTIVE,
        )
        admin.set_password("TestPass123")
        session.add(admin)
        session.commit()

        # Create client user
        client_user = User(
            full_name="Test Client",
            email="client@test.com",
            phone_number="+254712345679",
            role=Role.CLIENT,
            industry="Finance",
            account_status=AccountStatus.ACTIVE,
        )
        client_user.set_password("TestPass123")
        session.add(client_user)
        session.commit()

        # Create service
        service = Service(
            title="Test Service",
            description="Test description",
            price=100.0,
            duration="1 hr",
            image=b"fake_image_data",
            status=ServiceStatus.ACTIVE,
            admin_id=admin.id,
            currency="KES",
        )
        session.add(service)
        session.commit()

        # Create bookings for different clients
        booking1 = Booking(
            client_id=client_user.id,
            service_id=service.id,
            start_time=datetime.now(timezone.utc) + timedelta(hours=2),
            end_time=datetime.now(timezone.utc) + timedelta(hours=3),
            booking_date=datetime.now(timezone.utc).date(),
            status=BookingStatus.pending,
        )

        booking2 = Booking(
            client_id=admin.id,
            service_id=service.id,
            start_time=datetime.now(timezone.utc) + timedelta(days=1),
            end_time=datetime.now(timezone.utc) + timedelta(days=1, hours=1),
            booking_date=datetime.now(timezone.utc).date(),
            status=BookingStatus.confirmed,
        )

        session.add_all([booking1, booking2])
        session.commit()

        # Login as admin
        login_response = client.post(
            "/api/login", json={"email": "admin@test.com", "password": "TestPass123"}
        )

        assert login_response.status_code == 200
        access_token = json.loads(login_response.data)["data"]["access_token"]

        # Get bookings as admin
        response = client.get(
            "/api/bookings", headers={"Authorization": f"Bearer {access_token}"}
        )

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["status"] == "success"
        assert len(data["data"]) == 2

    def test_create_booking_as_client(self, client, session):
        """Test client creating their own booking"""
        # Create admin user
        admin = User(
            full_name="Test Admin",
            email="admin@test.com",
            phone_number="+254712345678",
            role=Role.ADMIN,
            industry="Technology",
            account_status=AccountStatus.ACTIVE,
        )
        admin.set_password("TestPass123")
        session.add(admin)
        session.commit()

        # Create client user
        client_user = User(
            full_name="Test Client",
            email="client@test.com",
            phone_number="+254712345679",
            role=Role.CLIENT,
            industry="Finance",
            account_status=AccountStatus.ACTIVE,
        )
        client_user.set_password("TestPass123")
        session.add(client_user)
        session.commit()

        # Create service
        service = Service(
            title="Test Service",
            description="Test description",
            price=100.0,
            duration="1 hr",
            image=b"fake_image_data",
            status=ServiceStatus.ACTIVE,
            admin_id=admin.id,
            currency="KES",
        )
        session.add(service)
        session.commit()

        # Login as client
        login_response = client.post(
            "/api/login", json={"email": "client@test.com", "password": "TestPass123"}
        )

        assert login_response.status_code == 200
        access_token = json.loads(login_response.data)["data"]["access_token"]

        # Create booking as client
        start_time = datetime.now(timezone.utc) + timedelta(hours=2)
        response = client.post(
            "/api/bookings",
            json={"service_id": service.id, "start_time": start_time.isoformat()},
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 201
        data = json.loads(response.data)
        assert data["status"] == "success"
        assert data["data"]["client_id"] == client_user.id

    def test_create_booking_missing_service(self, client, session):
        """Test creating booking without service"""
        # Create client user
        client_user = User(
            full_name="Test Client",
            email="client@test.com",
            phone_number="+254712345679",
            role=Role.CLIENT,
            industry="Finance",
            account_status=AccountStatus.ACTIVE,
        )
        client_user.set_password("TestPass123")
        session.add(client_user)
        session.commit()

        # Login as client
        login_response = client.post(
            "/api/login", json={"email": "client@test.com", "password": "TestPass123"}
        )

        assert login_response.status_code == 200
        access_token = json.loads(login_response.data)["data"]["access_token"]

        # Try to create booking without service
        start_time = datetime.now(timezone.utc) + timedelta(hours=2)
        response = client.post(
            "/api/bookings",
            json={"start_time": start_time.isoformat()},
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert data["status"] == "error"
        assert "Service is required" in data["message"]

    def test_create_booking_missing_start_time(self, client, session):
        """Test creating booking without start time"""
        # Create admin user
        admin = User(
            full_name="Test Admin",
            email="admin@test.com",
            phone_number="+254712345678",
            role=Role.ADMIN,
            industry="Technology",
            account_status=AccountStatus.ACTIVE,
        )
        admin.set_password("TestPass123")
        session.add(admin)
        session.commit()

        # Create client user
        client_user = User(
            full_name="Test Client",
            email="client@test.com",
            phone_number="+254712345679",
            role=Role.CLIENT,
            industry="Finance",
            account_status=AccountStatus.ACTIVE,
        )
        client_user.set_password("TestPass123")
        session.add(client_user)
        session.commit()

        # Create service
        service = Service(
            title="Test Service",
            description="Test description",
            price=100.0,
            duration="1 hr",
            image=b"fake_image_data",
            status=ServiceStatus.ACTIVE,
            admin_id=admin.id,
            currency="KES",
        )
        session.add(service)
        session.commit()

        # Login as client
        login_response = client.post(
            "/api/login", json={"email": "client@test.com", "password": "TestPass123"}
        )

        assert login_response.status_code == 200
        access_token = json.loads(login_response.data)["data"]["access_token"]

        # Try to create booking without start time
        response = client.post(
            "/api/bookings",
            json={"service_id": service.id},
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert data["status"] == "error"
        assert "Start time is required" in data["message"]

    def test_create_booking_past_start_time(self, client, session):
        """Test creating booking with past start time"""
        # Create admin user
        admin = User(
            full_name="Test Admin",
            email="admin@test.com",
            phone_number="+254712345678",
            role=Role.ADMIN,
            industry="Technology",
            account_status=AccountStatus.ACTIVE,
        )
        admin.set_password("TestPass123")
        session.add(admin)
        session.commit()

        # Create client user
        client_user = User(
            full_name="Test Client",
            email="client@test.com",
            phone_number="+254712345679",
            role=Role.CLIENT,
            industry="Finance",
            account_status=AccountStatus.ACTIVE,
        )
        client_user.set_password("TestPass123")
        session.add(client_user)
        session.commit()

        # Create service
        service = Service(
            title="Test Service",
            description="Test description",
            price=100.0,
            duration="1 hr",
            image=b"fake_image_data",
            status=ServiceStatus.ACTIVE,
            admin_id=admin.id,
            currency="KES",
        )
        session.add(service)
        session.commit()

        # Login as client
        login_response = client.post(
            "/api/login", json={"email": "client@test.com", "password": "TestPass123"}
        )

        assert login_response.status_code == 200
        access_token = json.loads(login_response.data)["data"]["access_token"]

        # Try to create booking with past start time
        past_time = datetime.now(timezone.utc) - timedelta(hours=1)
        response = client.post(
            "/api/bookings",
            json={"service_id": service.id, "start_time": past_time.isoformat()},
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 400
        data = json.loads(response.data)
        assert data["status"] == "error"
        assert "Start time cannot be in the past" in data["message"]


class TestBookingResource:
    """Test BookingResource endpoints"""

    def test_get_booking_as_admin(self, client, session):
        """Test admin can get any booking"""
        # Create admin user
        admin = User(
            full_name="Test Admin",
            email="admin@test.com",
            phone_number="+254712345678",
            role=Role.ADMIN,
            industry="Technology",
            account_status=AccountStatus.ACTIVE,
        )
        admin.set_password("TestPass123")
        session.add(admin)
        session.commit()

        # Create client user
        client_user = User(
            full_name="Test Client",
            email="client@test.com",
            phone_number="+254712345679",
            role=Role.CLIENT,
            industry="Finance",
            account_status=AccountStatus.ACTIVE,
        )
        client_user.set_password("TestPass123")
        session.add(client_user)
        session.commit()

        # Create service
        service = Service(
            title="Test Service",
            description="Test description",
            price=100.0,
            duration="1 hr",
            image=b"fake_image_data",
            status=ServiceStatus.ACTIVE,
            admin_id=admin.id,
            currency="KES",
        )
        session.add(service)
        session.commit()

        # Create booking
        booking = Booking(
            client_id=client_user.id,
            service_id=service.id,
            start_time=datetime.now(timezone.utc) + timedelta(hours=2),
            end_time=datetime.now(timezone.utc) + timedelta(hours=3),
            booking_date=datetime.now(timezone.utc).date(),
            status=BookingStatus.pending,
        )
        session.add(booking)
        session.commit()

        # Login as admin
        login_response = client.post(
            "/api/login", json={"email": "admin@test.com", "password": "TestPass123"}
        )

        assert login_response.status_code == 200
        access_token = json.loads(login_response.data)["data"]["access_token"]

        # Get booking as admin
        response = client.get(
            f"/api/bookings/{booking.id}",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["status"] == "success"
        assert data["data"]["id"] == booking.id

    def test_get_booking_as_owner(self, client, session):
        """Test client can get their own booking"""
        # Create admin user
        admin = User(
            full_name="Test Admin",
            email="admin@test.com",
            phone_number="+254712345678",
            role=Role.ADMIN,
            industry="Technology",
            account_status=AccountStatus.ACTIVE,
        )
        admin.set_password("TestPass123")
        session.add(admin)
        session.commit()

        # Create client user
        client_user = User(
            full_name="Test Client",
            email="client@test.com",
            phone_number="+254712345679",
            role=Role.CLIENT,
            industry="Finance",
            account_status=AccountStatus.ACTIVE,
        )
        client_user.set_password("TestPass123")
        session.add(client_user)
        session.commit()

        # Create service
        service = Service(
            title="Test Service",
            description="Test description",
            price=100.0,
            duration="1 hr",
            image=b"fake_image_data",
            status=ServiceStatus.ACTIVE,
            admin_id=admin.id,
            currency="KES",
        )
        session.add(service)
        session.commit()

        # Create booking
        booking = Booking(
            client_id=client_user.id,
            service_id=service.id,
            start_time=datetime.now(timezone.utc) + timedelta(hours=2),
            end_time=datetime.now(timezone.utc) + timedelta(hours=3),
            booking_date=datetime.now(timezone.utc).date(),
            status=BookingStatus.pending,
        )
        session.add(booking)
        session.commit()

        # Login as client
        login_response = client.post(
            "/api/login", json={"email": "client@test.com", "password": "TestPass123"}
        )

        assert login_response.status_code == 200
        access_token = json.loads(login_response.data)["data"]["access_token"]

        # Get own booking
        response = client.get(
            f"/api/bookings/{booking.id}",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["status"] == "success"
        assert data["data"]["id"] == booking.id

    def test_get_nonexistent_booking(self, client, session):
        """Test getting non-existent booking"""
        # Create client user
        client_user = User(
            full_name="Test Client",
            email="client@test.com",
            phone_number="+254712345679",
            role=Role.CLIENT,
            industry="Finance",
            account_status=AccountStatus.ACTIVE,
        )
        client_user.set_password("TestPass123")
        session.add(client_user)
        session.commit()

        # Login as client
        login_response = client.post(
            "/api/login", json={"email": "client@test.com", "password": "TestPass123"}
        )

        assert login_response.status_code == 200
        access_token = json.loads(login_response.data)["data"]["access_token"]

        # Try to get non-existent booking
        response = client.get(
            "/api/bookings/999", headers={"Authorization": f"Bearer {access_token}"}
        )

        assert response.status_code == 404
        data = json.loads(response.data)
        assert data["status"] == "error"
        assert "Booking not found" in data["message"]

    def test_delete_booking_as_admin(self, client, session):
        """Test admin deleting any booking"""
        # Create admin user
        admin = User(
            full_name="Test Admin",
            email="admin@test.com",
            phone_number="+254712345678",
            role=Role.ADMIN,
            industry="Technology",
            account_status=AccountStatus.ACTIVE,
        )
        admin.set_password("TestPass123")
        session.add(admin)
        session.commit()

        # Create client user
        client_user = User(
            full_name="Test Client",
            email="client@test.com",
            phone_number="+254712345679",
            role=Role.CLIENT,
            industry="Finance",
            account_status=AccountStatus.ACTIVE,
        )
        client_user.set_password("TestPass123")
        session.add(client_user)
        session.commit()

        # Create service
        service = Service(
            title="Test Service",
            description="Test description",
            price=100.0,
            duration="1 hr",
            image=b"fake_image_data",
            status=ServiceStatus.ACTIVE,
            admin_id=admin.id,
            currency="KES",
        )
        session.add(service)
        session.commit()

        # Create booking
        booking = Booking(
            client_id=client_user.id,
            service_id=service.id,
            start_time=datetime.now(timezone.utc) + timedelta(hours=2),
            end_time=datetime.now(timezone.utc) + timedelta(hours=3),
            booking_date=datetime.now(timezone.utc).date(),
            status=BookingStatus.pending,
        )
        session.add(booking)
        session.commit()

        # Login as admin
        login_response = client.post(
            "/api/login", json={"email": "admin@test.com", "password": "TestPass123"}
        )

        assert login_response.status_code == 200
        access_token = json.loads(login_response.data)["data"]["access_token"]

        # Delete booking as admin
        response = client.delete(
            f"/api/bookings/{booking.id}",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["status"] == "success"

        # Verify soft delete
        deleted_booking = Booking.query.get(booking.id)
        assert deleted_booking.is_deleted is True
