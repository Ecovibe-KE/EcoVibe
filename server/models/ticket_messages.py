from datetime import datetime, timezone
from sqlalchemy.orm import validates
from . import db


class TicketMessage(db.Model):
    __tablename__ = "ticket_messages"

    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey("tickets.id"), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # Use db.Text for potentially long message bodies
    body = db.Column(db.Text, nullable=False)

    # Make timestamp non-nullable and add a timezone-aware default
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # --- Relationships ---
    ticket = db.relationship("Ticket", back_populates="ticket_messages")
    sender = db.relationship("User", back_populates="ticket_messages")

    # --- Validation ---
    @validates("body")
    def validate_body(self, key, body):
        """Ensures the message body is not empty."""
        if not body or not body.strip():
            raise ValueError("Message body cannot be empty or contain only whitespace.")
        return body

    # --- Serialization ---
    def to_dict(self):
        """Converts the model instance into a dictionary."""
        return {
            "id": self.id,
            "ticket_id": self.ticket_id,
            "sender_id": self.sender_id,
            "body": self.body,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<TicketMessage id={self.id} ticket_id={self.ticket_id}>"
