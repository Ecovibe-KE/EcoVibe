import enum
from flask_restful import Resource, Api
from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.responses import restful_response
from models.user import User, Role
from models.booking import Booking
from models.document import Document
from models.payment import Payment
from models.service import Service
from models.ticket import Ticket
from models import db
from sqlalchemy import func
from sqlalchemy.orm import joinedload
from models.invoice import Invoice

# Create Blueprint and Api
dashboard_bp = Blueprint("dashboard", __name__)
api = Api(dashboard_bp)

class DashboardResource(Resource):
    @jwt_required()
    def get(self):
        try:
            user_id = int(get_jwt_identity())
        except (TypeError, ValueError):
            return restful_response(
                status="error", message="Unauthorized", status_code=403
            )

        user = User.query.get(user_id)
        if not user:
            return restful_response(
                status="error", message="User not found", status_code=404
            )

        if user.role.value == Role.CLIENT.value:
            upcoming_appointments = (
                Booking.query.filter_by(client_id=user.id)
                .order_by(Booking.booking_date.asc())
                .limit(3)
                .all()
            )
            documents = (
                Document.query
                .order_by(Document.created_at.desc())
                .limit(5)
                .all()
            )

            total_bookings = (
                db.session.query(func.count(Booking.id))
                .filter(Booking.client_id == user.id)
                .scalar() or 0
            )
            total_documents = (
                db.session.query(func.count(Document.id))
                .scalar() or 0
            )

            paid_invoices = (
                db.session.query(func.count(Invoice.id))
                .filter(Invoice.client_id == user.id, Invoice.status == 'paid')
                .scalar() or 0
            )
            ticket_raised = (
                db.session.query(func.count (Ticket.id))
                .filter(Ticket.client_id == user.id)
                .scalar() or 0
            )

            return restful_response(
                status="success",
                message="Client dashboard data fetched successfully",
                data={
                    "name": user.full_name,
                    "stats": {
                        "totalBookings": total_bookings,  
                        "paidInvoices": paid_invoices,
                        "ticketsRaised": ticket_raised,  # You need to implement tickets
                        "documentsDownloaded": total_documents,
                    },
                    "upcomingAppointments": [a.to_dict() for a in upcoming_appointments],  # camelCase
                    "documents": [d.to_dict() for d in documents],
                },
                status_code=200,
            )

        elif user.role.value in [Role.ADMIN.value, Role.SUPER_ADMIN.value]:
            total_bookings = db.session.query(func.count(Booking.id)).scalar() or 0
            total_payments = db.session.query(func.count(Payment.id)).scalar() or 0
            total_clients = (
                db.session.query(func.count(User.id))
                .filter(User.role == Role.CLIENT)
                .scalar() or 0
            )
            recent_bookings = ( Booking.query.order_by(Booking.created_at.desc()).limit(5).all() )
            recent_bookings_data = []
            for b in recent_bookings:
                recent_bookings_data.append({
                    "id": b.id,
                    "booking_date": b.booking_date.isoformat(),
                    "start_time": b.start_time.isoformat(),
                    "end_time": b.end_time.isoformat(),
                    "status": b.status.value,
                    "client_id": b.client_id,
                    "service_id": b.service_id,
                    "client_name": b.client.full_name,  # relational name
                    "service_title": b.service.title,   # relational title
                    "created_at": b.created_at.isoformat() if b.created_at else None,
                    "updated_at": b.updated_at.isoformat() if b.updated_at else None,
                })

            recent_payments = ( Payment.query.order_by(Payment.created_at.desc()).limit(5).all() ) 
            documents = (
                Document.query.order_by(Document.created_at.desc()).limit(5).all()
            )

            return restful_response(
                status="success",
                message="Admin dashboard data fetched successfully",
                data={
                    "name": user.full_name,
                    "role": "admin",  # Add role field
                    "stats": {
                        "totalBookings": total_bookings,
                        "registeredUsers": total_clients,
                        "blogPosts": 0,  # You need to implement blog posts
                        "paymentRecords": total_payments,
                    },
                    "recentBookings": recent_bookings_data,
                    "recentPayments": [d.to_dict() for d in recent_payments],
                    "documents": [d.to_dict() for d in documents],
                },
                status_code=200,
            )

        return restful_response(
            status="error", message="Unauthorized role", status_code=403
        )

# Register route - make sure this is correct
api.add_resource(DashboardResource, "/dashboard")