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
from utils.auth_helpers import get_current_user_and_role

tickets_bp = Blueprint("tickets", __name__)
api = Api(tickets_bp)

client_host = os.getenv("FLASK_CLIENT_URL", "http://localhost:3000").rstrip("/")
server_host = os.getenv("FLASK_SERVER_URL", "http://localhost:5000").rstrip("/")

def is_admin(role):
    """Check if user has admin privileges"""
    return role in [Role.ADMIN, Role.SUPER_ADMIN]

class TicketListResource(Resource):
    @jwt_required()
    def get(self):
        """Get tickets - clients see their tickets, admins see all"""
        try:
            user, user_role = get_current_user_and_role()
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
            user, user_role = get_current_user_and_role()
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

                if admin_id is None:
                    return restful_response(
                        status="error",
                        message="admin_id is required",
                        status_code=400,
                    )
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
    


class TicketStatsResource(Resource):
    """Handle GET /tickets/stats"""
    
    @jwt_required()
    def get(self):
        """Get ticket statistics"""
        try:
            user, user_role = get_current_user_and_role()
            if not user:
                return restful_response(
                    status="error", message="User not found", status_code=404
                )

            # Build stats query based on user role
            if user_role == Role.CLIENT:
                total = Ticket.query.filter_by(client_id=user.id).count()
                open_count = Ticket.query.filter_by(client_id=user.id, status=TicketStatus.OPEN).count()
                in_progress_count = Ticket.query.filter_by(client_id=user.id, status=TicketStatus.IN_PROGRESS).count()
                closed_count = Ticket.query.filter_by(client_id=user.id, status=TicketStatus.CLOSED).count()
                resolved_count = 0  # You might want to add a RESOLVED status
            else:
                total = Ticket.query.count()
                open_count = Ticket.query.filter_by(status=TicketStatus.OPEN).count()
                in_progress_count = Ticket.query.filter_by(status=TicketStatus.IN_PROGRESS).count()
                closed_count = Ticket.query.filter_by(status=TicketStatus.CLOSED).count()
                resolved_count = 0  # You might want to add a RESOLVED status

            stats = {
                "total": total,
                "open": open_count,
                "in_progress": in_progress_count,
                "resolved": resolved_count,
                "closed": closed_count
            }

            return restful_response(
                status="success",
                message="Ticket stats fetched successfully",
                data=stats,
                status_code=200
            )

        except Exception as e:
            current_app.logger.error(f"Error fetching ticket stats: {str(e)}")
            return restful_response(
                status="error", message="Internal server error", status_code=500
            )

class TicketResource(Resource):
    """Handle GET /tickets/<int:id>, PUT /tickets/<int:id>, DELETE /tickets/<int:id>"""

    
    
    @jwt_required()
    def get(self, id):
        """Get a specific ticket by ID"""
        try:
            user, user_role = get_current_user_and_role()
            if not user:
                return restful_response(
                    status="error", message="User not found", status_code=404
                )

            ticket = Ticket.query.get(id)
            if not ticket:
                return restful_response(
                    status="error", message="Ticket not found", status_code=404
                )

            # Check permissions
            if user_role == Role.CLIENT and ticket.client_id != user.id:
                return restful_response(
                    status="error", message="Access denied", status_code=403
                )

            # Get ticket messages
            messages = TicketMessage.query.filter_by(ticket_id=id).order_by(TicketMessage.created_at.asc()).all()
            
            # Get user info for messages
            user_ids = set([msg.sender_id for msg in messages])
            user_ids.add(ticket.client_id)
            if ticket.admin_id:
                user_ids.add(ticket.admin_id)
                
            users = User.query.filter(User.id.in_(user_ids)).all()
            user_map = {u.id: u for u in users}

            # Format messages
            formatted_messages = []
            for msg in messages:
                sender = user_map.get(msg.sender_id)
                formatted_messages.append({
                    "id": msg.id,
                    "body": msg.body,
                    "sender_id": msg.sender_id,
                    "sender_name": sender.full_name if sender else "Unknown",
                    "sender_role": sender.role.value if sender else "unknown",
                    "created_at": msg.created_at.isoformat() if msg.created_at else None
                })

            # Format ticket data
            client = user_map.get(ticket.client_id)
            admin = user_map.get(ticket.admin_id) if ticket.admin_id else None

            ticket_data = ticket.to_dict()
            ticket_data.update({
                "ticket_id": f"TK-{str(ticket.id).zfill(3)}",
                "client_name": client.full_name if client else "Unknown",
                "client_email": client.email if client else "",
                "admin_name": admin.full_name if admin else "Unassigned",
                "admin_email": admin.email if admin else "",
                "messages": formatted_messages
            })

            return restful_response(
                status="success",
                message="Ticket fetched successfully",
                data=ticket_data,
                status_code=200
            )

        except Exception as e:
            current_app.logger.error(f"Error fetching ticket {id}: {str(e)}")
            return restful_response(
                status="error", message="Internal server error", status_code=500
            )

    @jwt_required()
    def put(self, id):
        """Update a ticket"""
        try:
            user, user_role = get_current_user_and_role()
            if not user:
                return restful_response(
                    status="error", message="User not found", status_code=404
                )

            ticket = Ticket.query.get(id)
            if not ticket:
                return restful_response(
                    status="error", message="Ticket not found", status_code=404
                )

            # Check permissions - only admins or the assigned admin can update
            if user_role == Role.CLIENT:
                return restful_response(
                    status="error", message="Access denied", status_code=403
                )

            data = request.get_json()
            if not data:
                return restful_response(
                    status="error", message="No JSON data provided", status_code=400
                )

            # Update fields
            if 'status' in data:
                try:
                    ticket.status = TicketStatus(data['status'])
                except ValueError:
                    return restful_response(
                        status="error", message="Invalid status value", status_code=400
                    )

            if 'admin_id' in data and is_admin(user_role):
                try:
                    admin_id = int(data['admin_id'])
                    admin = User.query.filter_by(id=admin_id).filter(
                        User.role.in_([Role.ADMIN, Role.SUPER_ADMIN])
                    ).first()
                    if not admin:
                        return restful_response(
                            status="error", message="Invalid admin", status_code=400
                        )
                    ticket.admin_id = admin_id
                except (TypeError, ValueError):
                    return restful_response(
                        status="error", message="Invalid admin_id", status_code=400
                    )

            db.session.commit()

            return restful_response(
                status="success",
                message="Ticket updated successfully",
                data=ticket.to_dict(),
                status_code=200
            )

        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error updating ticket {id}: {str(e)}")
            return restful_response(
                status="error", message="Internal server error", status_code=500
            )

    @jwt_required()
    def delete(self, id):
        """Delete a ticket"""
        try:
            user, user_role = get_current_user_and_role()
            if not user:
                return restful_response(
                    status="error", message="User not found", status_code=404
                )

            ticket = Ticket.query.get(id)
            if not ticket:
                return restful_response(
                    status="error", message="Ticket not found", status_code=404
                )

            # Check permissions - only admins can delete
            if not is_admin(user_role):
                return restful_response(
                    status="error", message="Access denied", status_code=403
                )

            db.session.delete(ticket)
            db.session.commit()

            return restful_response(
                status="success",
                message="Ticket deleted successfully",
                status_code=200
            )

        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error deleting ticket {id}: {str(e)}")
            return restful_response(
                status="error", message="Internal server error", status_code=500
            )

class TicketMessagesResource(Resource):
    """Handle POST /tickets/<int:id>/messages"""
    
    @jwt_required()
    def post(self, id):
        """Add a message to a ticket"""
        try:
            user, user_role = get_current_user_and_role()
            if not user:
                return restful_response(
                    status="error", message="User not found", status_code=404
                )

            ticket = Ticket.query.get(id)
            if not ticket:
                return restful_response(
                    status="error", message="Ticket not found", status_code=404
                )

            # Check permissions
            if user_role == Role.CLIENT and ticket.client_id != user.id:
                return restful_response(
                    status="error", message="Access denied", status_code=403
                )

            data = request.get_json()
            if not data:
                return restful_response(
                    status="error", message="No JSON data provided", status_code=400
                )

            body = data.get('body', '').strip()
            if not body:
                return restful_response(
                    status="error", message="Message body is required", status_code=400
                )

            message = TicketMessage(
                ticket_id=id,
                sender_id=user.id,
                body=body
            )

            db.session.add(message)
            db.session.commit()

            # Get sender info for response
            sender = User.query.get(user.id)

            message_data = {
                "id": message.id,
                "body": message.body,
                "sender_id": message.sender_id,
                "sender_name": sender.full_name if sender else "Unknown",
                "sender_role": sender.role.value if sender else "unknown",
                "created_at": message.created_at.isoformat() if message.created_at else None
            }

            return restful_response(
                status="success",
                message="Message added successfully",
                data=message_data,
                status_code=201
            )

        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error adding message to ticket {id}: {str(e)}")
            return restful_response(
                status="error", message="Internal server error", status_code=500
            )

# Register API resources
api.add_resource(TicketListResource, "/tickets")
api.add_resource(TicketStatsResource, "/tickets/stats")
api.add_resource(TicketResource, "/tickets/<int:id>")
api.add_resource(TicketMessagesResource, "/tickets/<int:id>/messages")