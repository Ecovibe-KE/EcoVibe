import re
from decimal import Decimal

from sqlalchemy import Numeric

from . import db
from datetime import timezone, datetime
from enum import Enum as PyEnum
from sqlalchemy.orm import validates


class PaymentMethod(PyEnum):
    MPESA = "mpesa"
    CASH = "cash"
    CARD = "card"
    BANK_TRANSFER = "bank_transfer"
    PAYBILL = "paybill"


class PaymentStatus(PyEnum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"


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


class BankTransferTransaction(db.Model):
    """Model for bank transfer payment details."""

    __tablename__ = "bank_transfer_transactions"
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(Numeric(12, 2),
                       nullable=False,
                       default=Decimal("0.00"))
    bank_name = db.Column(db.String(100), nullable=False)
    account_name = db.Column(db.String(100), nullable=False)
    account_number = db.Column(db.String(50), nullable=False)
    branch = db.Column(db.String(100), nullable=True)
    swift_code = db.Column(db.String(20), nullable=True)
    reference_number = db.Column(db.String(100), nullable=False)
    transfer_date = db.Column(db.DateTime(timezone=True),
                              nullable=False)

    # BLOB storage for proof of payment
    proof_of_payment_file = db.Column(db.LargeBinary, nullable=True)
    proof_of_payment_filename = db.Column(db.String(255), nullable=True)
    proof_of_payment_mimetype = db.Column(db.String(100), nullable=True)

    sender_name = db.Column(db.String(100), nullable=True)
    sender_account = db.Column(db.String(50), nullable=True)
    status = db.Column(
        db.Enum(PaymentStatus),
        nullable=False,
        default=PaymentStatus.PENDING
    )
    verified_by = db.Column(db.String(100), nullable=True)
    verified_at = db.Column(db.DateTime(timezone=True), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    currency = db.Column(db.String(10), nullable=False, default="KES")

    @validates("amount")
    def validate_amount(self, key, amount):
        """Validate that `amount` is a positive decimal value."""
        # Convert to Decimal if it's not already
        if not isinstance(amount, Decimal):
            try:
                amount = Decimal(str(amount))
            except Exception:
                raise ValueError("Cash amount must be a valid number.")

        # Ensure it’s positive
        if amount <= 0:
            raise ValueError("Cash amount must be greater than zero.")

        return amount

    def to_dict(self):
        """Return a dictionary representation of this BankTransferTransaction."""
        return {
            "id": self.id,
            "amount": self.amount,
            "bank_name": self.bank_name,
            "account_name": self.account_name,
            "account_number": self.account_number,
            "branch": self.branch,
            "swift_code": self.swift_code,
            "reference_number": self.reference_number,
            "transfer_date": self.transfer_date.isoformat()
            if self.transfer_date else None,
            "proof_of_payment_filename": self.proof_of_payment_filename,
            "proof_of_payment_mimetype": self.proof_of_payment_mimetype,
            "has_proof_file": self
                              .proof_of_payment_file is not None,
            "sender_name": self.sender_name,
            "sender_account": self.sender_account,
            "status": self.status,
            "verified_by": self.verified_by,
            "verified_at": self.verified_at.isoformat() if self.verified_at else None,
            "notes": self.notes,
            "created_at": self.created_at.isoformat(),
            "currency": self.currency,
        }


class PaybillTransaction(db.Model):
    """Model for paybill payment details."""

    __tablename__ = "paybill_transactions"
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    paybill_number = db.Column(db.String(20), nullable=False)
    account_number = db.Column(db.String(100), nullable=False)  # Invoice ID
    provider = db.Column(db.String(20), nullable=False)  # mpesa, airtel
    transaction_code = db.Column(db.String(50), nullable=True)
    phone_number = db.Column(db.String(15), nullable=True)
    transaction_date = db.Column(db.DateTime(timezone=True), nullable=True)
    status = db.Column(
        db.Enum(PaymentStatus),
        nullable=False,
        default=PaymentStatus.PENDING
    )
    confirmation_received = db.Column(db.Boolean, default=False)
    confirmed_at = db.Column(db.DateTime(timezone=True), nullable=True)
    raw_callback_data = db.Column(db.JSON, nullable=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    currency = db.Column(db.String(10), nullable=False, default="KES")

    @validates("amount")
    def validate_amount(self, key, amount):
        """Validate that `amount` is a positive decimal value."""
        # Convert to Decimal if it's not already
        if not isinstance(amount, Decimal):
            try:
                amount = Decimal(str(amount))
            except Exception:
                raise ValueError("Cash amount must be a valid number.")

        # Ensure it’s positive
        if amount <= 0:
            raise ValueError("Cash amount must be greater than zero.")

        return amount

    @validates("phone_number")
    def validate_phone_number(self, key, phone_number):
        """Validate the phone number format if provided."""
        if phone_number and not re.match(r"^254\d{9}$", phone_number):
            raise ValueError(
                "Phone number must be in the format 254xxxxxxxxx."
            )
        return phone_number

    def to_dict(self):
        """Return a dictionary representation of this PaybillTransaction."""
        return {
            "id": self.id,
            "amount": str(self.amount) if self.amount is not None else None,
            "paybill_number": self.paybill_number,
            "account_number": self.account_number,
            "provider": self.provider,
            "transaction_code": self.transaction_code,
            "phone_number": self.phone_number,
            "transaction_date": self.transaction_date.isoformat()
            if self.transaction_date else None,
            "status": self.status.value if self.status else None,
            "confirmation_received": self.confirmation_received,
            "confirmed_at": self.confirmed_at.isoformat()
            if self.confirmed_at else None,
            "created_at": self.created_at.isoformat(),
            "currency": self.currency,
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
    bank_transfer_transaction_id = db.Column(
        db.Integer, db.ForeignKey("bank_transfer_transactions.id"), nullable=True
    )
    paybill_transaction_id = db.Column(
        db.Integer, db.ForeignKey("paybill_transactions.id"), nullable=True
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
    bank_transfer_transaction = db.relationship(
        "BankTransferTransaction", foreign_keys=[bank_transfer_transaction_id]
    )
    paybill_transaction = db.relationship(
        "PaybillTransaction", foreign_keys=[paybill_transaction_id]
    )

    def to_dict(self):
        """
        Return a serializable dictionary for this Payment, embedding related
        transaction metadata when available.
        """
        payment_entity = {}

        if (self.payment_method == PaymentMethod
                .MPESA and self.mpesa_transaction_id):
            transaction = MpesaTransaction.query.get(self.mpesa_transaction_id)
            if transaction:
                payment_entity = transaction.to_dict()
        elif (self.payment_method == PaymentMethod
                .CASH and self.cash_transaction_id):
            transaction = CashTransaction.query.get(self.cash_transaction_id)
            if transaction:
                payment_entity = transaction.to_dict()
        elif (self.payment_method == PaymentMethod
                .CARD and self.card_transaction_id):
            transaction = CardTransaction.query.get(self.card_transaction_id)
            if transaction:
                payment_entity = transaction.to_dict()
        elif (self.payment_method == PaymentMethod
                .BANK_TRANSFER and self.bank_transfer_transaction_id):
            transaction = (BankTransferTransaction
                           .query
                           .get(self
                                .bank_transfer_transaction_id))
            if transaction:
                payment_entity = transaction.to_dict()
        elif (self.payment_method == PaymentMethod
                .PAYBILL and self.paybill_transaction_id):
            transaction = PaybillTransaction.query.get(self.paybill_transaction_id)
            if transaction:
                payment_entity = transaction.to_dict()

        return {
            "id": self.id,
            "invoice_id": self.invoice_id,
            "payment_method": self.payment_method.value,
            "mpesa_transaction_id": self.mpesa_transaction_id,
            "cash_transaction_id": self.cash_transaction_id,
            "card_transaction_id": self.card_transaction_id,
            "bank_transfer_transaction_id": self.bank_transfer_transaction_id,
            "paybill_transaction_id": self.paybill_transaction_id,
            "created_at": self.created_at.isoformat(),
            "metadata": payment_entity,
        }
