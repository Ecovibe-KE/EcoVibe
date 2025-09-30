import json
import pytest
from unittest.mock import patch, MagicMock
from models.payment import MpesaTransaction
from models.user import User


@pytest.fixture
def auth_headers(client, session):
    """Fixture to get JWT auth headers for authenticated requests"""
    test_user = User(
        email="test@example.com",
        password="testpassword"
    )
    session.add(test_user)
    session.commit()

    # Login to get JWT token
    login_data = {
        "email": "test@example.com",
        "password": "testpassword"
    }

    response = client.post(
        "/api/login",
        data=json.dumps(login_data),
        content_type="application/json"
    )

    token = response.get_json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


class TestMpesaRoutes:
    """Test cases for MPESA routes"""

    @patch("routes.mpesa.mpesa_utility.initiate_stk_push")
    def test_initiate_stk_push_success(self, mock_stk_push, client, session, auth_headers):
        """Test successful STK push initiation"""
        # Mock the STK push response
        mock_stk_push.return_value = {
            "success": True,
            "MerchantRequestID": "29115-34620561-1",
            "CheckoutRequestID": "ws_CO_191220191020363925",
            "ResponseCode": "0",
            "ResponseDescription": "Success",
            "CustomerMessage": "Success. Request accepted for processing",
        }

        data = {
            "amount": 100,
            "phone_number": "254712345678",
            "invoice_id": 1,
            "description": "Test payment",
        }

        response = client.post(
            "/api/stk-push",
            data=json.dumps(data),
            content_type="application/json",
            headers=auth_headers  # FIX: Add auth headers
        )

        assert response.status_code == 200
        json_data = response.get_json()
        assert json_data["success"] is True
        assert json_data["MerchantRequestID"] == "29115-34620561-1"

    def test_initiate_stk_push_missing_parameters(self, client, session, auth_headers):
        """Test STK push with missing parameters"""
        data = {
            "amount": 100
            # Missing phone_number
        }

        response = client.post(
            "/api/stk-push",
            data=json.dumps(data),
            content_type="application/json",
            headers=auth_headers
        )

        assert response.status_code == 400
        json_data = response.get_json()
        assert "error" in json_data

    def test_initiate_stk_push_invalid_amount(self, client, session, auth_headers):
        """Test STK push with invalid amount"""
        data = {
            "amount": -100,  # Invalid negative amount
            "phone_number": "254712345678",
        }

        response = client.post(
            "/api/stk-push",
            data=json.dumps(data),
            content_type="application/json",
            headers=auth_headers
        )

        assert response.status_code == 400
        json_data = response.get_json()
        assert "error" in json_data

    def test_initiate_stk_push_invalid_phone(self, client, session, auth_headers):
        """Test STK push with invalid phone number"""
        data = {"amount": 100, "phone_number": "123456"}  # Invalid phone format

        response = client.post(
            "/api/stk-push",
            data=json.dumps(data),
            content_type="application/json",
            headers=auth_headers  # FIX: Add auth headers
        )

        assert response.status_code == 400
        json_data = response.get_json()
        assert "error" in json_data

    @patch("routes.mpesa.mpesa_utility.initiate_stk_push")
    def test_initiate_stk_push_utility_failure(self, mock_stk_push, client, session, auth_headers):
        """Test STK push when utility fails"""
        mock_stk_push.return_value = {
            "success": False,
            "error": "MPESA service unavailable",
        }

        data = {"amount": 100, "phone_number": "254712345678", "invoice_id": 1}

        response = client.post(
            "/api/stk-push",
            data=json.dumps(data),
            content_type="application/json",
            headers=auth_headers,
        )

        assert response.status_code == 400
        json_data = response.get_json()
        assert "error" in json_data

    def test_mpesa_callback_success(self, client, session):
        """Test MPESA callback for successful payment"""
        transaction = MpesaTransaction(
            merchant_request_id="29115-34620561-1",
            checkout_request_id="ws_CO_191220191020363925",
            amount=100,
            phone_number="254712345678",
            paid_by=1,
        )
        session.add(transaction)
        session.commit()

        callback_data = {
            "Body": {
                "stkCallback": {
                    "MerchantRequestID": "29115-34620561-1",
                    "CheckoutRequestID": "ws_CO_191220191020363925",
                    "ResultCode": 0,
                    "ResultDesc": "The service request is processed successfully.",
                    "CallbackMetadata": {
                        "Item": [
                            {"Name": "Amount", "Value": 100.0},
                            {"Name": "MpesaReceiptNumber", "Value": "TEST123456"},
                            {"Name": "TransactionDate", "Value": "20231219102036"},
                            {"Name": "PhoneNumber", "Value": 254712345678},
                        ]
                    },
                }
            }
        }

        response = client.post(
            "/api/callback",
            data=json.dumps(callback_data),
            content_type="application/json",
        )

        assert response.status_code == 200
        json_data = response.get_json()
        assert json_data["ResultCode"] == 0

        # Verify transaction was updated
        updated_transaction = session.get(MpesaTransaction, transaction.id)
        assert updated_transaction.result_code == 0
        assert updated_transaction.mpesa_receipt_number == "TEST123456"
        assert updated_transaction.status == "completed"

    def test_mpesa_callback_failed_payment(self, client, session):
        """Test MPESA callback for failed payment"""
        transaction = MpesaTransaction(
            merchant_request_id="29115-34620561-2",
            checkout_request_id="ws_CO_191220191020363926",
            amount=100,
            phone_number="254712345678",
            paid_by=1,  # FIX: Add required paid_by field
        )
        session.add(transaction)
        session.commit()

        callback_data = {
            "Body": {
                "stkCallback": {
                    "MerchantRequestID": "29115-34620561-2",
                    "CheckoutRequestID": "ws_CO_191220191020363926",
                    "ResultCode": 1032,
                    "ResultDesc": "Request cancelled by user",
                }
            }
        }

        response = client.post(
            "/api/callback",
            data=json.dumps(callback_data),
            content_type="application/json",
        )

        assert response.status_code == 200

        # Verify transaction was marked as failed
        updated_transaction = session.get(MpesaTransaction, transaction.id)
        assert updated_transaction.result_code == 1032
        assert updated_transaction.status == "failed"

    def test_mpesa_callback_invalid_format(self, client, session):
        """Test MPESA callback with invalid data format"""
        callback_data = {"Invalid": "format"}

        response = client.post(
            "/api/callback",
            data=json.dumps(callback_data),
            content_type="application/json",
        )

        assert response.status_code == 400

    def test_get_mpesa_transactions(self, client, session, auth_headers):  # FIX: Add auth_headers
        """Test retrieving MPESA transactions"""
        # Create test transactions
        transaction1 = MpesaTransaction(
            merchant_request_id="req1",
            checkout_request_id="check1",
            amount=100,
            phone_number="254712345678",
            status="completed",
            paid_by=1,  # FIX: Add required paid_by field
        )
        transaction2 = MpesaTransaction(
            merchant_request_id="req2",
            checkout_request_id="check2",
            amount=200,
            phone_number="254712345679",
            status="pending",
            paid_by=1,  # FIX: Add required paid_by field
        )
        session.add_all([transaction1, transaction2])
        session.commit()

        response = client.get(
            "/api/transactions",
            headers=auth_headers  # FIX: Add auth headers
        )

        assert response.status_code == 200
        json_data = response.get_json()
        assert len(json_data) == 2

    def test_get_mpesa_transaction(self, client, session, auth_headers):  # FIX: Add auth_headers
        """Test retrieving a single MPESA transaction"""
        transaction = MpesaTransaction(
            merchant_request_id="req1",
            checkout_request_id="check1",
            amount=100,
            phone_number="254712345678",
            paid_by=1,  # FIX: Add required paid_by field
        )
        session.add(transaction)
        session.commit()

        response = client.get(
            f"/api/transactions/{transaction.id}",
            headers=auth_headers  # FIX: Add auth headers
        )

        assert response.status_code == 200
        json_data = response.get_json()
        assert json_data["merchant_request_id"] == "req1"
        assert json_data["amount"] == 100

    def test_get_mpesa_transaction_not_found(self, client, session, auth_headers):  # FIX: Add auth_headers
        """Test retrieving non-existent MPESA transaction"""
        response = client.get(
            "/api/transactions/999",
            headers=auth_headers  # FIX: Add auth headers
        )

        assert response.status_code == 404

    @patch("routes.mpesa.mpesa_utility.check_transaction_status")  # FIX: Correct import path
    def test_get_transaction_status(self, mock_status_check, client, session, auth_headers):  # FIX: Add auth_headers
        """Test checking transaction status"""
        transaction = MpesaTransaction(
            merchant_request_id="req1",
            checkout_request_id="check1",
            amount=100,
            phone_number="254712345678",
            paid_by=1,  # FIX: Add required paid_by field
        )
        session.add(transaction)
        session.commit()

        mock_status_check.return_value = {
            "success": True,
            "result_code": "0",
            "result_desc": "Transaction completed successfully",
        }

        response = client.get(
            f"/api/transactions/{transaction.id}/status",
            headers=auth_headers  # FIX: Add auth headers
        )

        assert response.status_code == 200
        json_data = response.get_json()
        assert json_data["success"] is True
        assert json_data["result_code"] == "0"

    def test_get_transaction_status_not_found(self, client, session, auth_headers):  # FIX: Add auth_headers
        """Test checking status of non-existent transaction"""
        response = client.get(
            "/api/transactions/999/status",
            headers=auth_headers  # FIX: Add auth headers
        )

        assert response.status_code == 404