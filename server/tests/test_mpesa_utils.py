import pytest
import os
import base64
from datetime import datetime, timezone
from unittest.mock import patch, MagicMock, Mock

import requests
from utils.mpesa_utils import MpesaTokenManager, MpesaUtility, mpesa_utility

# Set environment variables for testing
os.environ["FLASK_MPESA_CONSUMER_KEY"] = "test_consumer_key"
os.environ["FLASK_MPESA_CONSUMER_SECRET"] = "test_consumer_secret"
os.environ["FLASK_MPESA_AUTH_URL"] = "https://sandbox.safaricom.co.ke/oauth/v1/generate"
os.environ["FLASK_MPESA_BUSINESS_SHORTCODE"] = "174379"
os.environ["FLASK_MPESA_PASSKEY"] = "test_passkey"
os.environ["FLASK_MPESA_CALLBACK_URL"] = "https://example.com/callback"
os.environ["FLASK_MPESA_STK_PUSH_URL"] = (
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
)
os.environ["FLASK_MPESA_QUERY_URL"] = (
    "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query"
)
os.environ["FLASK_MPESA_TIMEOUT"] = "30"


class TestMpesaTokenManager:
    """Test cases for MpesaTokenManager"""

    def setup_method(self):
        """Setup before each test"""
        self.token_manager = MpesaTokenManager()

    def teardown_method(self):
        """Cleanup after each test"""
        self.token_manager.token = None
        self.token_manager.expiry_time = None

    @patch("utils.mpesa_utils.requests.get")
    def test_get_token_success(self, mock_get):
        """Test successful token retrieval"""
        # Mock response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "access_token": "test_access_token",
            "expires_in": 3600,
        }
        mock_get.return_value = mock_response

        token = self.token_manager.get_token()

        assert token == "test_access_token"
        assert self.token_manager.token == "test_access_token"
        assert self.token_manager.expiry_time is not None
        mock_get.assert_called_once()

    @patch("utils.mpesa_utils.requests.get")
    def test_get_token_cached(self, mock_get):
        """Test token caching"""
        # Set up cached token
        self.token_manager.token = "cached_token"
        self.token_manager.expiry_time = datetime.now(timezone.utc).timestamp() + 3600

        token = self.token_manager.get_token()

        assert token == "cached_token"
        mock_get.assert_not_called()  # Should not make API call

    @patch("utils.mpesa_utils.requests.get")
    def test_get_token_expired(self, mock_get):
        """Test token refresh when expired"""
        # Set up expired token
        self.token_manager.token = "expired_token"
        self.token_manager.expiry_time = datetime.now(timezone.utc).timestamp() - 3600

        # Mock new token response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "access_token": "new_token",
            "expires_in": 3600,
        }
        mock_get.return_value = mock_response

        token = self.token_manager.get_token()

        assert token == "new_token"
        mock_get.assert_called_once()

    @patch("utils.mpesa_utils.requests.get")
    def test_get_token_http_error(self, mock_get):
        """Test token retrieval with HTTP error"""
        # Mock the request to raise a requests exception
        mock_get.side_effect = requests.exceptions.RequestException("Network error")

        # The method should raise an Exception with the specific message
        with pytest.raises(Exception, match="Failed to get MPESA token: Network error"):
            self.token_manager.get_token()

        mock_get.assert_called_once()

    def test_is_token_valid(self):
        """Test token validity check"""
        # Valid token
        self.token_manager.token = "test_token"
        self.token_manager.expiry_time = datetime.now(timezone.utc).timestamp() + 3600
        assert self.token_manager.is_token_valid() is True

        # Expired token
        self.token_manager.expiry_time = datetime.now(timezone.utc).timestamp() - 3600
        assert self.token_manager.is_token_valid() is False

        # No token
        self.token_manager.token = None
        assert self.token_manager.is_token_valid() is False


class TestMpesaUtility:
    """Test cases for MpesaUtility"""

    def setup_method(self):
        """Setup before each test"""
        self.mpesa_utility = MpesaUtility()

    def test_generate_password(self):
        """Test password generation"""
        business_shortcode = "174379"
        passkey = "test_passkey"

        password, timestamp = self.mpesa_utility.generate_password(
            business_shortcode, passkey
        )

        # Verify password is base64 encoded
        assert isinstance(password, str)
        assert isinstance(timestamp, str)
        assert len(timestamp) == 14  # YYYYMMDDHHMMSS

        # Verify the encoded content
        decoded = base64.b64decode(password).decode()
        expected_prefix = business_shortcode + passkey
        assert decoded.startswith(expected_prefix)

    def test_generate_password_with_numeric_shortcode(self):
        """Test password generation with numeric shortcode as string"""
        business_shortcode = 174379  # As number
        passkey = "test_passkey"

        password, timestamp = self.mpesa_utility.generate_password(
            business_shortcode, passkey
        )

        # Should work without type errors
        assert isinstance(password, str)
        assert isinstance(timestamp, str)

    @patch("utils.mpesa_utils.MpesaTokenManager.get_token")
    @patch("utils.mpesa_utils.requests.post")
    def test_initiate_stk_push_success(self, mock_post, mock_get_token):
        """Test successful STK push initiation"""
        # Mock token
        mock_get_token.return_value = "test_token"

        # Mock STK push response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "MerchantRequestID": "29115-34620561-1",
            "CheckoutRequestID": "ws_CO_191220191020363925",
            "ResponseCode": "0",
            "ResponseDescription": "Success",
            "CustomerMessage": "Success. Request accepted for processing",
        }
        mock_post.return_value = mock_response

        result = self.mpesa_utility.initiate_stk_push(
            amount=100,
            phone_number="254712345678",
            invoice_id=1,
            description="Test payment",
        )

        assert result["success"] is True
        assert result["MerchantRequestID"] == "29115-34620561-1"
        assert result["CheckoutRequestID"] == "ws_CO_191220191020363925"
        mock_post.assert_called_once()

    @patch("utils.mpesa_utils.MpesaTokenManager.get_token")
    @patch("utils.mpesa_utils.requests.post")
    def test_initiate_stk_push_failure(self, mock_post, mock_get_token):
        """Test STK push initiation failure"""
        mock_get_token.return_value = "test_token"

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "ResponseCode": "1",
            "ResponseDescription": "Failed",
        }
        mock_post.return_value = mock_response

        result = self.mpesa_utility.initiate_stk_push(
            amount=100, phone_number="254712345678"
        )

        assert result["success"] is False
        assert "Failed" in result["error"]

    @patch("utils.mpesa_utils.MpesaTokenManager.get_token")
    @patch("utils.mpesa_utils.requests.post")
    def test_initiate_stk_push_network_error(self, mock_post, mock_get_token):
        """Test STK push with network error"""
        mock_get_token.return_value = "test_token"
        mock_post.side_effect = Exception("Network error")

        result = self.mpesa_utility.initiate_stk_push(
            amount=100, phone_number="254712345678"
        )

        assert result["success"] is False
        assert "Network error" in result["error"]
