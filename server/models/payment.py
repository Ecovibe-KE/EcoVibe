import re
from . import db
from datetime import timezone, datetime
from enum import Enum as PyEnum
from sqlalchemy.orm import validates


class PaymentMethod(PyEnum):
    MPESA = "mpesa"
    CASH = "cash"


class CashTransaction(db.Model):
    """Example model for cash payment details."""

    __tablename__ = "cash_transactions"
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Integer, nullable=False)
    received_by = db.Column(db.String(100), nullable=False)  # e.g., name of the cashier
    payment_date = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    currency = db.Column(db.String(10), nullable=False, default="KES")
    
    @validates("amount")
    def validate_amount(self, key, amount):
        if not isinstance(amount, int) or amount <= 0:
            raise ValueError("Cash amount must be a positive integer.")
        return amount
    
    def to_dict(self):
        return {
            "id": self.id,
            "amount": self.amount,
            "received_by": self.received_by,
            "payment_date": self.payment_date.isoformat(),
            "created_at": self.created_at.isoformat(),
            "currency": self.currency,
        }
    


class MpesaTransaction(db.Model):
    __tablename__ = "mpesa_transactions"
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Integer, nullable=False)
    payment_date = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    # Corrected `unique_key` to `unique`
    transaction_code = db.Column(db.String(15), unique=True, nullable=False)
    paid_by = db.Column(db.String(15), nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    currency = db.Column(db.String(10), nullable=False, default="KES")

    @validates("amount")
    def validate_amount(self, key, amount_to_check):
        """Validate that the amount is a positive integer."""
        if not isinstance(amount_to_check, int) or amount_to_check <= 0:
            raise ValueError("Amount must be a positive integer.")
        return amount_to_check

    @validates("transaction_code")
    def validate_transaction_code(self, key, code_to_check):
        """Validate M-Pesa transaction code format."""
        # Assuming a standard 10-character uppercase alphanumeric M-Pesa code.
        if not (code_to_check and code_to_check.isalnum() and len(code_to_check) == 10):
            raise ValueError("Transaction code must be 10 alphanumeric characters.")
        # It's good practice to store them consistently (e.g., uppercase)
        return code_to_check.upper()

    @validates("paid_by")
    def validate_paid_by(self, key, phone_number):
        """Validate the phone number format."""
        # This validates against the Kenyan format 254xxxxxxxxx.
        if not re.match(r"^254\d{9}$", phone_number):
            raise ValueError(
                "'paid_by' must be a valid phone number in the format 254xxxxxxxxx."
            )
        return phone_number

    def to_dict(self):
        """Return a dictionary representation of the model."""
        # Simplified date formatting as the fields are non-nullable.
        return {
            "id": self.id,
            "amount": self.amount,
            "payment_date": self.payment_date.isoformat(),
            "created_at": self.created_at.isoformat(),
            "transaction_code": self.transaction_code,
            "paid_by": self.paid_by,
            "currency": self.currency,
        }


class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey("invoices.id"), nullable=False)
    payment_method = db.Column(
        db.Enum(PaymentMethod), nullable=False, default=PaymentMethod.MPESA
    )
    payment_method_id = db.Column(db.Integer, nullable=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationship (assuming an "Invoice" model exists)
    invoice = db.relationship("Invoice", back_populates="payments")

    def to_dict(self):
        """
        Serializes the Payment and dynamically fetches and embeds the
        details of the specific payment method used.
        """
        payment_entity = {}
        # Only query if there is a related entity ID
        if self.payment_method_id:
            if self.payment_method == PaymentMethod.MPESA:
                # Find the related M-Pesa transaction by its ID
                transaction = MpesaTransaction.query.get(self.payment_method_id)
                if transaction:
                    payment_entity = transaction.to_dict()
            elif self.payment_method == PaymentMethod.CASH:
                # Find the related Cash transaction by its ID
                transaction = CashTransaction.query.get(self.payment_method_id)
                if transaction:
                    payment_entity = transaction.to_dict()

        return {
            "id": self.id,
            "invoice_id": self.invoice_id,
            "payment_method": self.payment_method.value,
            "payment_method_id": self.payment_method_id,
            # Simplified as it's non-nullable
            "created_at": self.created_at.isoformat(),
            "metadata": payment_entity,
        }