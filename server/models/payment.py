import re
from . import db
from datetime import timezone, datetime
from enum import Enum as PyEnum
from sqlalchemy.orm import validates


class PaymentMethod(PyEnum):
    MPESA = "mpesa"
    CASH = "cash"
    CARD = "card"


class CashTransaction(db.Model):
    """Example model for cash payment details."""

    __tablename__ = "cash_transactions"
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Integer, nullable=False)
    received_by = db.Column(
        db.String(100),
        nullable=False,
    )  # e.g., name of the cashier
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
        """Validate that the `amount` is a positive integer."""
        if not isinstance(amount, int) or amount <= 0:
            raise ValueError("Cash amount must be a positive integer.")
        return amount

    def to_dict(self):
        """Return a dictionary representation of this CashTransaction."""
        return {
            "id": self.id,
            "amount": self.amount,
            "received_by": self.received_by,
            "payment_date": self.payment_date.isoformat(),
            "created_at": self.created_at.isoformat(),
            "currency": self.currency,
        }


class CardTransaction(db.Model):
    """Example model for cash payment details."""

    __tablename__ = "card_transactions"
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Integer, nullable=False)
    received_by = db.Column(
        db.String(100),
        nullable=False,
    )  # e.g., name of the cashier
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
        """Validate that the `amount` is a positive integer."""
        if not isinstance(amount, int) or amount <= 0:
            raise ValueError("Cash amount must be a positive integer.")
        return amount

    def to_dict(self):
        """Return a dictionary representation of this CashTransaction."""
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

    # Original fields
    amount = db.Column(db.Integer, nullable=False)
    payment_date = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    transaction_code = db.Column(
        db.String(15), unique=True, nullable=True
    )  # Changed to nullable=True
    paid_by = db.Column(db.String(15), nullable=True)
    phone_number = db.Column(db.String(15), nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    currency = db.Column(db.String(10), nullable=False, default="KES")

    # NEW FIELDS for STK Push response
    merchant_request_id = db.Column(db.String(100), nullable=True)
    checkout_request_id = db.Column(db.String(100), unique=True, nullable=True)
    response_code = db.Column(db.String(10), nullable=True)
    response_description = db.Column(db.Text, nullable=True)
    customer_message = db.Column(db.Text, nullable=True)

    # NEW FIELDS for callback data
    result_code = db.Column(db.String(10), nullable=True)
    result_desc = db.Column(db.Text, nullable=True)
    mpesa_receipt_number = db.Column(db.String(50), nullable=True)
    transaction_date = db.Column(db.String(50), nullable=True)

    # Status tracking
    status = db.Column(
        db.String(50), default="pending"
    )  # pending, completed, failed, cancelled
    callback_received = db.Column(db.Boolean, default=False)
    callback_received_at = db.Column(db.DateTime(timezone=True), nullable=True)

    # Store raw callback data for debugging
    raw_callback_data = db.Column(db.JSON, nullable=True)

    # Invoice reference
    invoice_id = db.Column(db.Integer, db.ForeignKey("invoices.id"), nullable=True)

    @validates("amount")
    def validate_amount(self, key, amount_to_check):
        """Validate that the amount is a positive integer."""
        if not isinstance(amount_to_check, int) or amount_to_check <= 0:
            raise ValueError("Amount must be a positive integer.")
        return amount_to_check

    @validates("transaction_code")
    def validate_transaction_code(self, key, code_to_check):
        """Validate M-Pesa transaction code format."""
        if code_to_check is None:
            return None  # Allow null for pending transactions
        # Assuming 10-character uppercase alphanumeric M-Pesa code
        if not (code_to_check and code_to_check.isalnum() and len(code_to_check) == 10):
            raise ValueError("Transaction code must be 10 alphanumeric characters.")
        return code_to_check.upper()

    @validates("paid_by")
    def validate_paid_by(self, key, phone_number):
        """Validate the phone number format."""
        # Kenyan format 254xxxxxxxxx
        if not re.match(r"^254\d{9}$", phone_number):
            raise ValueError(
                "'paid_by' must be a valid phone number " "in the format 254xxxxxxxxx."
            )
        return phone_number

    def to_dict(self):
        """Serialize the MpesaTransaction into a dictionary."""
        return {
            "id": self.id,
            "amount": self.amount,
            "payment_date": self.payment_date.isoformat(),
            "created_at": self.created_at.isoformat(),
            "transaction_code": self.transaction_code,
            "paid_by": self.paid_by,
            "phone_number": self.phone_number,
            "currency": self.currency,
            # New fields
            "merchant_request_id": self.merchant_request_id,
            "checkout_request_id": self.checkout_request_id,
            "response_code": self.response_code,
            "response_description": self.response_description,
            "customer_message": self.customer_message,
            "result_code": self.result_code,
            "result_desc": self.result_desc,
            "mpesa_receipt_number": self.mpesa_receipt_number,
            "transaction_date": self.transaction_date,
            "status": self.status,
            "callback_received": self.callback_received,
            "callback_received_at": (
                self.callback_received_at.isoformat()
                if self.callback_received_at
                else None
            ),
            "invoice_id": self.invoice_id,
        }


class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(
        db.Integer,
        db.ForeignKey("invoices.id"),
        nullable=False,
    )
    payment_method = db.Column(
        db.Enum(PaymentMethod),
        nullable=False,
        default=PaymentMethod.MPESA,
    )
    mpesa_transaction_id = db.Column(
        db.Integer, db.ForeignKey("mpesa_transactions.id"), nullable=True
    )
    cash_transaction_id = db.Column(
        db.Integer, db.ForeignKey("cash_transactions.id"), nullable=True
    )
    card_transaction_id = db.Column(
        db.Integer, db.ForeignKey("card_transactions.id"), nullable=True
    )
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    invoice = db.relationship("Invoice", back_populates="payments")
    mpesa_transaction = db.relationship(
        "MpesaTransaction", foreign_keys=[mpesa_transaction_id]
    )
    cash_transaction = db.relationship(
        "CashTransaction", foreign_keys=[cash_transaction_id]
    )
    card_transaction = db.relationship(
        "CardTransaction", foreign_keys=[card_transaction_id]
    )

    def to_dict(self):
        """
        Return a serializable dictionary for this Payment, embedding related
        transaction metadata when available.
        """
        payment_entity = {}

        if self.payment_method == PaymentMethod.MPESA and self.mpesa_transaction_id:
            transaction = MpesaTransaction.query.get(self.mpesa_transaction_id)
            if transaction:
                payment_entity = transaction.to_dict()
        elif self.payment_method == PaymentMethod.CASH and self.cash_transaction_id:
            transaction = CashTransaction.query.get(self.cash_transaction_id)
            if transaction:
                payment_entity = transaction.to_dict()
        elif self.payment_method == PaymentMethod.CARD and self.card_transaction_id:
            transaction = CardTransaction.query.get(self.card_transaction_id)
            if transaction:
                payment_entity = transaction.to_dict()

        return {
            "id": self.id,
            "invoice_id": self.invoice_id,
            "payment_method": self.payment_method.value,
            "mpesa_transaction_id": self.mpesa_transaction_id,
            "cash_transaction_id": self.cash_transaction_id,
            "card_transaction_id": self.card_transaction_id,
            "created_at": self.created_at.isoformat(),
            "metadata": payment_entity,
        }
