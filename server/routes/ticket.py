import os
from flask_restful import Resource, Api
from flask import Blueprint, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.responses import restful_response
from models import db
from models.ticket import Ticket, TicketStatus
from models.ticket_message import TicketMessage
from models.user import User, Role
from sqlalchemy import or_, cast, func

tickets_bp = Blueprint("tickets", __name__)
api = Api(tickets_bp)

client_host = os.getenv("FLASK_CLIENT_URL", "http://localhost:3000").rstrip("/")
server_host = os.getenv("FLASK_SERVER_URL", "http://localhost:5000").rstrip("/")


def get_current_user_role():
    """Helper function to get current user and validate role"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return None, None
        return user, user.role
    except Exception as e:
        current_app.logger.error(f"Error getting current user: {str(e)}")
        return None, None


def is_admin(role):
    """Check if user has admin privileges"""
    return role in [Role.ADMIN, Role.SUPER_ADMIN]


class TicketListResource(Resource):
    """Handle GET /tickets and POST /tickets"""

    @jwt_required()
    def get(self):
        """Get tickets - clients see their tickets, admins see all"""
        try:
            user, user_role = get_current_user_role()
            if not user:
                return restful_response(
                    status="error", message="User not found", status_code=404
                )

            status_filter = request.args.get("status")
            search = request.args.get("search", "").strip()
            assigned_to = request.args.get("assigned_to")
            try:
                page = max(1, int(request.args.get("page", 1)))
                per_page = max(1, min(int(request.args.get("per_page", 10)), 100))
            except (TypeError, ValueError):
                return restful_response(
                    status="error",
                    message="Invalid pagination parameters",
                    status_code=400,
                )

            query = Ticket.query

            if user_role == Role.CLIENT:
                query = query.filter(Ticket.client_id == user.id)
            elif is_admin(user_role) and assigned_to:
                try:
                    assigned_admin_id = int(assigned_to)
                    query = query.filter(Ticket.admin_id == assigned_admin_id)
                except ValueError:
                    return restful_response(
                        status="error",
                        message="Invalid assigned_to parameter",
                        status_code=400,
                    )

            if status_filter:
                try:
                    status_enum = TicketStatus(status_filter)
                    query = query.filter(Ticket.status == status_enum)
                except ValueError:
                    return restful_response(
                        status="error", message="Invalid status value", status_code=400
                    )

            if search:
                search_term = f"%{search}%"
                query = query.filter(
                    or_(
                        Ticket.subject.ilike(search_term),
                        cast(Ticket.id, db.String).ilike(search_term),
                    )
                )

            query = query.order_by(Ticket.created_at.desc())
            paginated = query.paginate(page=page, per_page=per_page, error_out=False)

            # Batch-load related data to avoid N1
            tickets = []
            ticket_ids = [t.id for t in paginated.items]
            message_counts = {
                tid: cnt
                for (tid, cnt) in db.session.query(
                    TicketMessage.ticket_id, func.count(TicketMessage.id)
                )
                .filter(TicketMessage.ticket_id.in_(ticket_ids))
                .group_by(TicketMessage.ticket_id)
            }
            user_ids = set()
            for t in paginated.items:
                user_ids.add(t.client_id)
                if t.admin_id:
                    user_ids.add(t.admin_id)
            users = db.session.query(User).filter(User.id.in_(user_ids)).all()
            user_map = {u.id: u for u in users}
            for ticket in paginated.items:
                client = user_map.get(ticket.client_id)
                admin = user_map.get(ticket.admin_id) if ticket.admin_id else None
                message_count = message_counts.get(ticket.id, 0)

                ticket_data = ticket.to_dict()
                ticket_data.update(
                    {
                        "ticket_id": f"TK-{str(ticket.id).zfill(3)}",
                        "client_name": client.full_name if client else "Unknown",
                        "client_email": client.email if client else "",
                        "client_company": (
                            getattr(client, "industry", "") if client else ""
                        ),
                        "admin_name": admin.full_name if admin else "Unassigned",
                        "admin_email": admin.email if admin else "",
                        "message_count": message_count,
                    }
                )

                tickets.append(ticket_data)

            return restful_response(
                status="success",
                message="Tickets fetched successfully",
                data={
                    "tickets": tickets,
                    "pagination": {
                        "page": paginated.page,
                        "pages": paginated.pages,
                        "per_page": paginated.per_page,
                        "total": paginated.total,
                        "has_next": paginated.has_next,
                        "has_prev": paginated.has_prev,
                    },
                },
                status_code=200,
            )

        except Exception as e:
            current_app.logger.error(f"Error fetching tickets: {str(e)}")
            return restful_response(
                status="error", message="Internal server error", status_code=500
            )

    @jwt_required()
    def post(self):
        """Create a new ticket"""
        try:
            user, user_role = get_current_user_role()
            if not user:
                return restful_response(
                    status="error", message="User not found", status_code=404
                )

            data = request.get_json()
            if not data:
                return restful_response(
                    status="error", message="No JSON data provided", status_code=400
                )

            subject_raw = data.get("subject", "")
            description_raw = data.get("description", "")
            if not isinstance(subject_raw, str):
                return restful_response(
                    status="error",
                    message="Subject must be a non-empty string",
                    status_code=400,
                )
            if not isinstance(description_raw, str):
                return restful_response(
                    status="error",
                    message="Description must be a non-empty string",
                    status_code=400,
                )
            subject = subject_raw.strip()
            description = description_raw.strip()
            priority = data.get("priority", "medium")
            category = data.get("category", "general")

            if not subject:
                return restful_response(
                    status="error", message="Subject is required", status_code=400
                )

            if not description:
                return restful_response(
                    status="error", message="Description is required", status_code=400
                )

            if user_role == Role.CLIENT:
                client_id = user.id
                admin = (
                    User.query.filter(User.role.in_([Role.ADMIN, Role.SUPER_ADMIN]))
                    .order_by(User.id.asc())
                    .first()
                )
                if not admin:
                    return restful_response(
                        status="error",
                        message="No admin available to assign ticket",
                        status_code=503,
                    )
                admin_id = admin.id
            else:
                client_id = data.get("client_id")
                admin_id = data.get("admin_id", user.id)
                try:
                    client_id = int(client_id)
                except (TypeError, ValueError):
                    return restful_response(
                        status="error",
                        message="client_id must be an integer",
                        status_code=400,
                    )
                if not client_id:
                    return restful_response(
                        status="error",
                        message="Client ID is required for admin ticket creation",
                        status_code=400,
                    )

                client = User.query.filter_by(id=client_id, role=Role.CLIENT).first()
                if not client:
                    return restful_response(
                        status="error", message="Invalid client", status_code=400
                    )

            if admin_id is not None:
                try:
                    admin_id = int(admin_id)
                except (TypeError, ValueError):
                    return restful_response(
                        status="error",
                        message="admin_id must be an integer",
                        status_code=400,
                    )
                admin = (
                        User.query.filter_by(id=admin_id)
                        .filter(User.role.in_([Role.ADMIN, Role.SUPER_ADMIN]))
                        .first()
                    )
                if not admin:
                        return restful_response(
                            status="error", message="Invalid admin", status_code=400
                        )

            ticket = Ticket(
                client_id=client_id,
                admin_id=admin_id,
                subject=subject,
                status=TicketStatus.OPEN,
            )

            db.session.add(ticket)
            db.session.flush()

            initial_message = TicketMessage(
                ticket_id=ticket.id, sender_id=user.id, body=description
            )
            db.session.add(initial_message)
            db.session.commit()

            client = User.query.get(ticket.client_id)
            admin = User.query.get(ticket.admin_id) if ticket.admin_id else None

            ticket_data = ticket.to_dict()
            ticket_data.update(
                {
                    "ticket_id": f"TK-{str(ticket.id).zfill(3)}",
                    "client_name": client.full_name if client else "Unknown",
                    "admin_name": admin.full_name if admin else "Unassigned",
                    "priority": priority,
                    "category": category,
                }
            )

            return restful_response(
                status="success",
                message="Ticket created successfully",
                data=ticket_data,
                status_code=201,
            )

        except ValueError as e:
            db.session.rollback()
            return restful_response(status="error", message=str(e), status_code=400)
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error creating ticket: {str(e)}")
            return restful_response(
                status="error", message="Internal server error", status_code=500
            )


# Register API resources
api.add_resource(TicketListResource, "/tickets")
