from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.exceptions import NotFound, BadRequest, Forbidden
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
import base64
from models import db
from models.service import Service, ServiceStatus
from models.user import User, Role, AccountStatus
import re

# Create blueprint
services_bp = Blueprint("services", __name__)


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
        raise Forbidden("Only admin & super_admin can perform this action")

    return user


def validate_price(price):
    """Validate that price is a positive number greater than 0"""
    try:
        price_float = float(price)
        if price_float <= 0:
            return False, "Price must be greater than 0"
        return True, price_float
    except (ValueError, TypeError):
        return False, "Price must be a valid number"


def validate_duration(duration_str):
    """Validate duration format and ensure it's greater than 0"""
    if not duration_str or not isinstance(duration_str, str):
        return False, "Duration is required and must be a string"

    # Parse duration string like "2 hr 30 min"
    try:
        parts = duration_str.split()
        if len(parts) != 4 or parts[1] != "hr" or parts[3] != "min":
            return False, "Duration must be in format 'X hr Y min'"

        hours = int(parts[0])
        minutes = int(parts[2])

        if hours < 0 or minutes < 0:
            return False, "Hours and minutes cannot be negative"
        if hours == 0 and minutes == 0:
            return False, "Duration must be greater than 0 (set hours or minutes)"
        if minutes >= 60:
            return False, "Minutes cannot exceed 59"

        return True, duration_str
    except (ValueError, IndexError):
        return False, "Invalid duration format. Use 'X hr Y min'"


@services_bp.route("/services", methods=["GET"])
def get_all_services():
    """
    Retrieve all services. Available to all users.
    Image is automatically converted to base64 in to_dict() method.
    """
    try:
        services = Service.query.filter_by(is_deleted=False).all()
        return (
            jsonify(
                {
                    "status": "success",
                    "message": "Services fetched successfully",
                    "data": [service.to_dict() for service in services],
                }
            ),
            200,
        )
    except SQLAlchemyError as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


@services_bp.route("/services/<int:id>", methods=["GET"])
def get_service(id):
    """
    Retrieve a service by ID. Available to all users.
    Image is automatically converted to base64 in to_dict() method.
    """
    try:
        service = Service.query.filter(
            Service.id == id, Service.is_deleted.is_(False)
        ).first()
        if not service:
            raise NotFound(f"Service with ID {id} not found")

        return (
            jsonify(
                {
                    "status": "success",
                    "message": "Service fetched successfully",
                    "data": service.to_dict(),
                }
            ),
            200,
        )
    except NotFound as e:
        return jsonify({"status": "failed", "message": str(e)}), 404
    except SQLAlchemyError as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


@services_bp.route("/services", methods=["POST"])
@jwt_required()
def create_service():
    """
    Create a new service. Only for admin and super_admin users.
    """
    try:
        data = request.get_json()

        if not data:
            raise BadRequest("Request must be JSON. None received.")

        # Verify user from JWT token has admin privileges
        admin_user = require_admin()

        # Validate required fields
        required_fields = [
            "title",
            "description",
            "price",
            "duration",
            "image",
            "status",
        ]
        for field in required_fields:
            if field not in data or not data[field]:
                return (
                    jsonify(
                        {
                            "status": "error",
                            "message": f"{field.capitalize()} is required",
                        }
                    ),
                    400,
                )

        # === ADD PRICE VALIDATION ===
        price_valid, price_result = validate_price(data["price"])
        if not price_valid:
            return jsonify({"status": "error", "message": price_result}), 400

        # === ADD DURATION VALIDATION ===
        duration_valid, duration_result = validate_duration(data["duration"])
        if not duration_valid:
            return jsonify({"status": "error", "message": duration_result}), 400

        # Validate image size (5MB limit)
        if "image" in data and data["image"]:
            # Remove data URL prefix if present
            image_data = data["image"]
            if "base64," in image_data:
                image_data = image_data.split("base64,")[1]

            # Calculate image size in bytes
            # Base64 string length * 3/4 (approx.) gives bytes
            image_size = len(image_data) * 3 // 4

            # Account for padding
            padding_count = image_data.count("=")
            image_size -= padding_count

            max_size = 5 * 1024 * 1024  # 5MB in bytes

            if image_size > max_size:
                return (
                    jsonify(
                        {"status": "error", "message": "Image size exceeds 5MB limit."}
                    ),
                    400,
                )

        # Validate status
        if data["status"] not in [status.value for status in ServiceStatus]:
            raise BadRequest("Invalid status")

        # Handle image - convert base64 string to binary
        if data["image"]:
            try:
                image_str = data["image"]
                # Remove prefix if present
                image_base64 = re.sub("^data:image/[^;]+;base64,", "", image_str)

                image_data = base64.b64decode(image_base64)
            except Exception:
                raise BadRequest("Invalid image format. Must be valid base64")
        else:
            raise BadRequest("Image is required")

        # Create service with verified admin user
        service = Service(
            title=data["title"],
            description=data["description"],
            price=float(data["price"]),
            duration=data["duration"],
            image=image_data,
            status=ServiceStatus(data["status"]),
            admin_id=admin_user.id,
            currency=data.get("currency", "KES"),
        )

        db.session.add(service)
        db.session.commit()

        return (
            jsonify(
                {
                    "status": "success",
                    "message": "Service created successfully",
                    "data": service.to_dict(),  # Image will be converted to base64 here
                }
            ),
            201,
        )

    except Forbidden as e:
        return (
            jsonify(
                {
                    "status": "failed",
                    "message": "Access forbidden",
                    "detailed_message": str(e),
                }
            ),
            403,
        )
    except BadRequest as e:
        db.session.rollback()
        return (
            jsonify(
                {
                    "status": "failed",
                    "message": "Bad Request",
                    "detailed_message": str(e),
                }
            ),
            400,
        )
    except ValueError as e:
        db.session.rollback()
        return (
            jsonify(
                {
                    "status": "failed",
                    "message": "Invalid data",
                    "detailed_message": str(e),
                }
            ),
            400,
        )
    except SQLAlchemyError as e:
        db.session.rollback()
        return (
            jsonify(
                {
                    "status": "failed",
                    "message": "Database error",
                    "detailed_message": str(e),
                }
            ),
            500,
        )


@services_bp.route("/services/<int:id>", methods=["PUT"])
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

        data = request.get_json()

        # === ADD PRICE VALIDATION (if price is being updated) ===
        if "price" in data and data["price"] is not None:
            price_valid, price_result = validate_price(data["price"])
            if not price_valid:
                return jsonify({"status": "error", "message": price_result}), 400

        # === ADD DURATION VALIDATION (if duration is being updated) ===
        if "duration" in data and data["duration"] is not None:
            duration_valid, duration_result = validate_duration(data["duration"])
            if not duration_valid:
                return jsonify({"status": "error", "message": duration_result}), 400

        # Update fields if provided
        updatable_fields = [
            "title",
            "description",
            "currency",
            "price",
            "duration",
            "status",
        ]

        for field in updatable_fields:
            if field in data and data[field] is not None:
                if field == "status" and data[field]:
                    service.status = ServiceStatus(data[field])
                elif field == "price":
                    service.price = float(data[field])
                else:
                    setattr(service, field, data[field])

        # Validate image size if image is being updated
        if "image" in data and data["image"]:
            # Remove data URL prefix if present
            image_data = data["image"]
            if "base64," in image_data:
                image_data = image_data.split("base64,")[1]

            # Calculate image size
            image_size = len(image_data) * 3 // 4
            padding_count = image_data.count("=")
            image_size -= padding_count

            max_size = 5 * 1024 * 1024  # 5MB in bytes

            if image_size > max_size:
                return (
                    jsonify(
                        {"status": "error", "message": "Image size exceeds 5MB limit."}
                    ),
                    400,
                )

        # Handle image update if provided
        if "image" in data and data["image"]:
            try:
                image_str = data["image"]
                # Remove prefix if present
                image_base64 = re.sub("^data:image/[^;]+;base64,", "", image_str)
                image_data = base64.b64decode(image_base64)
                service.image = image_data
            except Exception:
                raise BadRequest("Invalid image format. Must be valid base64")

        service.updated_at = datetime.utcnow()
        db.session.commit()

        return (
            jsonify(
                {
                    "status": "success",
                    "message": "Service updated successfully",
                    "data": service.to_dict(),
                }
            ),
            200,
        )

    except Forbidden as e:
        return (
            jsonify(
                {
                    "status": "failed",
                    "message": "Access forbidden",
                    "detailed_message": str(e),
                }
            ),
            403,
        )
    except NotFound as e:
        return jsonify({"status": "failed", "message": str(e)}), 404
    except BadRequest as e:
        db.session.rollback()
        return (
            jsonify(
                {
                    "status": "failed",
                    "message": "Bad Request",
                    "detailed_message": str(e),
                }
            ),
            400,
        )
    except ValueError as e:
        db.session.rollback()
        return (
            jsonify(
                {
                    "status": "failed",
                    "message": "Invalid data",
                    "detailed_message": str(e),
                }
            ),
            400,
        )
    except SQLAlchemyError as e:
        db.session.rollback()
        return (
            jsonify(
                {
                    "status": "failed",
                    "message": "Database error",
                    "detailed_message": str(e),
                }
            ),
            500,
        )


@services_bp.route("/services/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_service(id):
    """
    Delete a service by ID. Only for admin and super_admin users.
    """
    try:
        service = Service.query.get(id)
        if not service:
            raise NotFound(f"Service with ID {id} not found")

        # Optional: Verify the admin owns this service or is super_admin
        # if admin_user.role != Role.SUPER_ADMIN and service.admin_id != admin_user.id:
        #     raise Forbidden("You can only delete services you created")

        # db.session.delete(service)
        service.is_deleted = True
        db.session.commit()

        return (
            jsonify({"status": "success", "message": "Service deleted successfully"}),
            200,
        )

    except Forbidden as e:
        return (
            jsonify(
                {
                    "status": "failed",
                    "message": "Access forbidden",
                    "detailed_message": str(e),
                }
            ),
            403,
        )
    except NotFound as e:
        return jsonify({"status": "failed", "message": str(e)}), 404
    except SQLAlchemyError as e:
        db.session.rollback()
        return (
            jsonify(
                {
                    "status": "failed",
                    "message": "Database error",
                    "detailed_message": str(e),
                }
            ),
            500,
        )


@services_bp.route("/services/my-services", methods=["GET"])
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
        services = Service.query.filter(
            Service.admin_id == admin_user.id, Service.is_deleted is False
        ).all()

        return (
            jsonify(
                {
                    "status": "success",
                    "message": "Services fetched successfully",
                    "data": [service.to_dict() for service in services],
                    "count": len(services),
                }
            ),
            200,
        )

    except Forbidden as e:
        return (
            jsonify(
                {
                    "status": "failed",
                    "message": "Access forbidden",
                    "detailed_message": str(e),
                }
            ),
            403,
        )
    except SQLAlchemyError as e:
        return jsonify({"status": "failed", "message": str(e)}), 500


@services_bp.route("/services/status/<string:status>", methods=["GET"])
@jwt_required()
def get_services_by_status(status):
    """
    Get services by status. Only for admin and super_admin users.
    Image is automatically converted to base64 in to_dict() method.
    """
    try:

        # Validate status
        if status not in [s.value for s in ServiceStatus]:
            return jsonify({"status": "failed", "message": "Invalid status."}), 400

        services = Service.query.filter_by(status=ServiceStatus(status)).all()

        return (
            jsonify(
                {
                    "status": "success",
                    "message": f"Services with status '{status}' fetched successfully",
                    "data": [service.to_dict() for service in services],
                    "count": len(services),
                }
            ),
            200,
        )

    except Forbidden as e:
        return (
            jsonify(
                {
                    "status": "failed",
                    "message": "Access forbidden",
                    "detailed_message": str(e),
                }
            ),
            403,
        )
    except SQLAlchemyError as e:
        return jsonify({"status": "failed", "message": str(e)}), 500