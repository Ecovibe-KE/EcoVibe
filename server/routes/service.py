from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.exceptions import NotFound, BadRequest, Forbidden
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
import base64
from models import db
from models.service import Service, ServiceStatus
from models.user import User, Role, AccountStatus

# Create blueprint
services_bp = Blueprint('services', __name__)

def require_admin():
    """
    Verify that the current JWT user has admin or super_admin privileges
    and is active.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        raise Forbidden("User not found")
    
    if user.account_status != AccountStatus.ACTIVE:
        raise Forbidden("User account is not active")
    
    if user.role not in [Role.ADMIN, Role.SUPER_ADMIN]:
        raise Forbidden("Only admin and super_admin users can perform this action")
    
    return user

@services_bp.route('/services', methods=['GET'])
def get_all_services():
    """
    Retrieve all services. Available to all users.
    Image is automatically converted to base64 in to_dict() method.
    """
    try:
        services = Service.query.all()
        return jsonify({
            'status': "success",
            'message': "Services fetched successfully",
            'data': [service.to_dict() for service in services],
            'count': len(services)
        }), 200
    except SQLAlchemyError as e:
        return jsonify({
            'status': "failed",
            'message': str(e)
        }), 500

@services_bp.route('/services/<int:id>', methods=['GET'])
def get_service(id):
    """
    Retrieve a service by ID. Available to all users.
    Image is automatically converted to base64 in to_dict() method.
    """
    try:
        service = Service.query.get(id)
        if not service:
            raise NotFound(f"Service with ID {id} not found")
        
        return jsonify({
            'status': "success",
            'message': "Service fetched successfully",
            'data': service.to_dict()
        }), 200
    except NotFound as e:
        return jsonify({
            'status': "failed",
            'message': str(e)
        }), 404
    except SQLAlchemyError as e:
        return jsonify({
            'status': "failed",
            'message': str(e)
        }), 500

@services_bp.route('/services', methods=['POST'])
@jwt_required()
def create_service():
    """
    Create a new service. Only for admin and super_admin users.
    """
    try:
        data = request.get_json()
        
        # Verify user from JWT token has admin privileges
        admin_user = require_admin()
        
        # Validate required fields
        required_fields = ['title', 'description', 'price', 'duration', 'image', 'status']
        for field in required_fields:
            if field not in data or not data[field]:
                raise BadRequest(f"Missing required field: {field}")
        
        # Validate status
        if data['status'] not in [status.value for status in ServiceStatus]:
            raise BadRequest(f"Invalid status. Must be one of: {[status.value for status in ServiceStatus]}")
        
        # Handle image - convert base64 string to binary
        if data['image']:
            try:
                image_data = base64.b64decode(data['image'])
            except Exception as e:
                raise BadRequest("Invalid image format. Must be valid base64")
        else:
            raise BadRequest("Image is required")
        
        # Create service with verified admin user
        service = Service(
            title=data['title'],
            description=data['description'],
            price=float(data['price']),
            duration=data['duration'],
            image=image_data,
            status=ServiceStatus(data['status']),
            admin_id=admin_user.id,  # Use the verified admin user ID from JWT
            currency=data.get('currency', 'KES')
        )
        
        db.session.add(service)
        db.session.commit()
        
        return jsonify({
            'status': "success",
            'message': "Service created successfully",
            'data': service.to_dict()  # Image will be converted to base64 here
        }), 201
        
    except Forbidden as e:
        return jsonify({
            'status': "failed",
            'message': "Access forbidden",
            'detailed_message': str(e)
        }), 403
    except BadRequest as e:
        db.session.rollback()
        return jsonify({
            'status': "failed",
            'message': "Bad Request",
            'detailed_message': str(e)
        }), 400
    except ValueError as e:
        db.session.rollback()
        return jsonify({
            'status': "failed",
            'message': 'Invalid data',
            'detailed_message': str(e)
        }), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            'status': "failed",
            'message': 'Database error',
            'detailed_message': str(e)
        }), 500

@services_bp.route('/services/<int:id>', methods=['PUT'])
@jwt_required()
def update_service(id):
    """
    Update a service. Only for admin and super_admin users.
    Image is automatically converted to base64 in to_dict() method.
    """
    try:
        service = Service.query.get(id)
        if not service:
            raise NotFound(f"Service with ID {id} not found")
        
        # Verify user from JWT token has admin privileges
        admin_user = require_admin()
        
        data = request.get_json()
        
        # Optional: Verify the admin owns this service or is super_admin
        # if admin_user.role != Role.SUPER_ADMIN and service.admin_id != admin_user.id:
        #     raise Forbidden("You can only update services you created")
        
        # Update fields if provided
        updatable_fields = ['title', 'description', 'currency', 'price', 'duration', 'status']
        
        for field in updatable_fields:
            if field in data and data[field] is not None:
                if field == 'status' and data[field]:
                    service.status = ServiceStatus(data[field])
                elif field == 'price':
                    service.price = float(data[field])
                else:
                    setattr(service, field, data[field])
        
        # Handle image update if provided
        if 'image' in data and data['image']:
            try:
                image_data = base64.b64decode(data['image'])
                service.image = image_data
            except Exception as e:
                raise BadRequest("Invalid image format. Must be valid base64")
        
        service.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'status': "success",
            'message': 'Service updated successfully',
            'data': service.to_dict()  # Image will be converted to base64 here
        }), 200
        
    except Forbidden as e:
        return jsonify({
            'status': "failed",
            'message': "Access forbidden",
            'detailed_message': str(e)
        }), 403
    except NotFound as e:
        return jsonify({
            'status': "failed",
            'message': str(e)
        }), 404
    except BadRequest as e:
        db.session.rollback()
        return jsonify({
            'status': "failed",
            'message': "Bad Request",
            'detailed_message': str(e)
        }), 400
    except ValueError as e:
        db.session.rollback()
        return jsonify({
            'status': "failed",
            'message': 'Invalid data',
            'detailed_message': str(e)
        }), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            'status': "failed",
            'message': 'Database error',
            'detailed_message': str(e)
        }), 500

@services_bp.route('/services/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_service(id):
    """
    Delete a service by ID. Only for admin and super_admin users.
    """
    try:
        service = Service.query.get(id)
        if not service:
            raise NotFound(f"Service with ID {id} not found")
        
        # Verify user from JWT token has admin privileges
        admin_user = require_admin()
        
        # Optional: Verify the admin owns this service or is super_admin
        # if admin_user.role != Role.SUPER_ADMIN and service.admin_id != admin_user.id:
        #     raise Forbidden("You can only delete services you created")
        
        db.session.delete(service)
        db.session.commit()
        
        return jsonify({
            'status': "success",
            'message': 'Service deleted successfully'
        }), 200
        
    except Forbidden as e:
        return jsonify({
            'status': "failed",
            'message': "Access forbidden",
            'detailed_message': str(e)
        }), 403
    except NotFound as e:
        return jsonify({
            'status': "failed",
            'message': str(e)
        }), 404
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            'status': "failed",
            'message': 'Database error',
            'detailed_message': str(e)
        }), 500

@services_bp.route('/services/my-services', methods=['GET'])
@jwt_required()
def get_my_services():
    """
    Get services created by the current admin user.
    Only for admin and super_admin users.
    Image is automatically converted to base64 in to_dict() method.
    """
    try:
        # Verify user from JWT token has admin privileges
        admin_user = require_admin()
        
        # Get services created by this admin
        services = Service.query.filter_by(admin_id=admin_user.id).all()
        
        return jsonify({
            'status': "success",
            'message': "Services fetched successfully",
            'data': [service.to_dict() for service in services],  # Images converted to base64
            'count': len(services)
        }), 200
        
    except Forbidden as e:
        return jsonify({
            'status': "failed",
            'message': "Access forbidden",
            'detailed_message': str(e)
        }), 403
    except SQLAlchemyError as e:
        return jsonify({
            'status': "failed",
            'message': str(e)
        }), 500

@services_bp.route('/services/status/<string:status>', methods=['GET'])
@jwt_required()
def get_services_by_status(status):
    """
    Get services by status. Only for admin and super_admin users.
    Image is automatically converted to base64 in to_dict() method.
    """
    try:
        # Verify user from JWT token has admin privileges
        admin_user = require_admin()
        
        # Validate status
        if status not in [s.value for s in ServiceStatus]:
            return jsonify({
                'status': "failed",
                'message': f"Invalid status. Must be one of: {[s.value for s in ServiceStatus]}"
            }), 400
        
        services = Service.query.filter_by(status=ServiceStatus(status)).all()
        
        return jsonify({
            'status': "success",
            'message': f"Services with status '{status}' fetched successfully",
            'data': [service.to_dict() for service in services],  # Images converted to base64
            'count': len(services)
        }), 200
        
    except Forbidden as e:
        return jsonify({
            'status': "failed",
            'message': "Access forbidden",
            'detailed_message': str(e)
        }), 403
    except SQLAlchemyError as e:
        return jsonify({
            'status': "failed",
            'message': str(e)
        }), 500