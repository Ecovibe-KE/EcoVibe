import pytest
import json
import base64
from unittest.mock import patch, MagicMock
from models.service import Service, ServiceStatus
from models.user import User, Role, AccountStatus


class TestServicesRoutes:
    """Test cases for services routes"""

    @pytest.fixture
    def mock_service_data(self):
        """Mock service data for testing"""
        return {
            'title': 'Test Service',
            'description': 'Test service description',
            'price': 100.0,
            'duration': '2 hr 30 min',
            'status': 'active',
            'currency': 'KES'
        }

    @pytest.fixture
    def mock_image_data(self):
        """Mock base64 image data for testing"""
        # Create a small red dot PNG image in base64
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

    @pytest.fixture
    def admin_user(self, db):
        """Create an admin user for testing"""
        user = User(
            email='admin@test.com',
            role=Role.ADMIN,
            account_status=AccountStatus.ACTIVE
        )
        user.set_password('password123')
        db.session.add(user)
        db.session.commit()
        return user

    @pytest.fixture
    def regular_user(self, db):
        """Create a regular user for testing"""
        user = User(
            email='regular@test.com',
            role=Role.USER,
            account_status=AccountStatus.ACTIVE
        )
        user.set_password('password123')
        db.session.add(user)
        db.session.commit()
        return user

    @pytest.fixture
    def sample_service(self, db, admin_user):
        """Create a sample service for testing"""
        service = Service(
            title='Sample Service',
            description='Sample service description',
            price=150.0,
            duration='1 hr 30 min',
            status=ServiceStatus.ACTIVE,
            admin_id=admin_user.id,
            currency='KES',
            image=b'sample_image_data'  # Minimal binary image data
        )
        db.session.add(service)
        db.session.commit()
        return service

    def test_get_all_services_success(self, client, sample_service):
        """Test getting all services successfully"""
        response = client.get('/services')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert data['status'] == 'success'
        assert data['message'] == 'Services fetched successfully'
        assert isinstance(data['data'], list)
        # Check that our sample service is in the response
        service_titles = [service['title'] for service in data['data']]
        assert 'Sample Service' in service_titles

    def test_get_all_services_empty(self, client):
        """Test getting all services when no services exist"""
        response = client.get('/services')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert data['status'] == 'success'
        assert data['message'] == 'Services fetched successfully'
        assert data['data'] == []

    def test_get_service_by_id_success(self, client, sample_service):
        """Test getting a specific service by ID"""
        response = client.get(f'/services/{sample_service.id}')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert data['status'] == 'success'
        assert data['message'] == 'Service fetched successfully'
        assert data['data']['id'] == sample_service.id
        assert data['data']['title'] == 'Sample Service'
        assert data['data']['description'] == 'Sample service description'
        assert data['data']['price'] == 150.0
        assert data['data']['status'] == 'active'

    def test_get_service_by_id_not_found(self, client):
        """Test getting a service with non-existent ID"""
        response = client.get('/services/999')
        
        assert response.status_code == 404
        data = json.loads(response.data)
        
        assert data['status'] == 'failed'
        assert 'not found' in data['message'].lower()

    def test_create_service_success(self, client, admin_user, mock_service_data, mock_image_data):
        """Test creating a service successfully as admin"""
        # Login as admin user first
        login_response = client.post('/auth/login', json={
            'email': 'admin@test.com',
            'password': 'password123'
        })
        token = json.loads(login_response.data)['access_token']
        
        # Create service with image
        service_data = mock_service_data.copy()
        service_data['image'] = mock_image_data
        
        response = client.post(
            '/services',
            json=service_data,
            headers={'Authorization': f'Bearer {token}'}
        )
        
        assert response.status_code == 201
        data = json.loads(response.data)
        
        assert data['status'] == 'success'
        assert data['message'] == 'Service created successfully'
        assert data['data']['title'] == 'Test Service'
        assert data['data']['price'] == 100.0
        assert data['data']['status'] == 'active'
        assert data['data']['currency'] == 'KES'
        assert 'image' in data['data']  # Should have base64 image

    def test_create_service_unauthorized(self, client, mock_service_data, mock_image_data):
        """Test creating a service without authentication"""
        service_data = mock_service_data.copy()
        service_data['image'] = mock_image_data
        
        response = client.post('/services', json=service_data)
        
        assert response.status_code == 401  # Unauthorized

    def test_create_service_insufficient_permissions(self, client, regular_user, mock_service_data, mock_image_data):
        """Test creating a service as regular user (non-admin)"""
        # Login as regular user
        login_response = client.post('/auth/login', json={
            'email': 'regular@test.com',
            'password': 'password123'
        })
        token = json.loads(login_response.data)['access_token']
        
        service_data = mock_service_data.copy()
        service_data['image'] = mock_image_data
        
        response = client.post(
            '/services',
            json=service_data,
            headers={'Authorization': f'Bearer {token}'}
        )
        
        assert response.status_code == 403
        data = json.loads(response.data)
        
        assert data['status'] == 'failed'
        assert 'admin' in data['message'].lower()

    def test_create_service_missing_required_fields(self, client, admin_user, mock_image_data):
        """Test creating a service with missing required fields"""
        login_response = client.post('/auth/login', json={
            'email': 'admin@test.com',
            'password': 'password123'
        })
        token = json.loads(login_response.data)['access_token']
        
        # Missing title and description
        incomplete_data = {
            'price': 100.0,
            'duration': '1 hr 0 min',
            'status': 'active',
            'image': mock_image_data
        }
        
        response = client.post(
            '/services',
            json=incomplete_data,
            headers={'Authorization': f'Bearer {token}'}
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        
        assert data['status'] == 'error'
        assert 'required' in data['message'].lower()

    def test_create_service_invalid_price(self, client, admin_user, mock_service_data, mock_image_data):
        """Test creating a service with invalid price"""
        login_response = client.post('/auth/login', json={
            'email': 'admin@test.com',
            'password': 'password123'
        })
        token = json.loads(login_response.data)['access_token']
        
        service_data = mock_service_data.copy()
        service_data['image'] = mock_image_data
        service_data['price'] = -50.0  # Invalid negative price
        
        response = client.post(
            '/services',
            json=service_data,
            headers={'Authorization': f'Bearer {token}'}
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        
        assert data['status'] == 'error'
        assert 'price' in data['message'].lower()
        assert 'greater than 0' in data['message'].lower()

    def test_create_service_invalid_duration_format(self, client, admin_user, mock_service_data, mock_image_data):
        """Test creating a service with invalid duration format"""
        login_response = client.post('/auth/login', json={
            'email': 'admin@test.com',
            'password': 'password123'
        })
        token = json.loads(login_response.data)['access_token']
        
        service_data = mock_service_data.copy()
        service_data['image'] = mock_image_data
        service_data['duration'] = 'invalid duration format'
        
        response = client.post(
            '/services',
            json=service_data,
            headers={'Authorization': f'Bearer {token}'}
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        
        assert data['status'] == 'error'
        assert 'duration' in data['message'].lower()

    def test_create_service_invalid_status(self, client, admin_user, mock_service_data, mock_image_data):
        """Test creating a service with invalid status"""
        login_response = client.post('/auth/login', json={
            'email': 'admin@test.com',
            'password': 'password123'
        })
        token = json.loads(login_response.data)['access_token']
        
        service_data = mock_service_data.copy()
        service_data['image'] = mock_image_data
        service_data['status'] = 'invalid_status'
        
        response = client.post(
            '/services',
            json=service_data,
            headers={'Authorization': f'Bearer {token}'}
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        
        assert data['status'] == 'failed'

    def test_create_service_large_image(self, client, admin_user, mock_service_data):
        """Test creating a service with image that's too large"""
        login_response = client.post('/auth/login', json={
            'email': 'admin@test.com',
            'password': 'password123'
        })
        token = json.loads(login_response.data)['access_token']
        
        service_data = mock_service_data.copy()
        # Create a base64 string that would be larger than 5MB when decoded
        large_base64 = 'A' * (7 * 1024 * 1024)  # 7MB base64 string
        service_data['image'] = f"data:image/png;base64,{large_base64}"
        
        response = client.post(
            '/services',
            json=service_data,
            headers={'Authorization': f'Bearer {token}'}
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        
        assert data['status'] == 'error'
        assert 'image size' in data['message'].lower()

    def test_update_service_success(self, client, admin_user, sample_service):
        """Test updating a service successfully"""
        login_response = client.post('/auth/login', json={
            'email': 'admin@test.com',
            'password': 'password123'
        })
        token = json.loads(login_response.data)['access_token']
        
        update_data = {
            'title': 'Updated Service Title',
            'description': 'Updated service description',
            'price': 200.0
        }
        
        response = client.put(
            f'/services/{sample_service.id}',
            json=update_data,
            headers={'Authorization': f'Bearer {token}'}
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert data['status'] == 'success'
        assert data['message'] == 'Service updated successfully'
        assert data['data']['title'] == 'Updated Service Title'
        assert data['data']['description'] == 'Updated service description'
        assert data['data']['price'] == 200.0

    def test_update_service_not_found(self, client, admin_user):
        """Test updating a non-existent service"""
        login_response = client.post('/auth/login', json={
            'email': 'admin@test.com',
            'password': 'password123'
        })
        token = json.loads(login_response.data)['access_token']
        
        update_data = {'title': 'Updated Title'}
        
        response = client.put(
            '/services/999',
            json=update_data,
            headers={'Authorization': f'Bearer {token}'}
        )
        
        assert response.status_code == 404
        data = json.loads(response.data)
        
        assert data['status'] == 'failed'

    def test_update_service_status(self, client, admin_user, sample_service):
        """Test updating a service status"""
        login_response = client.post('/auth/login', json={
            'email': 'admin@test.com',
            'password': 'password123'
        })
        token = json.loads(login_response.data)['access_token']
        
        update_data = {
            'status': 'inactive'
        }
        
        response = client.put(
            f'/services/{sample_service.id}',
            json=update_data,
            headers={'Authorization': f'Bearer {token}'}
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert data['status'] == 'success'
        assert data['data']['status'] == 'inactive'

    def test_delete_service_success(self, client, admin_user, sample_service):
        """Test deleting a service successfully"""
        login_response = client.post('/auth/login', json={
            'email': 'admin@test.com',
            'password': 'password123'
        })
        token = json.loads(login_response.data)['access_token']
        
        response = client.delete(
            f'/services/{sample_service.id}',
            headers={'Authorization': f'Bearer {token}'}
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert data['status'] == 'success'
        assert data['message'] == 'Service deleted successfully'

        # Verify the service was actually deleted
        verify_response = client.get(f'/services/{sample_service.id}')
        assert verify_response.status_code == 404

    def test_delete_service_not_found(self, client, admin_user):
        """Test deleting a non-existent service"""
        login_response = client.post('/auth/login', json={
            'email': 'admin@test.com',
            'password': 'password123'
        })
        token = json.loads(login_response.data)['access_token']
        
        response = client.delete(
            '/services/999',
            headers={'Authorization': f'Bearer {token}'}
        )
        
        assert response.status_code == 404
        data = json.loads(response.data)
        
        assert data['status'] == 'failed'

    def test_get_my_services_success(self, client, admin_user, sample_service):
        """Test getting services created by the current admin"""
        login_response = client.post('/auth/login', json={
            'email': 'admin@test.com',
            'password': 'password123'
        })
        token = json.loads(login_response.data)['access_token']
        
        response = client.get(
            '/services/my-services',
            headers={'Authorization': f'Bearer {token}'}
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert data['status'] == 'success'
        assert data['message'] == 'Services fetched successfully'
        assert isinstance(data['data'], list)
        assert len(data['data']) >= 1
        assert data['data'][0]['title'] == 'Sample Service'
        assert data['count'] == len(data['data'])

    def test_get_services_by_status(self, client, admin_user, sample_service):
        """Test getting services by status"""
        login_response = client.post('/auth/login', json={
            'email': 'admin@test.com',
            'password': 'password123'
        })
        token = json.loads(login_response.data)['access_token']
        
        response = client.get(
            '/services/status/active',
            headers={'Authorization': f'Bearer {token}'}
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert data['status'] == 'success'
        assert 'active' in data['message'].lower()
        assert isinstance(data['data'], list)
        # Should have at least our sample service
        service_titles = [s['title'] for s in data['data']]
        assert 'Sample Service' in service_titles

    def test_get_services_by_invalid_status(self, client, admin_user):
        """Test getting services by invalid status"""
        login_response = client.post('/auth/login', json={
            'email': 'admin@test.com',
            'password': 'password123'
        })
        token = json.loads(login_response.data)['access_token']
        
        response = client.get(
            '/services/status/invalid_status',
            headers={'Authorization': f'Bearer {token}'}
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        
        assert data['status'] == 'failed'
        assert 'invalid' in data['message'].lower()

    def test_service_currency_default(self, client, admin_user, mock_service_data, mock_image_data):
        """Test that service currency defaults to KES if not provided"""
        login_response = client.post('/auth/login', json={
            'email': 'admin@test.com',
            'password': 'password123'
        })
        token = json.loads(login_response.data)['access_token']
        
        service_data = mock_service_data.copy()
        service_data['image'] = mock_image_data
        del service_data['currency']  # Remove currency to test default
        
        response = client.post(
            '/services',
            json=service_data,
            headers={'Authorization': f'Bearer {token}'}
        )
        
        assert response.status_code == 201
        data = json.loads(response.data)
        
        assert data['data']['currency'] == 'KES'  # Should default to KES

    def test_service_image_base64_conversion(self, client, sample_service):
        """Test that service image is properly converted to base64 in response"""
        response = client.get(f'/services/{sample_service.id}')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert data['status'] == 'success'
        assert 'image' in data['data']
        # Image should be a base64 string starting with data:image
        assert data['data']['image'].startswith('data:image')

    def test_service_duration_validation_edge_cases(self, client, admin_user, mock_service_data, mock_image_data):
        """Test duration validation with edge cases"""
        login_response = client.post('/auth/login', json={
            'email': 'admin@test.com',
            'password': 'password123'
        })
        token = json.loads(login_response.data)['access_token']
        
        # Test zero duration
        service_data = mock_service_data.copy()
        service_data['image'] = mock_image_data
        service_data['duration'] = '0 hr 0 min'
        
        response = client.post(
            '/services',
            json=service_data,
            headers={'Authorization': f'Bearer {token}'}
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['status'] == 'error'
        assert 'duration' in data['message'].lower()

        # Test negative hours
        service_data['duration'] = '-1 hr 30 min'
        response = client.post(
            '/services',
            json=service_data,
            headers={'Authorization': f'Bearer {token}'}
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['status'] == 'error'

        # Test minutes >= 60
        service_data['duration'] = '1 hr 60 min'
        response = client.post(
            '/services',
            json=service_data,
            headers={'Authorization': f'Bearer {token}'}
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['status'] == 'error'