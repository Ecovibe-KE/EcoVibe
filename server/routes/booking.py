from flask import request, Blueprint
from flask_restful import Resource, Api
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload
from flask_jwt_extended import jwt_required
from models import db
from models.booking import Booking
from models.user import User, Role
from models.service import Service
from utils.responses import restful_response
from utils.auth_helpers import get_current_user_and_role
from datetime import datetime, date, timedelta
from models.invoice import Invoice, InvoiceStatus

booking_bp = Blueprint("booking", __name__)
api = Api(booking_bp)


# --- Utility function ---
def parse_booking_fields(data):
    """Parse booking fields from JSON to correct Python types."""
    parsed = {}
    if "booking_date" in data:
        parsed["booking_date"] = datetime.strptime(
            data["booking_date"], "%Y-%m-%d"
        ).date()
    if "start_time" in data:
        parsed["start_time"] = datetime.fromisoformat(data["start_time"])
    if "end_time" in data:
        parsed["end_time"] = datetime.fromisoformat(data["end_time"])
    if "status" in data:
        parsed["status"] = data["status"]
    return parsed


# --- Booking List Resource ---
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

            # Use eager loading to prevent N+1 queries
            base_query = Booking.query.options(
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
            else:
                client_id = current_user.id

            if not client_id:
                return restful_response(
                    status="error",
                    message="Client is required",
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

            # --- Parse and Create Booking ---
            parsed_fields = parse_booking_fields(data)
            booking = Booking(
                client_id=client_id, service_id=service_id, **parsed_fields
            )

            # --- Fetch Service for Price ---
            service = Service.query.get(service_id)
            if not service:
                return restful_response(
                    status="error",
                    message="Invalid client or service ID",
                    status_code=400,
                )

            amount = int(service.price)
            # --- Create Invoice ---
            invoice = Invoice(
                amount=amount,
                client_id=client_id,
                service_id=service_id,
                created_at=date.today(),
                due_date=date.today() + timedelta(days=30),
                status=InvoiceStatus.pending
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
            return restful_response(
                status="error",
                message=str(e),
                status_code=400,
            )
        except IntegrityError:
            db.session.rollback()
            return restful_response(
                status="error",
                message="Invalid client or service ID",
                status_code=400,
            )
        except Exception as e:
            db.session.rollback()
            return restful_response(
                status="error",
                message=f"Error creating booking: {str(e)}",
                status_code=500,
            )


# --- Booking Detail Resource ---
class BookingResource(Resource):
    @jwt_required()
    def get(self, booking_id):
        """Retrieve a single booking by ID (requires authentication)."""
        try:
            # Use eager loading to prevent N+1 queries
            booking = Booking.query.options(
                joinedload(Booking.client), joinedload(Booking.service)
            ).get(booking_id)

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
            # Use eager loading to prevent N+1 queries
            booking = Booking.query.options(
                joinedload(Booking.client), joinedload(Booking.service)
            ).get(booking_id)

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

            # Apply parsed fields (booking_date, start_time, end_time, status)
            for key, value in parsed_fields.items():
                setattr(booking, key, value)

            # --- Handle service_id update ---
            if "service_id" in data:
                service_id = data.get("service_id")
                if service_id:
                    # Validate service exists
                    service = Service.query.get(service_id)
                    if not service:
                        return restful_response(
                            status="error",
                            message="Service not found",
                            status_code=404,
                        )
                    booking.service_id = service_id
                else:
                    return restful_response(
                        status="error",
                        message="Service ID cannot be empty",
                        status_code=400,
                    )

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

                    # Validate client exists
                    client = User.query.get(client_id)
                    if not client:
                        return restful_response(
                            status="error",
                            message="Client not found",
                            status_code=404,
                        )
                    booking.client_id = client_id
                else:
                    return restful_response(
                        status="error",
                        message="Client ID cannot be empty",
                        status_code=400,
                    )

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
        """Delete a booking (admins or the booking's client)."""
        try:
            booking = Booking.query.get(booking_id)
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

            db.session.delete(booking)
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


# Register resources
api.add_resource(BookingListResource, "/bookings")
api.add_resource(BookingResource, "/bookings/<int:booking_id>")
