from datetime import datetime, timezone
import os
from flask_restful import Resource, Api
from flask import Blueprint, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.responses import restful_response
from models import db
from models.ticket import Ticket, TicketStatus
from models.ticket_message import TicketMessage
from models.user import User, Role
from sqlalchemy import or_, and_


# Create a Blueprint
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
    """Handle GET /tickets (list) and POST /tickets (create)"""
    
    @jwt_required()
    def get(self):
        """Get tickets - clients see only their tickets, admins see all"""
        try:
            user, user_role = get_current_user_role()
            if not user:
                return restful_response(
                    status="error", message="User not found", status_code=404
                )

            # Parse query parameters for filtering
            status_filter = request.args.get('status')
            search = request.args.get('search', '').strip()
            assigned_to = request.args.get('assigned_to')
            page = int(request.args.get('page', 1))
            per_page = min(int(request.args.get('per_page', 10)), 100)

            # Base query
            query = Ticket.query

            # Role-based filtering
            if user_role == Role.CLIENT:
                # Clients only see their own tickets
                query = query.filter(Ticket.client_id == user.id)
            elif is_admin(user_role):
                # Admins see all tickets, optionally filtered by assignment
                if assigned_to:
                    try:
                        assigned_admin_id = int(assigned_to)
                        query = query.filter(Ticket.admin_id == assigned_admin_id)
                    except ValueError:
                        return restful_response(
                            status="error", 
                            message="Invalid assigned_to parameter", 
                            status_code=400
                        )

            # Apply filters
            if status_filter:
                try:
                    status_enum = TicketStatus(status_filter)
                    query = query.filter(Ticket.status == status_enum)
                except ValueError:
                    return restful_response(
                        status="error", 
                        message="Invalid status value", 
                        status_code=400
                    )

            if search:
                search_term = f"%{search}%"
                query = query.filter(
                    or_(
                        Ticket.subject.ilike(search_term),
                        Ticket.id.like(search_term)
                    )
                )

            # Order by created_at descending
            query = query.order_by(Ticket.created_at.desc())

            # Paginate
            paginated = query.paginate(
                page=page,
                per_page=per_page,
                error_out=False
            )

            tickets = []
            for ticket in paginated.items:
                # Get client and admin info
                client = User.query.get(ticket.client_id)
                admin = User.query.get(ticket.admin_id) if ticket.admin_id else None
                
                # Get message count
                message_count = TicketMessage.query.filter_by(ticket_id=ticket.id).count()

                ticket_data = ticket.to_dict()
                ticket_data.update({
                    'ticket_id': f'TK-{str(ticket.id).zfill(3)}',
                    'client_name': client.full_name if client else 'Unknown',
                    'client_email': client.email if client else '',
                    'client_company': getattr(client, 'industry', '') if client else '',
                    'admin_name': admin.full_name if admin else 'Unassigned',
                    'admin_email': admin.email if admin else '',
                    'message_count': message_count,
                    'last_updated': ticket.created_at.isoformat()
                })
                tickets.append(ticket_data)

            return restful_response(
                status="success",
                message="Tickets fetched successfully",
                data={
                    'tickets': tickets,
                    'pagination': {
                        'page': paginated.page,
                        'pages': paginated.pages,
                        'per_page': paginated.per_page,
                        'total': paginated.total,
                        'has_next': paginated.has_next,
                        'has_prev': paginated.has_prev
                    }
                },
                status_code=200
            )

        except Exception as e:
            current_app.logger.error(f"Error fetching tickets: {str(e)}")
            return restful_response(
                status="error", 
                message="Internal server error", 
                status_code=500
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

            # Get request data
            data = request.get_json()
            if not data:
                return restful_response(
                    status="error", 
                    message="No JSON data provided", 
                    status_code=400
                )

            subject = data.get('subject', '').strip()
            description = data.get('description', '').strip()
            priority = data.get('priority', 'medium')
            category = data.get('category', 'general')

            # Validate required fields
            if not subject:
                return restful_response(
                    status="error", 
                    message="Subject is required", 
                    status_code=400
                )

            if not description:
                return restful_response(
                    status="error", 
                    message="Description is required", 
                    status_code=400
                )

            # Determine client and admin
            if user_role == Role.CLIENT:
                client_id = user.id
                # Auto-assign to first available admin or leave unassigned
                admin = User.query.filter(
                    User.role.in_([Role.ADMIN, Role.SUPER_ADMIN])
                ).first()
                admin_id = admin.id if admin else None
            else:
                # Admins can create tickets on behalf of clients
                client_id = data.get('client_id')
                admin_id = data.get('admin_id', user.id)
                
                if not client_id:
                    return restful_response(
                        status="error", 
                        message="Client ID is required for admin ticket creation", 
                        status_code=400
                    )

                # Verify client exists
                client = User.query.filter_by(id=client_id, role=Role.CLIENT).first()
                if not client:
                    return restful_response(
                        status="error", 
                        message="Invalid client", 
                        status_code=400
                    )

                # Verify admin if specified
                if admin_id:
                    admin = User.query.filter_by(id=admin_id).filter(
                        User.role.in_([Role.ADMIN, Role.SUPER_ADMIN])
                    ).first()
                    if not admin:
                        return restful_response(
                            status="error", 
                            message="Invalid admin", 
                            status_code=400
                        )

            # Create ticket
            ticket = Ticket(
                client_id=client_id,
                admin_id=admin_id,
                subject=subject,
                status=TicketStatus.OPEN
            )

            db.session.add(ticket)
            db.session.flush()  # Get the ID

            # Create initial message with description
            initial_message = TicketMessage(
                ticket_id=ticket.id,
                sender_id=user.id,
                body=description
            )
            db.session.add(initial_message)
            db.session.commit()

            # Get complete ticket info for response
            client = User.query.get(ticket.client_id)
            admin = User.query.get(ticket.admin_id) if ticket.admin_id else None

            ticket_data = ticket.to_dict()
            ticket_data.update({
                'ticket_id': f'TK-{str(ticket.id).zfill(3)}',
                'client_name': client.full_name if client else 'Unknown',
                'admin_name': admin.full_name if admin else 'Unassigned',
                'priority': priority,
                'category': category
            })

            return restful_response(
                status="success",
                message="Ticket created successfully",
                data=ticket_data,
                status_code=201
            )

        except ValueError as e:
            db.session.rollback()
            return restful_response(
                status="error", 
                message=str(e), 
                status_code=400
            )
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error creating ticket: {str(e)}")
            return restful_response(
                status="error", 
                message="Internal server error", 
                status_code=500
            )


class TicketResource(Resource):
    """Handle GET /tickets/<id>, PUT /tickets/<id>, DELETE /tickets/<id>"""
    
    @jwt_required()
    def get(self, ticket_id):
        """Get a specific ticket with messages"""
        try:
            user, user_role = get_current_user_role()
            if not user:
                return restful_response(
                    status="error", message="User not found", status_code=404
                )

            ticket = Ticket.query.get(ticket_id)
            if not ticket:
                return restful_response(
                    status="error", 
                    message="Ticket not found", 
                    status_code=404
                )

            # Check permissions - clients can only see their tickets
            if user_role == Role.CLIENT and ticket.client_id != user.id:
                return restful_response(
                    status="error", 
                    message="Access denied", 
                    status_code=403
                )

            # Get messages
            messages = TicketMessage.query.filter_by(ticket_id=ticket_id)\
                                         .order_by(TicketMessage.created_at.asc()).all()

            # Get user info
            client = User.query.get(ticket.client_id)
            admin = User.query.get(ticket.admin_id) if ticket.admin_id else None

            ticket_data = ticket.to_dict()
            ticket_data.update({
                'ticket_id': f'TK-{str(ticket.id).zfill(3)}',
                'client_name': client.full_name if client else 'Unknown',
                'client_email': client.email if client else '',
                'admin_name': admin.full_name if admin else 'Unassigned',
                'admin_email': admin.email if admin else '',
                'messages': []
            })

            # Add messages with sender info
            for msg in messages:
                sender = User.query.get(msg.sender_id)
                message_data = msg.to_dict()
                message_data.update({
                    'sender_name': sender.full_name if sender else 'Unknown',
                    'sender_role': sender.role.value if sender else 'unknown',
                    'sender_email': sender.email if sender else ''
                })
                ticket_data['messages'].append(message_data)

            return restful_response(
                status="success",
                message="Ticket fetched successfully",
                data=ticket_data,
                status_code=200
            )

        except Exception as e:
            current_app.logger.error(f"Error fetching ticket {ticket_id}: {str(e)}")
            return restful_response(
                status="error", 
                message="Internal server error", 
                status_code=500
            )

    @jwt_required()
    def put(self, ticket_id):
        """Update a ticket (status, assignment, subject)"""
        try:
            user, user_role = get_current_user_role()
            if not user:
                return restful_response(
                    status="error", message="User not found", status_code=404
                )

            ticket = Ticket.query.get(ticket_id)
            if not ticket:
                return restful_response(
                    status="error", 
                    message="Ticket not found", 
                    status_code=404
                )

            # Check permissions
            if user_role == Role.CLIENT and ticket.client_id != user.id:
                return restful_response(
                    status="error", 
                    message="Access denied", 
                    status_code=403
                )

            data = request.get_json()
            if not data:
                return restful_response(
                    status="error", 
                    message="No JSON data provided", 
                    status_code=400
                )

            updated_fields = []

            # Update status
            if 'status' in data:
                try:
                    new_status = TicketStatus(data['status'])
                    # Clients can't set status to IN_PROGRESS
                    if user_role == Role.CLIENT and new_status == TicketStatus.IN_PROGRESS:
                        return restful_response(
                            status="error", 
                            message="Cannot change status to in_progress", 
                            status_code=403
                        )
                    ticket.status = new_status
                    updated_fields.append('status')
                except ValueError:
                    return restful_response(
                        status="error", 
                        message="Invalid status value", 
                        status_code=400
                    )

            # Update assignment (admins only)
            if 'admin_id' in data and is_admin(user_role):
                admin_id = data['admin_id']
                if admin_id:
                    admin = User.query.filter_by(id=admin_id).filter(
                        User.role.in_([Role.ADMIN, Role.SUPER_ADMIN])
                    ).first()
                    if not admin:
                        return restful_response(
                            status="error", 
                            message="Invalid admin", 
                            status_code=400
                        )
                ticket.admin_id = admin_id
                updated_fields.append('assigned_admin')

            # Update subject (clients can update if ticket is open)
            if 'subject' in data:
                new_subject = data['subject'].strip()
                if not new_subject:
                    return restful_response(
                        status="error", 
                        message="Subject cannot be empty", 
                        status_code=400
                    )
                
                if user_role == Role.CLIENT and ticket.status != TicketStatus.OPEN:
                    return restful_response(
                        status="error", 
                        message="Cannot update subject of closed ticket", 
                        status_code=403
                    )
                
                ticket.subject = new_subject
                updated_fields.append('subject')

            if updated_fields:
                db.session.commit()
                return restful_response(
                    status="success",
                    message=f"Ticket updated: {', '.join(updated_fields)}",
                    data=ticket.to_dict(),
                    status_code=200
                )
            else:
                return restful_response(
                    status="success",
                    message="No changes made",
                    status_code=200
                )

        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error updating ticket {ticket_id}: {str(e)}")
            return restful_response(
                status="error", 
                message="Internal server error", 
                status_code=500
            )

    @jwt_required()
    def delete(self, ticket_id):
        """Delete a ticket (admin only)"""
        try:
            user, user_role = get_current_user_role()
            if not user:
                return restful_response(
                    status="error", message="User not found", status_code=404
                )

            if not is_admin(user_role):
                return restful_response(
                    status="error", 
                    message="Insufficient permissions", 
                    status_code=403
                )

            ticket = Ticket.query.get(ticket_id)
            if not ticket:
                return restful_response(
                    status="error", 
                    message="Ticket not found", 
                    status_code=404
                )

            ticket_subject = ticket.subject
            db.session.delete(ticket)
            db.session.commit()

            return restful_response(
                status="success",
                message=f'Ticket "{ticket_subject}" deleted successfully',
                status_code=200
            )

        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error deleting ticket {ticket_id}: {str(e)}")
            return restful_response(
                status="error", 
                message="Internal server error", 
                status_code=500
            )


class TicketStatsResource(Resource):
    """Handle GET /tickets/stats"""
    
    @jwt_required()
    def get(self):
        """Get ticket statistics"""
        try:
            user, user_role = get_current_user_role()
            if not user:
                return restful_response(
                    status="error", message="User not found", status_code=404
                )

            # Base query
            base_query = Ticket.query

            # Role-based filtering
            if user_role == Role.CLIENT:
                base_query = base_query.filter(Ticket.client_id == user.id)

            stats = {
                'total': base_query.count(),
                'open': base_query.filter(Ticket.status == TicketStatus.OPEN).count(),
                'in_progress': base_query.filter(Ticket.status == TicketStatus.IN_PROGRESS).count(),
                'closed': base_query.filter(Ticket.status == TicketStatus.CLOSED).count(),
            }

            # Add resolved count (using closed for now)
            stats['resolved'] = stats['closed']

            return restful_response(
                status="success",
                message="Ticket stats fetched successfully",
                data={'stats': stats},
                status_code=200
            )

        except Exception as e:
            current_app.logger.error(f"Error fetching ticket stats: {str(e)}")
            return restful_response(
                status="error", 
                message="Internal server error", 
                status_code=500
            )


class TicketMessagesResource(Resource):
    """Handle POST /tickets/<id>/messages"""
    
    @jwt_required()
    def post(self, ticket_id):
        """Add a message to a ticket"""
        try:
            user, user_role = get_current_user_role()
            if not user:
                return restful_response(
                    status="error", message="User not found", status_code=404
                )

            ticket = Ticket.query.get(ticket_id)
            if not ticket:
                return restful_response(
                    status="error", 
                    message="Ticket not found", 
                    status_code=404
                )

            # Check permissions
            if user_role == Role.CLIENT and ticket.client_id != user.id:
                return restful_response(
                    status="error", 
                    message="Access denied", 
                    status_code=403
                )

            data = request.get_json()
            if not data:
                return restful_response(
                    status="error", 
                    message="No JSON data provided", 
                    status_code=400
                )

            body = data.get('body', '').strip()
            if not body:
                return restful_response(
                    status="error", 
                    message="Message body is required", 
                    status_code=400
                )

            # Create message
            message = TicketMessage(
                ticket_id=ticket_id,
                sender_id=user.id,
                body=body
            )

            db.session.add(message)

            # Update ticket status if needed (client reply reopens closed ticket)
            if user_role == Role.CLIENT and ticket.status == TicketStatus.CLOSED:
                ticket.status = TicketStatus.OPEN

            db.session.commit()

            # Prepare response data
            message_data = message.to_dict()
            message_data.update({
                'sender_name': user.full_name,
                'sender_role': user.role.value,
                'sender_email': user.email
            })

            return restful_response(
                status="success",
                message="Message added successfully",
                data=message_data,
                status_code=201
            )

        except ValueError as e:
            db.session.rollback()
            return restful_response(
                status="error", 
                message=str(e), 
                status_code=400
            )
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error adding message to ticket {ticket_id}: {str(e)}")
            return restful_response(
                status="error", 
                message="Internal server error", 
                status_code=500
            )


# Register API resources
api.add_resource(TicketListResource, "/tickets")
api.add_resource(TicketResource, "/tickets/<int:ticket_id>")
api.add_resource(TicketStatsResource, "/tickets/stats")
api.add_resource(TicketMessagesResource, "/tickets/<int:ticket_id>/messages")