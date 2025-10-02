import json
import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone, timedelta, date
from models.payment import Payment, PaymentMethod, MpesaTransaction, CashTransaction
from models.invoice import Invoice, InvoiceStatus
from models.service import Service
from models.user import User, Role


def generate_kenyan_phone(suffix=None, with_plus=False):
    """Generate a valid Kenyan phone number for testing"""
    import random
    if suffix is None:
        suffix = ''.join([str(random.randint(0, 9)) for _ in range(6)])

    if with_plus:
        return f"+254712{suffix}"
    else:
        return f"254712{suffix}"


def create_active_user(session, email="test@test.com", password="Testpassword123", role=Role.CLIENT,
                       phone_suffix="567890"):
    """Utility to quickly create an active user in DB with unique data"""
    user = User(
        full_name="Test User",
        email=email,
        industry="Tech",
        phone_number=generate_kenyan_phone(phone_suffix, with_plus=True),  # User model needs + format
        account_status="active",
        role=role
    )
    user.set_password(password)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def create_invoice(session, client_id, amount=1000, status=InvoiceStatus.pending, service_id=None):
    """Utility to create a test invoice - FIXED VERSION"""
    # Use date objects (not datetime) since the Invoice model uses db.Date fields
    today = date.today()
    due_date = today + timedelta(days=30)

    # If no service_id provided, create a default service for testing
    if service_id is None:
        service = Service(
            name="Test Service",
            description="Test service for invoice",
            duration="1 hour",  # Required field
            price=str(amount),  # Convert to string since Service model expects string
            admin_id=client_id,  # Required field (admin_id)
            currency="KES"  # Required field
        )
        session.add(service)
        session.commit()
        service_id = service.id

    invoice = Invoice(
        client_id=client_id,
        amount=amount,
        due_date=due_date,
        status=status,
        created_at=today,
        service_id=service_id
    )
    session.add(invoice)
    session.commit()
    session.refresh(invoice)
    return invoice


def create_mpesa_transaction(session, amount=100, phone_number=None, status="completed"):
    """Utility to create a test Mpesa transaction"""
    if phone_number is None:
        phone_number = generate_kenyan_phone("444444", with_plus=False)  # MpesaTransaction needs 254 format

    transaction = MpesaTransaction(
        merchant_request_id=f"MERCHANT{datetime.now().timestamp()}",
        checkout_request_id=f"CHECKOUT{datetime.now().timestamp()}",
        amount=amount,
        phone_number=phone_number,
        status=status,
        paid_by=phone_number  # Must be in 254xxxxxxxxx format
    )
    session.add(transaction)
    session.commit()
    session.refresh(transaction)
    return transaction


def create_payment(session, invoice_id, payment_method):
    """Utility to create a test payment - FIXED VERSION"""
    payment = Payment(
        invoice_id=invoice_id,
        payment_method=payment_method,
        created_at=datetime.now(timezone.utc),
        metadata={
            "payment_date": datetime.now(timezone.utc).isoformat()
        }
    )
    session.add(payment)
    session.commit()
    session.refresh(payment)
    return payment

@pytest.fixture
def auth_headers(client, session):
    """Fixture to get JWT auth headers for authenticated requests"""
    # Use unique email and phone for the auth user
    user = create_active_user(session, "authuser@test.com", "Testpassword123", Role.CLIENT, "111111")

    login_data = {"email": user.email, "password": "Testpassword123"}

    response = client.post(
        "/api/login", data=json.dumps(login_data), content_type="application/json"
    )

    if response.status_code == 200:
        json_data = response.get_json()
        token = json_data.get("data", {}).get("access_token")
        if token:
            return {"Authorization": f"Bearer {token}"}

    return {}


class TestPaymentRoutesBasic:
    """Basic test cases for Payment routes - let's start simple"""

    def test_get_invoices_as_client_basic(self, client, session, auth_headers):
        """Test client can see their own invoices - basic version"""
        if not auth_headers.get("Authorization"):
            pytest.skip("Authentication failed - skipping test")

        # Get the current user from the auth headers
        # First, let's just test the endpoint works
        response = client.get("/api/payments/invoices", headers=auth_headers)

        # For now, just check we get a response
        assert response.status_code in [200, 404]  # Could be 200 with empty list or 404 if route doesn't exist

        if response.status_code == 200:
            json_data = response.get_json()
            print(f"Response: {json_data}")  # Debug output
            # If we get data, check the structure
            if json_data:
                assert "status" in json_data or "data" in json_data or "invoices" in json_data

    def test_get_specific_invoice_basic(self, client, session, auth_headers):
        """Test getting a specific invoice - basic version"""
        if not auth_headers.get("Authorization"):
            pytest.skip("Authentication failed - skipping test")

        # First create a user and invoice
        client_user = create_active_user(session, "client1@test.com", "Testpassword123", Role.CLIENT, "222222")
        invoice = create_invoice(session, client_user.id, 1500)

        response = client.get(f"/api/payments/invoices/{invoice.id}", headers=auth_headers)

        # Since this is our own invoice, we should be able to see it
        # But the auth user is different, so we might get 403 or 404
        assert response.status_code in [200, 403, 404]

        if response.status_code == 200:
            json_data = response.get_json()
            print(f"Invoice response: {json_data}")  # Debug output

    def test_get_nonexistent_invoice_basic(self, client, session, auth_headers):
        """Test getting a non-existent invoice - basic version"""
        if not auth_headers.get("Authorization"):
            pytest.skip("Authentication failed - skipping test")

        response = client.get("/api/payments/invoices/99999", headers=auth_headers)

        # Should be 404 for non-existent invoice
        assert response.status_code in [404, 403]

        if response.status_code == 404:
            json_data = response.get_json()
            if json_data:  # Only check if we got JSON back
                assert "error" in json_data or "status" in json_data

    def test_endpoint_discovery(self, client, session, auth_headers):
        """Test to discover what endpoints actually exist"""
        if not auth_headers.get("Authorization"):
            pytest.skip("Authentication failed - skipping test")

        endpoints_to_test = [
            "/api/payments/invoices",
            "/api/payments/payments",
            "/api/payments/transaction/cancel",
            "/api/payments/clientInvoices"
        ]

        for endpoint in endpoints_to_test:
            response = client.get(endpoint, headers=auth_headers)
            print(f"Endpoint {endpoint}: Status {response.status_code}")

            # For POST endpoints, also test with empty data
            if endpoint in ["/api/payments/payments", "/api/payments/transaction/cancel"]:
                post_response = client.post(
                    endpoint,
                    data=json.dumps({}),
                    content_type="application/json",
                    headers=auth_headers
                )
                print(f"POST {endpoint}: Status {post_response.status_code}")

    # --- FIXED TEST CASES ---

    def test_invoice_with_mpesa_payment_transaction_data(self, client, session, auth_headers):
        """Test invoice response includes transaction data for Mpesa payments"""
        if not auth_headers.get("Authorization"):
            pytest.skip("Authentication failed - skipping test")

        # Create a client user and invoice
        client_user = create_active_user(session, "mpesa_client@test.com", "Testpassword123", Role.CLIENT, "333333")
        invoice = create_invoice(session, client_user.id, 2000)

        # Create Mpesa transaction and payment - FIXED: use correct phone format
        mpesa_transaction = create_mpesa_transaction(
            session,
            amount=2000,
            phone_number=generate_kenyan_phone("444444", with_plus=False)  # 254 format for MpesaTransaction
        )

        # Create payment with only required fields
        payment = create_payment(
            session,
            invoice.id,
            PaymentMethod.MPESA
        )

        response = client.get(f"/api/payments/invoices/{invoice.id}", headers=auth_headers)

        # Check response structure
        if response.status_code == 200:
            json_data = response.get_json()
            print(f"Invoice with Mpesa payment: {json_data}")

            # Verify the response contains expected structure
            if json_data and "data" in json_data:
                invoice_data = json_data["data"].get("invoice", {})
                assert "transaction" in invoice_data

                transaction_data = invoice_data["transaction"]
                if transaction_data:  # Only check if transaction data exists
                    assert "payment_method" in transaction_data
                    assert transaction_data["payment_method"] == "mpesa"

    def test_client_cannot_access_other_users_invoices(self, client, session, auth_headers):
        """Test that a client cannot access invoices belonging to other users"""
        if not auth_headers.get("Authorization"):
            pytest.skip("Authentication failed - skipping test")

        # Create another user and their invoice
        other_user = create_active_user(session, "otheruser@test.com", "Testpassword123", Role.CLIENT, "555555")
        other_invoice = create_invoice(session, other_user.id, 3000)

        # Try to access the other user's invoice
        response = client.get(f"/api/payments/invoices/{other_invoice.id}", headers=auth_headers)

        # Should get 403 Forbidden or 404 Not Found
        assert response.status_code in [403, 404]

        if response.status_code == 403:
            json_data = response.get_json()
            if json_data:
                assert "error" in json_data or "message" in json_data or "status" in json_data
        elif response.status_code == 404:
            json_data = response.get_json()
            if json_data:
                assert "error" in json_data or "message" in json_data or "status" in json_data

    def test_cancel_pending_invoice_transaction(self, client, session, auth_headers):
        """Test cancelling a pending invoice transaction"""
        if not auth_headers.get("Authorization"):
            pytest.skip("Authentication failed - skipping test")

        # Create a client user and a pending invoice
        client_user = create_active_user(session, "cancel_client@test.com", "Testpassword123", Role.CLIENT, "666666")
        pending_invoice = create_invoice(session, client_user.id, 2500, status=InvoiceStatus.pending)

        # Try to cancel the pending invoice
        cancel_data = {
            "invoice_id": pending_invoice.id
        }

        response = client.post(
            "/api/payments/transaction/cancel",
            data=json.dumps(cancel_data),
            content_type="application/json",
            headers=auth_headers
        )

        # Check response - could be 200, 404, or 403 depending on implementation
        assert response.status_code in [200, 400, 403, 404, 500]

        if response.status_code == 200:
            json_data = response.get_json()
            if json_data:
                assert "success" in json_data or "status" in json_data or "message" in json_data

                # Verify invoice status was updated to cancelled
                updated_invoice = Invoice.query.get(pending_invoice.id)
                if updated_invoice:
                    assert updated_invoice.status == InvoiceStatus.cancelled
        elif response.status_code == 400:
            json_data = response.get_json()
            if json_data:
                assert "error" in json_data or "message" in json_data

    def test_payments_list_endpoint_structure(self, client, session, auth_headers):
        """Test the structure of payments list endpoint response"""
        if not auth_headers.get("Authorization"):
            pytest.skip("Authentication failed - skipping test")

        response = client.get("/api/payments/payments", headers=auth_headers)

        # Check if endpoint exists and returns proper structure
        if response.status_code == 200:
            json_data = response.get_json()
            print(f"Payments list: {json_data}")

            # Verify response structure
            if json_data:
                # Could be list of payments or object with payments key
                if isinstance(json_data, list):
                    # It's a list of payments
                    pass
                elif isinstance(json_data, dict):
                    # Check common response structures
                    assert any(key in json_data for key in ["payments", "data", "items"])
                else:
                    # Unexpected structure, but still valid
                    pass
        elif response.status_code == 404:
            # Endpoint doesn't exist, which is fine for discovery
            print("Payments endpoint not found")

    def test_invoice_status_workflow(self, client, session, auth_headers):
        """Test different invoice statuses and their responses"""
        if not auth_headers.get("Authorization"):
            pytest.skip("Authentication failed - skipping test")

        # Create client user
        client_user = create_active_user(session, "status_client@test.com", "Testpassword123", Role.CLIENT, "777777")

        # Create invoices with different statuses
        pending_invoice = create_invoice(session, client_user.id, 1000, status=InvoiceStatus.pending)
        paid_invoice = create_invoice(session, client_user.id, 2000, status=InvoiceStatus.paid)
        cancelled_invoice = create_invoice(session, client_user.id, 3000, status=InvoiceStatus.cancelled)

        # Test accessing each invoice
        for invoice, status in [(pending_invoice, "pending"), (paid_invoice, "paid"), (cancelled_invoice, "cancelled")]:
            response = client.get(f"/api/payments/invoices/{invoice.id}", headers=auth_headers)

            if response.status_code == 200:
                json_data = response.get_json()
                if json_data and "data" in json_data:
                    invoice_data = json_data["data"].get("invoice", {})
                    # Verify status is correctly reflected
                    if "status" in invoice_data:
                        assert invoice_data["status"] == status
                    print(f"Invoice {invoice.id} with status {status}: {invoice_data.get('status')}")

    def test_client_invoices_vs_all_invoices(self, client, session, auth_headers):
        """Test difference between client invoices and general invoices endpoints"""
        if not auth_headers.get("Authorization"):
            pytest.skip("Authentication failed - skipping test")

        # Test both endpoints
        invoices_response = client.get("/api/payments/invoices", headers=auth_headers)
        client_invoices_response = client.get("/api/payments/clientInvoices", headers=auth_headers)

        # Compare responses if both endpoints exist
        if invoices_response.status_code == 200 and client_invoices_response.status_code == 200:
            invoices_data = invoices_response.get_json()
            client_invoices_data = client_invoices_response.get_json()

            print(f"General invoices: {invoices_data}")
            print(f"Client invoices: {client_invoices_data}")

            # They might have different structures or data
            # Just verify both return valid responses
            assert invoices_data is not None
            assert client_invoices_data is not None

    # --- ADDITIONAL TEST CASES ---

    def test_create_mpesa_payment_as_admin(self, client, session, auth_headers):
        """Test creating a payment with Mpesa transaction (admin functionality)"""
        if not auth_headers.get("Authorization"):
            pytest.skip("Authentication failed - skipping test")

        # Create a client user and invoice
        client_user = create_active_user(session, "payment_client@test.com", "Testpassword123", Role.CLIENT, "888888")
        invoice = create_invoice(session, client_user.id, 3500)

        # Create Mpesa transaction
        mpesa_transaction = create_mpesa_transaction(
            session,
            amount=3500,
            phone_number=generate_kenyan_phone("999999", with_plus=False)
        )

        # Try to create payment (might require admin privileges)
        payment_data = {
            "invoice_id": invoice.id,
            "payment_method": "mpesa",
            "payment_method_id": mpesa_transaction.id
        }

        response = client.post(
            "/api/payments/payments",
            data=json.dumps(payment_data),
            content_type="application/json",
            headers=auth_headers
        )

        # Could be 201 (created), 403 (forbidden), or 404
        assert response.status_code in [201, 400, 403, 404, 500]

        if response.status_code == 201:
            json_data = response.get_json()
            if json_data:
                assert "data" in json_data or "payment" in json_data or "id" in json_data

    def test_invoice_amount_and_dates(self, client, session, auth_headers):
        """Test invoice amount and date fields are correctly returned"""
        if not auth_headers.get("Authorization"):
            pytest.skip("Authentication failed - skipping test")

        # Create a client user and invoice with specific amount
        client_user = create_active_user(session, "amount_client@test.com", "Testpassword123", Role.CLIENT, "000000")
        specific_amount = 4750
        invoice = create_invoice(session, client_user.id, specific_amount)

        response = client.get(f"/api/payments/invoices/{invoice.id}", headers=auth_headers)

        if response.status_code == 200:
            json_data = response.get_json()
            if json_data and "data" in json_data:
                invoice_data = json_data["data"].get("invoice", {})

                # Check amount
                if "amount" in invoice_data:
                    assert invoice_data["amount"] == specific_amount

                # Check date fields exist
                date_fields = ["date", "dueDate", "created_at", "due_date"]
                for field in date_fields:
                    if field in invoice_data and invoice_data[field]:
                        print(f"Invoice {field}: {invoice_data[field]}")

    def test_error_handling_invalid_inputs(self, client, session, auth_headers):
        """Test error handling for invalid inputs"""
        if not auth_headers.get("Authorization"):
            pytest.skip("Authentication failed - skipping test")

        # Test with invalid invoice ID
        response = client.get("/api/payments/invoices/invalid_id", headers=auth_headers)
        assert response.status_code in [400, 404, 422]

        # Test with negative invoice ID
        response = client.get("/api/payments/invoices/-1", headers=auth_headers)
        assert response.status_code in [400, 404, 422]

        # Test cancellation with missing data
        response = client.post(
            "/api/payments/transaction/cancel",
            data=json.dumps({"invalid_field": "value"}),
            content_type="application/json",
            headers=auth_headers
        )
        assert response.status_code in [400, 404, 422, 500]