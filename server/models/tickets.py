from datetime import datetime, timezone
from enum import Enum
from sqlalchemy.orm import validates
from . import db


class TicketStatus(Enum):
    """Controlled vocabulary for the status of a ticket."""

    OPEN = "open"
    CLOSED = "closed"
    IN_PROGRESS = "in_progress"


class Ticket(db.Model):
    __tablename__ = "tickets"

    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    assigned_admin_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    subject = db.Column(db.String(255), nullable=False)
    status = db.Column(db.Enum(TicketStatus), nullable=False, default=TicketStatus.OPEN)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # --- Relationships ---
    # Explicitly define foreign_keys for relationships pointing to the same table (User)
    client = db.relationship(
        "User", foreign_keys=[client_id], back_populates="client_tickets"
    )
    admin = db.relationship(
        "User", foreign_keys=[assigned_admin_id], back_populates="admin_tickets"
    )

    # Correctly point to the TicketMessage model and cascade deletes
    messages = db.relationship(
        "TicketMessage", back_populates="ticket", cascade="all, delete-orphan"
    )

    # --- Validation ---
    @validates("subject")
    def validate_subject(self, key, subject):
        """Ensures the ticket subject is not empty."""
        if not subject or not subject.strip():
            raise ValueError("Subject cannot be empty.")
        return subject.strip()

    # --- Serialization ---
    def to_dict(self):
        """Converts the ticket object to a dictionary."""
        return {
            "id": self.id,
            "client_id": self.client_id,
            "assigned_admin_id": self.assigned_admin_id,
            "subject": self.subject,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
        }

    def __repr__(self):
        return f"<Ticket id={self.id} subject='{self.subject}' status='{self.status.value}'>"
