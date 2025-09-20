import unittest
from unittest.mock import patch, MagicMock
from app import create_app
import json

class ContactTestCase(unittest.TestCase):

    def setUp(self):
        """Set up test client and app"""
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

    def tearDown(self):
        """Clean up after tests"""
        pass

    # Test 1: Successful contact form submission
    @patch('routes.contact.send_contact_email')
    def test_contact_success(self, mock_send_email):
        """Test successful contact form submission"""
        # Mock the email sending to return success
        mock_send_email.return_value = (True, "Email sent successfully")

        contact_data = {
            'name': 'John Doe',
            'phone': '+1234567890',
            'industry': 'Technology',
            'email': 'john@example.com',
            'message': 'This is a test message'
        }

        response = self.client.post(
            '/contact',
            data=json.dumps(contact_data),
            content_type='application/json'
        )

        data = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['message'], 'Contact form submitted successfully')
        self.assertEqual(mock_send_email.call_count, 2)  # Called twice (admin + client)

    # Test 2: Missing required fields
    def test_contact_missing_fields(self):
        """Test contact form with missing required fields"""
        contact_data = {
            'name': 'John Doe',
            'phone': '+1234567890',
            # Missing industry, email, message
        }

        response = self.client.post(
            '/contact',
            data=json.dumps(contact_data),
            content_type='application/json'
        )

        data = response.get_json()

        self.assertEqual(response.status_code, 400)
        self.assertIn('Missing required fields', data['error'])
        self.assertIn('industry', data['error'])
        self.assertIn('email', data['error'])
        self.assertIn('message', data['error'])

    # Test 3: Empty data
    def test_contact_empty_data(self):
        """Test contact form with empty data"""
        response = self.client.post(
            '/contact',
            data=json.dumps({}),
            content_type='application/json'
        )

        data = response.get_json()

        self.assertEqual(response.status_code, 400)
        self.assertEqual(data['error'], 'No data provided')

    # Test 4: Email sending failure
    @patch('routes.contact.send_contact_email')
    def test_contact_email_failure(self, mock_send_email):
        """Test contact form when email sending fails"""
        # Mock first email success, second email failure
        mock_send_email.side_effect = [
            (True, "Admin email sent"),
            (False, "SMTP connection failed")
        ]

        contact_data = {
            'name': 'John Doe',
            'phone': '+1234567890',
            'industry': 'Technology',
            'email': 'john@example.com',
            'message': 'This is a test message'
        }

        response = self.client.post(
            '/contact',
            data=json.dumps(contact_data),
            content_type='application/json'
        )

        data = response.get_json()

        self.assertEqual(response.status_code, 500)
        self.assertIn('Admin: Admin email sent', data['error'])
        self.assertIn('Client: SMTP connection failed', data['error'])

    # Test 5: Invalid JSON
    def test_contact_invalid_json(self):
        """Test contact form with invalid JSON"""
        response = self.client.post(
            '/contact',
            data='invalid json',
            content_type='application/json'
        )

        data = response.get_json()

        self.assertEqual(response.status_code, 400)
        self.assertEqual(data['error'], 'No data provided')

    # Test 6: Edge case - very long fields
    @patch('routes.contact.send_contact_email')
    def test_contact_long_fields(self, mock_send_email):
        """Test contact form with very long field values"""
        mock_send_email.return_value = (True, "Email sent successfully")

        long_message = 'A' * 1000  # Very long message
        contact_data = {
            'name': 'John Doe',
            'phone': '+1234567890',
            'industry': 'Technology',
            'email': 'john@example.com',
            'message': long_message
        }

        response = self.client.post(
            '/contact',
            data=json.dumps(contact_data),
            content_type='application/json'
        )

        data = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['message'], 'Contact form submitted successfully')

    # Test 7: Special characters in fields
    @patch('routes.contact.send_contact_email')
    def test_contact_special_characters(self, mock_send_email):
        """Test contact form with special characters"""
        mock_send_email.return_value = (True, "Email sent successfully")

        contact_data = {
            'name': 'Jöhn Dœ',
            'phone': '+1 (234) 567-890',
            'industry': 'Téchñology',
            'email': 'john.test+tag@example.com',
            'message': 'Message with special chars: !@#$%^&*()_+{}|:"<>?~`'
        }

        response = self.client.post(
            '/contact',
            data=json.dumps(contact_data),
            content_type='application/json'
        )

        data = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['message'], 'Contact form submitted successfully')

if __name__ == '__main__':
    unittest.main()