from flask import request, Blueprint
from flask_restful import Resource, Api
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload
from flask_jwt_extended import jwt_required
from models import db
from models.booking import Booking, BookingStatus
from models.user import User, Role
from models.service import Service
from utils.responses import restful_response
from utils.auth_helpers import get_current_user_and_role
from datetime import datetime, date, timedelta, timezone
from models.invoice import Invoice, InvoiceStatus

booking_bp = Blueprint("booking", __name__)
api = Api(booking_bp)

def parse_booking_fields(data):
    """Parse booking fields from JSON to correct Python types."""
    parsed = {}
    if "start_time" in data:
        # Parse the datetime and make it timezone-aware
        naive_datetime = datetime.fromisoformat(data["start_time"].replace('Z', '+00:00'))
        parsed["start_time"] = naive_datetime.replace(tzinfo=timezone.utc)
    if "status" in data:
        parsed["status"] = BookingStatus(data["status"])
    return parsed

def calculate_end_time(start_time, duration_str):
    """Calculate end_time based on start_time and service duration"""
    try:
        # Parse duration string like "2 hr 30 min"
        parts = duration_str.split()
        hours = 0
        minutes = 0
        
        for i, part in enumerate(parts):
            if part == 'hr' and i > 0:
                hours = int(parts[i-1])
            elif part == 'min' and i > 0:
                minutes = int(parts[i-1])
        
        return start_time + timedelta(hours=hours, minutes=minutes)
    except (ValueError, IndexError):
        # Default to 1 hour if parsing fails
        return start_time + timedelta(hours=1)

class BookingListResource(Resource):
    @jwt_required()
    def get(self):
        """List bookings (admins see all, clients only see theirs)."""
        try:
            current_user, role = get_current_user_and_role()
            if not current_user:
                return restful_response(
                    status="error",
                    message="Authentication required",
                    status_code=401,
                )

            # Filter out deleted bookings
            base_query = Booking.query.filter_by(is_deleted=False).options(
                joinedload(Booking.client), joinedload(Booking.service)
            )

            if role == Role.ADMIN.value or role == Role.SUPER_ADMIN.value:
                bookings = base_query.all()
            else:
                bookings = base_query.filter_by(client_id=current_user.id).all()

            return restful_response(
                status="success",
                data=[booking.to_dict() for booking in bookings],
                message="Bookings retrieved successfully",
                status_code=200,
            )
        except Exception as e:
            return restful_response(
                status="error",
                message=f"Error fetching bookings: {str(e)}",
                status_code=500,
            )

    @jwt_required()
    def post(self):
        """Create a new booking (admin can assign client, client can book self)."""
        try:
            data = request.get_json()
            current_user, role = get_current_user_and_role()

            if not current_user:
                return restful_response(
                    status="error",
                    message="Authentication required",
                    status_code=401,
                )

            # --- Determine Client ---
            if role == Role.ADMIN.value or role == Role.SUPER_ADMIN.value:
                client_id = data.get("client_id")
                if not client_id:
                    return restful_response(
                        status="error",
                        message="Client is required for admin users",
                        status_code=400,
                    )
            else:
                client_id = current_user.id

            # --- Validate Client ---
            try:
                client_id = int(client_id)
            except (ValueError, TypeError):
                return restful_response(
                    status="error",
                    message="Invalid client ID format",
                    status_code=400,
                )

            client = User.query.filter_by(
                id=client_id, 
                is_deleted=False
            ).first()
            
            if not client:
                return restful_response(
                    status="error",
                    message="Client not found",
                    status_code=400,
                )

            # --- Validate Service ---
            service_id = data.get("service_id")
            if not service_id:
                return restful_response(
                    status="error",
                    message="Service is required",
                    status_code=400,
                )

            try:
                service_id = int(service_id)
            except (ValueError, TypeError):
                return restful_response(
                    status="error",
                    message="Invalid service ID format",
                    status_code=400,
                )

            service = Service.query.filter_by(
                id=service_id, 
                is_deleted=False
            ).first()
            
            if not service:
                return restful_response(
                    status="error",
                    message="Service not found",
                    status_code=400,
                )

            # --- Parse and validate start_time ---
            if "start_time" not in data:
                return restful_response(
                    status="error",
                    message="Start time is required",
                    status_code=400,
                )

            try:
                # Parse and make timezone-aware
                naive_datetime = datetime.fromisoformat(data["start_time"].replace('Z', '+00:00'))
                start_time = naive_datetime.replace(tzinfo=timezone.utc)
            except (ValueError, TypeError):
                return restful_response(
                    status="error",
                    message="Invalid start time format",
                    status_code=400,
                )

            # Validate start_time is not in the past (using timezone-aware comparison)
            if start_time < datetime.now(timezone.utc):
                return restful_response(
                    status="error",
                    message="Start time cannot be in the past",
                    status_code=400,
                )

            # --- Calculate end_time from service duration ---
            end_time = calculate_end_time(start_time, service.duration)

            # --- Create Booking ---
            booking = Booking(
                client_id=client_id,
                service_id=service_id,
                start_time=start_time,
                end_time=end_time,
                booking_date=date.today(),  # Set booking_date to today in routes
                status=BookingStatus.pending  # Default status
            )

            # --- Create Invoice ---
            amount = int(service.price)
            invoice = Invoice(
                amount=amount,
                client_id=client_id,
                service_id=service_id,
                created_at=date.today(),
                due_date=date.today() + timedelta(days=30),
                status=InvoiceStatus.pending,
            )

            # --- Save Booking and Invoice ---
            db.session.add(booking)
            db.session.add(invoice)
            db.session.commit()

            # Reload the booking with relationships for the response
            booking_with_relations = Booking.query.options(
                joinedload(Booking.client), joinedload(Booking.service)
            ).get(booking.id)

            return restful_response(
                status="success",
                data=booking_with_relations.to_dict(),
                message="Booking created successfully",
                status_code=201,
            )
        except ValueError as e:
            db.session.rollback()
            return restful_response(
                status="error",
                message=str(e),
                status_code=400,
            )
        except IntegrityError:
            db.session.rollback()
            return restful_response(
                status="error",
                message="Database integrity error",
                status_code=400,
            )
        except Exception as e:
            db.session.rollback()
            return restful_response(
                status="error",
                message=f"Error creating booking: {str(e)}",
                status_code=500,
            )

class BookingResource(Resource):
    @jwt_required()
    def get(self, booking_id):
        """Retrieve a single booking by ID (requires authentication)."""
        try:
            booking = Booking.query.filter_by(
                id=booking_id, 
                is_deleted=False
            ).options(
                joinedload(Booking.client), joinedload(Booking.service)
            ).first()

            if not booking:
                return restful_response(
                    status="error",
                    message="Booking not found",
                    status_code=404,
                )
            return restful_response(
                status="success",
                data=booking.to_dict(),
                message="Booking retrieved successfully",
                status_code=200,
            )
        except Exception as e:
            return restful_response(
                status="error",
                message=f"Error fetching booking: {str(e)}",
                status_code=500,
            )

    @jwt_required()
    def patch(self, booking_id):
        """Partially update a booking (only editable fields provided in request)."""
        try:
            booking = Booking.query.filter_by(
                id=booking_id, 
                is_deleted=False
            ).options(
                joinedload(Booking.client), joinedload(Booking.service)
            ).first()

            if not booking:
                return restful_response(
                    status="error",
                    message="Booking not found",
                    status_code=404,
                )

            current_user, role = get_current_user_and_role()
            if not current_user:
                return restful_response(
                    status="error",
                    message="Authentication required",
                    status_code=401,
                )

            # --- Permissions ---
            is_not_admin = role not in [Role.ADMIN.value, Role.SUPER_ADMIN.value]
            is_not_owner = booking.client_id != current_user.id
            if is_not_admin and is_not_owner:
                return restful_response(
                    status="error",
                    message="Not authorized to edit this booking",
                    status_code=403,
                )

            # --- Parse and Apply Updates ---
            data = request.get_json()
            parsed_fields = parse_booking_fields(data)

            # Track if we need to recalculate end_time
            recalculate_end_time = False
            new_start_time = None
            new_service = booking.service

            # Handle start_time update
            if "start_time" in parsed_fields:
                new_start_time = parsed_fields["start_time"]
                booking.start_time = new_start_time
                recalculate_end_time = True

            # Handle service_id update
            if "service_id" in data:
                service_id = data.get("service_id")
                if service_id:
                    try:
                        service_id = int(service_id)
                    except (ValueError, TypeError):
                        return restful_response(
                            status="error",
                            message="Invalid service ID format",
                            status_code=400,
                        )
                    
                    new_service = Service.query.filter_by(
                        id=service_id, 
                        is_deleted=False
                    ).first()
                    if not new_service:
                        return restful_response(
                            status="error",
                            message="Service not found",
                            status_code=404,
                        )
                    booking.service_id = service_id
                    recalculate_end_time = True

            # Recalculate end_time if needed
            if recalculate_end_time:
                if not new_start_time:
                    new_start_time = booking.start_time
                booking.end_time = calculate_end_time(new_start_time, new_service.duration)

            # Apply other parsed fields (status)
            for key, value in parsed_fields.items():
                if key not in ['start_time']:  # start_time already handled
                    setattr(booking, key, value)

            # --- Handle client_id update ---
            if "client_id" in data:
                client_id = data.get("client_id")
                if client_id:
                    # Only admins can change client_id
                    if role not in [Role.ADMIN.value, Role.SUPER_ADMIN.value]:
                        return restful_response(
                            status="error",
                            message="Only administrators can change booking client",
                            status_code=403,
                        )

                    try:
                        client_id = int(client_id)
                    except (ValueError, TypeError):
                        return restful_response(
                            status="error",
                            message="Invalid client ID format",
                            status_code=400,
                        )

                    client = User.query.filter_by(
                        id=client_id, 
                        is_deleted=False
                    ).first()
                    if not client:
                        return restful_response(
                            status="error",
                            message="Client not found",
                            status_code=404,
                        )
                    booking.client_id = client_id

            db.session.commit()

            return restful_response(
                status="success",
                data=booking.to_dict(),
                message="Booking updated successfully",
                status_code=200,
            )
        except ValueError as e:
            db.session.rollback()
            return restful_response(
                status="error",
                message=str(e),
                status_code=400,
            )
        except Exception as e:
            print("PATCH error:", e)
            db.session.rollback()
            return restful_response(
                status="error",
                message=f"Error updating booking: {str(e)}",
                status_code=500,
            )

    @jwt_required()
    def delete(self, booking_id):
        """Soft delete a booking (admins or the booking's client)."""
        try:
            booking = Booking.query.filter_by(
                id=booking_id, 
                is_deleted=False
            ).first()

            if not booking:
                return restful_response(
                    status="error",
                    message="Booking not found",
                    status_code=404,
                )

            current_user, role = get_current_user_and_role()
            if not current_user:
                return restful_response(
                    status="error",
                    message="Authentication required",
                    status_code=401,
                )

            is_not_admin = role not in [Role.ADMIN.value, Role.SUPER_ADMIN.value]
            is_not_owner = booking.client_id != current_user.id
            if is_not_admin and is_not_owner:
                return restful_response(
                    status="error",
                    message="Not authorized to delete this booking",
                    status_code=403,
                )

            # Soft delete instead of hard delete
            booking.is_deleted = True
            db.session.commit()

            return restful_response(
                status="success",
                message="Booking deleted successfully",
                status_code=200,
            )
        except Exception as e:
            db.session.rollback()
            return restful_response(
                status="error",
                message=f"Error deleting booking: {str(e)}",
                status_code=500,
            )

api.add_resource(BookingListResource, "/bookings")
api.add_resource(BookingResource, "/bookings/<int:booking_id>")