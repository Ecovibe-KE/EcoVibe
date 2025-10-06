import enum
from datetime import date
from sqlalchemy.orm import validates
from . import db


# Define the Enum for the 'status' field to ensure data consistency
class InvoiceStatus(enum.Enum):
    pending = "pending"
    paid = "paid"
    overdue = "overdue"
    cancelled = "cancelled"
    deleted = "deleted"


class Invoice(db.Model):
    __tablename__ = "invoices"

    # --- Schema Columns ---
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Integer, nullable=False)
    client_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey("services.id"), nullable=False)
    created_at = db.Column(db.Date, default=date.today, nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    status = db.Column(
        db.Enum(InvoiceStatus), nullable=False, default=InvoiceStatus.pending
    )

    # --- Relationships ---
    client = db.relationship("User", back_populates="invoices")
    service = db.relationship("Service", back_populates="invoices")
    payments = db.relationship(
        "Payment",
        back_populates="invoice",
        cascade="all, delete-orphan",
        lazy="joined",  # Changed from dynamic to joined or select
    )

    # --- Data Validations ---
    @validates("amount")
    def validate_amount(self, key, value):
        """Ensures the invoice amount is a positive integer."""
        if not isinstance(value, int) or value <= 0:
            raise ValueError("Amount must be a positive integer.")
        return value

    @validates("due_date")
    def validate_due_date(self, key, due_date_value):
        """Ensures the due date is not in the past."""
        creation_date = self.created_at if self.created_at else date.today()
        if due_date_value < creation_date:
            raise ValueError("Due date cannot be before the creation date.")
        return due_date_value

    # --- Serialization ---
    def to_dict(self):
        """Converts the model instance to a dictionary."""
        return {
            "id": self.id,
            "amount": self.amount,
            "client_id": self.client_id,
            "service_id": self.service_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "status": self.status.value if self.status else None,
        }
