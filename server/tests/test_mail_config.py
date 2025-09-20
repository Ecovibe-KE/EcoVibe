import unittest
from unittest.mock import patch, MagicMock
import smtplib

from server.utils.mail_config import send_email


# from utils.mail_config import send_email


class MailConfigTestCase(unittest.TestCase):

    @patch('utils.mail_config.smtplib.SMTP_SSL')
    def test_send_email_success(self, mock_smtp_ssl):
        """Test successful email sending"""
        # Mock SMTP connection
        mock_server = MagicMock()
        mock_smtp_ssl.return_value.__enter__.return_value = mock_server

        success, message = send_email(
            to_email='test@example.com',
            subject='Test Subject',
            body='Test Body'
        )

        self.assertTrue(success)
        self.assertEqual(message, "Email sent successfully")
        mock_server.login.assert_called_once()
        mock_server.sendmail.assert_called_once()

    @patch('utils.mail_config.smtplib.SMTP_SSL')
    def test_send_email_smtp_error(self, mock_smtp_ssl):
        """Test email sending with SMTP error"""
        mock_smtp_ssl.side_effect = smtplib.SMTPException("SMTP connection failed")

        success, message = send_email(
            to_email='test@example.com',
            subject='Test Subject',
            body='Test Body'
        )

        self.assertFalse(success)
        self.assertIn("SMTP connection failed", message)

    @patch('utils.mail_config.smtplib.SMTP_SSL')
    def test_send_email_login_error(self, mock_smtp_ssl):
        """Test email sending with login error"""
        mock_server = MagicMock()
        mock_server.login.side_effect = smtplib.SMTPAuthenticationError(535, "Authentication failed")
        mock_smtp_ssl.return_value.__enter__.return_value = mock_server

        success, message = send_email(
            to_email='test@example.com',
            subject='Test Subject',
            body='Test Body'
        )

        self.assertFalse(success)
        self.assertIn("Authentication failed", message)


if __name__ == '__main__':
    unittest.main()