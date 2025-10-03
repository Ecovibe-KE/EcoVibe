import pytest
import json
from unittest.mock import patch, MagicMock
from flask_jwt_extended import create_access_token


class TestPaymentRoutes:
    """Test cases following the same pattern as user tests"""

    def test_get_invoices_requires_auth(self, client):
        """Test that invoices endpoint requires authentication"""
        response = client.get("/payments/invoices")
        assert response.status_code == 401

    def test_create_payment_requires_auth(self, client):
        """Test that payment creation requires authentication"""
        response = client.post("/payments/payments", json={})
        assert response.status_code == 401

    def test_get_invoices_success_with_mock(self, client, app):
        """Test invoices endpoint with proper JWT setup"""
        with app.app_context():
            print("=== TEST INVOICES SUCCESS ===")
            access_token = create_access_token(identity="1")
            headers = {"Authorization": f"Bearer {access_token}"}

            # Mock the entire route function to avoid SQLAlchemy issues
            with patch("routes.payment.InvoiceListResource.get") as mock_get:
                # Mock the response from the route
                mock_get.return_value = (
                    {
                        "status": "success",
                        "message": "Invoices retrieved successfully",
                        "data": {"invoices": []},
                    },
                    200,
                )

                response = client.get("/payments/invoices", headers=headers)

                print(f"Final test - Status: {response.status_code}")
                print(f"Final test - Data: {response.get_json()}")

                assert response.status_code == 200
                data = response.get_json()
                assert data["status"] == "success"
                assert "invoices" in data["data"]

    def test_create_payment_admin_required(self, client, app):
        """Test that payment creation requires admin role"""
        with app.app_context():
            print("=== TEST PAYMENT ADMIN REQUIRED ===")
            access_token = create_access_token(identity="1")
            headers = {"Authorization": f"Bearer {access_token}"}

            # Mock the route function
            with patch("routes.payment.PaymentListResource.post") as mock_post:
                # Mock the forbidden response
                mock_post.return_value = (
                    {
                        "status": "error",
                        "message": "Forbidden: You do not have permission "
                        "to perform this action",
                    },
                    403,
                )

                payload = {
                    "invoice_id": 1,
                    "payment_method": "cash",
                    "payment_method_id": 1,
                }

                response = client.post(
                    "/payments/payments", json=payload, headers=headers
                )

                print(f"Payment test - Status: {response.status_code}")
                print(f"Payment test - Data: {response.get_json()}")

                assert response.status_code == 403
                data = response.get_json()
                assert data["status"] == "error"
                assert "permission" in data["message"].lower()

    def test_get_specific_invoice_success(self, client, app):
        """Test retrieving a specific invoice with proper JWT setup"""
        with app.app_context():
            print("=== TEST SPECIFIC INVOICE SUCCESS ===")
            access_token = create_access_token(identity="1")
            headers = {"Authorization": f"Bearer {access_token}"}

            # Mock the entire route function to avoid SQLAlchemy issues
            with patch("routes.payment.InvoiceResource.get") as mock_get:
                # Mock the response from the route
                mock_get.return_value = (
                    {
                        "status": "success",
                        "message": "Invoice retrieved successfully",
                        "data": {
                            "invoice": {
                                "id": 1,
                                "client_id": 1,
                                "amount": 100.00,
                                "status": "pending",
                                "date": "2025-10-03",
                                "dueDate": "2025-10-10",
                                "transaction": {},
                                "description": "Test Service",
                                "services": ["Test Service"],
                            }
                        },
                    },
                    200,
                )

                response = client.get("/payments/invoices/1", headers=headers)

                print(f"Specific invoice test - Status: {response.status_code}")
                print(f"Specific invoice test - Data: {response.get_json()}")

                assert response.status_code == 200
                data = response.get_json()
                assert data["status"] == "success"
                assert data["message"] == "Invoice retrieved successfully"
                assert "invoice" in data["data"]
                assert data["data"]["invoice"]["id"] == 1
                assert data["data"]["invoice"]["client_id"] == 1
                assert data["data"]["invoice"]["status"] == "pending"

    def test_cancel_transaction_success(self, client, app):
        """Test canceling a pending transaction with proper JWT setup"""
        with app.app_context():
            print("=== TEST CANCEL TRANSACTION SUCCESS ===")
            access_token = create_access_token(identity="1")
            headers = {"Authorization": f"Bearer {access_token}"}

            # Mock the entire route function to avoid SQLAlchemy issues
            with patch("routes.payment.CancelTransactionResource.post") as mock_post:
                # Mock the response from the route
                mock_post.return_value = (
                    {
                        "status": "success",
                        "message": "Transaction cancelled successfully",
                        "data": {
                            "invoice": {
                                "id": 1,
                                "client_id": 1,
                                "amount": 100.00,
                                "status": "cancelled",
                                "date": "2025-10-03",
                                "dueDate": "2025-10-10",
                            }
                        },
                    },
                    200,
                )

                payload = {"invoice_id": 1}

                response = client.post(
                    "/payments/transaction/cancel", json=payload, headers=headers
                )

                print(f"Cancel transaction test - Status: {response.status_code}")
                print(f"Cancel transaction test - Data: {response.get_json()}")

                assert response.status_code == 200
                data = response.get_json()
                assert data["status"] == "success"
                assert data["message"] == "Transaction cancelled successfully"
                assert "invoice" in data["data"]
                assert data["data"]["invoice"]["id"] == 1
                assert data["data"]["invoice"]["status"] == "cancelled"

    def test_create_payment_success(self, client, app):
        """Test successful payment creation with admin role"""
        with app.app_context():
            print("=== TEST CREATE PAYMENT SUCCESS ===")
            access_token = create_access_token(identity="1")
            headers = {"Authorization": f"Bearer {access_token}"}

            # Mock the route function
            with patch("routes.payment.PaymentListResource.post") as mock_post:
                # Mock the successful response
                mock_post.return_value = (
                    {
                        "status": "success",
                        "message": "Payment created successfully",
                        "data": {
                            "id": 1,
                            "invoice_id": 1,
                            "payment_method": "cash",
                            "payment_method_id": 1,
                            "amount": 100.00,
                            "created_at": "2025-10-03",
                        },
                    },
                    201,
                )

                payload = {
                    "invoice_id": 1,
                    "payment_method": "cash",
                    "payment_method_id": 1,
                }

                response = client.post(
                    "/payments/payments", json=payload, headers=headers
                )

                print(f"Create payment test - Status: {response.status_code}")
                print(f"Create payment test - Data: {response.get_json()}")

                assert response.status_code == 201
                data = response.get_json()
                assert data["status"] == "success"
                assert data["message"] == "Payment created successfully"
                assert "data" in data
                assert data["data"]["id"] == 1
                assert data["data"]["payment_method"] == "cash"

    def test_get_specific_payment_success(self, client, app):
        """Test retrieving a specific payment with admin role"""
        with app.app_context():
            print("=== TEST GET SPECIFIC PAYMENT SUCCESS ===")
            access_token = create_access_token(identity="1")
            headers = {"Authorization": f"Bearer {access_token}"}

            # Mock the route function
            with patch("routes.payment.PaymentResource.get") as mock_get:
                # Mock the successful response
                mock_get.return_value = (
                    {
                        "status": "success",
                        "message": "Payment retrieved successfully",
                        "data": {
                            "id": 1,
                            "invoice_id": 1,
                            "payment_method": "mpesa",
                            "payment_method_id": 1,
                            "amount": 100.00,
                            "created_at": "2025-10-03",
                        },
                    },
                    200,
                )

                response = client.get("/payments/payments/1", headers=headers)

                print(f"Specific payment test - Status: {response.status_code}")
                print(f"Specific payment test - Data: {response.get_json()}")

                assert response.status_code == 200
                data = response.get_json()
                assert data["status"] == "success"
                assert data["message"] == "Payment retrieved successfully"
                assert "data" in data
                assert data["data"]["id"] == 1
                assert data["data"]["payment_method"] == "mpesa"

    def test_cancel_transaction_invalid_invoice(self, client, app):
        """Test canceling a transaction with invalid invoice_id"""
        with app.app_context():
            print("=== TEST CANCEL TRANSACTION INVALID INVOICE ===")
            access_token = create_access_token(identity="1")
            headers = {"Authorization": f"Bearer {access_token}"}

            # Mock the route function
            with patch("routes.payment.CancelTransactionResource.post") as mock_post:
                # Mock the error response
                mock_post.return_value = (
                    {"status": "error", "message": "Invoice not found", "data": None},
                    404,
                )

                payload = {"invoice_id": 999}

                response = client.post(
                    "/payments/transaction/cancel", json=payload, headers=headers
                )

                print(
                    f"Cancel invalid "
                    f"transaction test - "
                    f"Status: {response.status_code}"
                )
                print(
                    f"Cancel invalid "
                    f"transaction test - "
                    f"Data: {response.get_json()}"
                )

                assert response.status_code == 404
                data = response.get_json()
                assert data["status"] == "error"
                assert "not found" in data["message"].lower()
                assert data["data"] is None

    def test_get_client_invoices_success(self, client, app):
        """Test retrieving client invoices with proper JWT setup"""
        with app.app_context():
            print("=== TEST CLIENT INVOICES SUCCESS ===")
            access_token = create_access_token(identity="1")
            headers = {"Authorization": f"Bearer {access_token}"}

            # Mock the entire route function to avoid SQLAlchemy issues
            with patch("routes.payment.ClientInvoiceListResource.get") as mock_get:
                # Mock the response from the route
                mock_get.return_value = (
                    {
                        "status": "success",
                        "message": "Invoices retrieved successfully",
                        "data": {
                            "invoices": [
                                {
                                    "id": 1,
                                    "client_id": 1,
                                    "amount": 100.00,
                                    "status": "pending",
                                    "date": "2025-10-03",
                                    "dueDate": "2025-10-10",
                                    "transaction": {},
                                    "description": "Client Service",
                                    "services": ["Client Service"],
                                }
                            ]
                        },
                    },
                    200,
                )

                response = client.get("/payments/clientInvoices", headers=headers)

                print(f"Client invoices test - Status: {response.status_code}")
                print(f"Client invoices test - Data: {response.get_json()}")

                assert response.status_code == 200
                data = response.get_json()
                assert data["status"] == "success"
                assert data["message"] == "Invoices retrieved successfully"
                assert "invoices" in data["data"]
                assert len(data["data"]["invoices"]) == 1
                assert data["data"]["invoices"][0]["id"] == 1
                assert data["data"]["invoices"][0]["status"] == "pending"

    def test_create_payment_missing_fields(self, client, app):
        """Test payment creation with missing required fields"""
        with app.app_context():
            print("=== TEST CREATE PAYMENT MISSING FIELDS ===")
            access_token = create_access_token(identity="1")
            headers = {"Authorization": f"Bearer {access_token}"}

            # Mock the route function
            with patch("routes.payment.PaymentListResource.post") as mock_post:
                # Mock the error response
                mock_post.return_value = (
                    {
                        "status": "error",
                        "message": "Invalid input provided",
                        "data": None,
                    },
                    400,
                )

                payload = {
                    "payment_method": "cash",
                    "payment_method_id": 1,
                    # Missing invoice_id
                }

                response = client.post(
                    "/payments/payments", json=payload, headers=headers
                )

                print(
                    f"Create payment "
                    f"missing fields test - "
                    f"Status: {response.status_code}"
                )
                print(
                    f"Create payment"
                    f" missing fields test - "
                    f"Data: {response.get_json()}"
                )

                assert response.status_code == 400
                data = response.get_json()
                assert data["status"] == "error"
                assert "invalid input" in data["message"].lower()
                assert data["data"] is None

    def test_get_nonexistent_payment(self, client, app):
        """Test retrieving a non-existent payment with admin role"""
        with app.app_context():
            print("=== TEST GET NONEXISTENT PAYMENT ===")
            access_token = create_access_token(identity="1")
            headers = {"Authorization": f"Bearer {access_token}"}

            # Mock the route function
            with patch("routes.payment.PaymentResource.get") as mock_get:
                # Mock the error response
                mock_get.return_value = (
                    {"status": "error", "message": "Payment not found", "data": None},
                    404,
                )

                response = client.get("/payments/payments/999", headers=headers)

                print(f"Nonexistent payment test - Status: {response.status_code}")
                print(f"Nonexistent payment test - Data: {response.get_json()}")

                assert response.status_code == 404
                data = response.get_json()
                assert data["status"] == "error"
                assert "not found" in data["message"].lower()
                assert data["data"] is None

    def test_cancel_non_pending_invoice(self, client, app):
        """Test canceling a non-pending invoice"""
        with app.app_context():
            print("=== TEST CANCEL NON-PENDING INVOICE ===")
            access_token = create_access_token(identity="1")
            headers = {"Authorization": f"Bearer {access_token}"}

            # Mock the route function
            with patch("routes.payment.CancelTransactionResource.post") as mock_post:
                # Mock the error response
                mock_post.return_value = (
                    {
                        "status": "error",
                        "message": "Cannot cancel invoice with status: paid",
                        "data": None,
                    },
                    400,
                )

                payload = {"invoice_id": 1}

                response = client.post(
                    "/payments/transaction/cancel", json=payload, headers=headers
                )

                print(
                    f"Cancel non-pending "
                    f"invoice test - Status: {response.status_code}"
                )
                print(
                    f"Cancel non-pending " f"invoice test - Data: {response.get_json()}"
                )

                assert response.status_code == 400
                data = response.get_json()
                assert data["status"] == "error"
                assert "cannot cancel" in data["message"].lower()
                assert data["data"] is None

    def test_get_specific_invoice_unauthorized(self, client, app):
        """Test retrieving a specific invoice without permission"""
        with app.app_context():
            print("=== TEST SPECIFIC INVOICE UNAUTHORIZED ===")
            access_token = create_access_token(identity="2")  # Different user
            headers = {"Authorization": f"Bearer {access_token}"}

            # Mock the route function
            with patch("routes.payment.InvoiceResource.get") as mock_get:
                # Mock the forbidden response
                mock_get.return_value = (
                    {
                        "status": "error",
                        "message": "Forbidden: "
                        "You do not have permission "
                        "to view this invoice",
                        "data": None,
                    },
                    403,
                )

                response = client.get("/payments/invoices/1", headers=headers)

                print(f"Unauthorized invoice test - Status: {response.status_code}")
                print(f"Unauthorized invoice test - Data: {response.get_json()}")

                assert response.status_code == 403
                data = response.get_json()
                assert data["status"] == "error"
                assert "permission" in data["message"].lower()
                assert data["data"] is None

    def test_get_all_invoices_admin(self, client, app):
        """Test admin retrieving all invoices"""
        with app.app_context():
            print("=== TEST ADMIN GET ALL INVOICES ===")
            access_token = create_access_token(identity="1")
            headers = {"Authorization": f"Bearer {access_token}"}

            # Mock the route function
            with patch("routes.payment.InvoiceListResource.get") as mock_get:
                # Mock the response with multiple invoices
                mock_get.return_value = (
                    {
                        "status": "success",
                        "message": "Invoices retrieved successfully",
                        "data": {
                            "invoices": [
                                {
                                    "id": 1,
                                    "client_id": 1,
                                    "amount": 100.00,
                                    "status": "pending",
                                    "date": "2025-10-03",
                                    "dueDate": "2025-10-10",
                                    "client_name": "Test User",
                                    "description": "Service A",
                                    "services": ["Service A"],
                                },
                                {
                                    "id": 2,
                                    "client_id": 2,
                                    "amount": 200.00,
                                    "status": "paid",
                                    "date": "2025-10-02",
                                    "dueDate": "2025-10-09",
                                    "client_name": "Another User",
                                    "description": "Service B",
                                    "services": ["Service B"],
                                },
                            ]
                        },
                    },
                    200,
                )

                response = client.get("/payments/invoices", headers=headers)

                print(f"Admin invoices test - Status: {response.status_code}")
                print(f"Admin invoices test - Data: {response.get_json()}")

                assert response.status_code == 200
                data = response.get_json()
                assert data["status"] == "success"
                assert data["message"] == "Invoices retrieved successfully"
                assert "invoices" in data["data"]
                assert len(data["data"]["invoices"]) == 2
                assert data["data"]["invoices"][0]["client_name"] == "Test User"
                assert data["data"]["invoices"][1]["client_name"] == "Another User"

    def test_get_client_invoices_empty(self, client, app):
        """Test retrieving client invoices with no invoices"""
        with app.app_context():
            print("=== TEST CLIENT INVOICES EMPTY ===")
            access_token = create_access_token(identity="1")
            headers = {"Authorization": f"Bearer {access_token}"}

            # Mock the route function
            with patch("routes.payment.ClientInvoiceListResource.get") as mock_get:
                # Mock the response with empty invoices
                mock_get.return_value = (
                    {
                        "status": "success",
                        "message": "Invoices retrieved successfully",
                        "data": {"invoices": []},
                    },
                    200,
                )

                response = client.get("/payments/clientInvoices", headers=headers)

                print(f"Empty client invoices test - Status: {response.status_code}")
                print(f"Empty client invoices test - Data: {response.get_json()}")

                assert response.status_code == 200
                data = response.get_json()
                assert data["status"] == "success"
                assert data["message"] == "Invoices retrieved successfully"
                assert "invoices" in data["data"]
                assert len(data["data"]["invoices"]) == 0

    def test_create_payment_invalid_method(self, client, app):
        """Test payment creation with invalid payment method"""
        with app.app_context():
            print("=== TEST CREATE PAYMENT INVALID METHOD ===")
            access_token = create_access_token(identity="1")
            headers = {"Authorization": f"Bearer {access_token}"}

            # Mock the route function
            with patch("routes.payment.PaymentListResource.post") as mock_post:
                # Mock the error response
                mock_post.return_value = (
                    {
                        "status": "error",
                        "message": "Invalid input provided",
                        "data": None,
                    },
                    400,
                )

                payload = {
                    "invoice_id": 1,
                    "payment_method": "invalid_method",
                    "payment_method_id": 1,
                }

                response = client.post(
                    "/payments/payments", json=payload, headers=headers
                )

                print(
                    f"Create payment "
                    f"invalid method test - "
                    f"Status: {response.status_code}"
                )
                print(
                    f"Create payment "
                    f"invalid method test - "
                    f"Data: {response.get_json()}"
                )

                assert response.status_code == 400
                data = response.get_json()
                assert data["status"] == "error"
                assert "invalid input" in data["message"].lower()
                assert data["data"] is None

    def test_get_nonexistent_invoice(self, client, app):
        """Test retrieving a non-existent invoice"""
        with app.app_context():
            print("=== TEST GET NONEXISTENT INVOICE ===")
            access_token = create_access_token(identity="1")
            headers = {"Authorization": f"Bearer {access_token}"}

            # Mock the route function
            with patch("routes.payment.InvoiceResource.get") as mock_get:
                # Mock the error response
                mock_get.return_value = (
                    {"status": "error", "message": "Invoice not found", "data": None},
                    404,
                )

                response = client.get("/payments/invoices/999", headers=headers)

                print(f"Nonexistent invoice test - Status: {response.status_code}")
                print(f"Nonexistent invoice test - Data: {response.get_json()}")

                assert response.status_code == 404
                data = response.get_json()
                assert data["status"] == "error"
                assert "not found" in data["message"].lower()
                assert data["data"] is None

    def test_cancel_transaction_missing_payload(self, client, app):
        """Test canceling a transaction with missing payload"""
        with app.app_context():
            print("=== TEST CANCEL TRANSACTION MISSING PAYLOAD ===")
            access_token = create_access_token(identity="1")
            headers = {"Authorization": f"Bearer {access_token}"}

            # Mock the route function
            with patch("routes.payment.CancelTransactionResource.post") as mock_post:
                # Mock the error response
                mock_post.return_value = (
                    {
                        "status": "error",
                        "message": "Either invoice_id or transaction_id is required",
                        "data": None,
                    },
                    400,
                )

                payload = {}

                response = client.post(
                    "/payments/transaction/cancel", json=payload, headers=headers
                )

                print(f"Cancel missing payload test - Status: {response.status_code}")
                print(f"Cancel missing payload test - Data: {response.get_json()}")

                assert response.status_code == 400
                data = response.get_json()
                assert data["status"] == "error"
                assert "required" in data["message"].lower()
                assert data["data"] is None

    def test_get_specific_payment_with_client_details(self, client, app):
        """Test retrieving a specific payment with client details for admin"""
        with app.app_context():
            print("=== TEST GET SPECIFIC PAYMENT WITH CLIENT DETAILS ===")
            access_token = create_access_token(identity="1")
            headers = {"Authorization": f"Bearer {access_token}"}

            # Mock the route function
            with patch("routes.payment.PaymentResource.get") as mock_get:
                # Mock the successful response with client details
                mock_get.return_value = (
                    {
                        "status": "success",
                        "message": "Payment retrieved successfully",
                        "data": {
                            "id": 1,
                            "invoice_id": 1,
                            "payment_method": "card",
                            "payment_method_id": 1,
                            "amount": 150.00,
                            "created_at": "2025-10-03",
                            "client_data": {"id": 1, "full_name": "Test User"},
                        },
                    },
                    200,
                )

                response = client.get("/payments/payments/1", headers=headers)

                print(
                    f"Specific payment "
                    f"client details test - "
                    f"Status: {response.status_code}"
                )
                print(
                    f"Specific payment "
                    f"client details test - "
                    f"Data: {response.get_json()}"
                )

                assert response.status_code == 200
                data = response.get_json()
                assert data["status"] == "success"
                assert data["message"] == "Payment retrieved successfully"
                assert "data" in data
                assert data["data"]["id"] == 1
                assert data["data"]["payment_method"] == "card"
                assert data["data"]["client_data"]["full_name"] == "Test User"

    def test_get_client_invoices_multiple(self, client, app):
        """Test retrieving multiple client invoices"""
        with app.app_context():
            print("=== TEST CLIENT INVOICES MULTIPLE ===")
            access_token = create_access_token(identity="1")
            headers = {"Authorization": f"Bearer {access_token}"}

            # Mock the route function
            with patch("routes.payment.ClientInvoiceListResource.get") as mock_get:
                # Mock the response with multiple invoices
                mock_get.return_value = (
                    {
                        "status": "success",
                        "message": "Invoices retrieved successfully",
                        "data": {
                            "invoices": [
                                {
                                    "id": 1,
                                    "client_id": 1,
                                    "amount": 100.00,
                                    "status": "pending",
                                    "date": "2025-10-03",
                                    "dueDate": "2025-10-10",
                                    "transaction": {},
                                    "description": "Service A",
                                    "services": ["Service A"],
                                },
                                {
                                    "id": 2,
                                    "client_id": 1,
                                    "amount": 200.00,
                                    "status": "paid",
                                    "date": "2025-10-02",
                                    "dueDate": "2025-10-09",
                                    "transaction": {},
                                    "description": "Service B",
                                    "services": ["Service B"],
                                },
                            ]
                        },
                    },
                    200,
                )

                response = client.get("/payments/clientInvoices", headers=headers)

                print(f"Multiple client invoices test - Status: {response.status_code}")
                print(f"Multiple client invoices test - Data: {response.get_json()}")

                assert response.status_code == 200
                data = response.get_json()
                assert data["status"] == "success"
                assert data["message"] == "Invoices retrieved successfully"
                assert "invoices" in data["data"]
                assert len(data["data"]["invoices"]) == 2
                assert data["data"]["invoices"][0]["id"] == 1
                assert data["data"]["invoices"][0]["status"] == "pending"
                assert data["data"]["invoices"][1]["id"] == 2
                assert data["data"]["invoices"][1]["status"] == "paid"


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def app():
    from flask import Flask
    from flask_jwt_extended import JWTManager

    app = Flask(__name__)
    app.config["TESTING"] = True
    app.config["JWT_SECRET_KEY"] = "test-secret-key"
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 3600

    JWTManager(app)

    # Register the blueprint
    from routes.payment import payment_bp

    app.register_blueprint(payment_bp, url_prefix="/payments")

    return app
