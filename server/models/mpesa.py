import uuid

from werkzeug.security import check_password_hash, generate_password_hash
from email_validator import validate_email, EmailNotValidError
from datetime import timezone, datetime
from sqlalchemy.orm import validates
from sqlalchemy import UniqueConstraint
from urllib.parse import urlparse
from enum import Enum as PyEnum
from . import db

class Status(PyEnum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"

class MpesaTransaction(db.Model):
    __tablename__ = 'mpesa_transactions'

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    payment_date = db.Column(db.Date, nullable=False)
    transaction_code = db.Column(db.String(50), nullable=False, unique=True)
    paid_by = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.Date, nullable=False, default=datetime.utcnow().date)
    currency = db.Column(db.String(3), nullable=False, default='KES')

    # Additional fields for MPESA integration
    merchant_request_id = db.Column(db.String(50))
    checkout_request_id = db.Column(db.String(50))
    phone_number = db.Column(db.String(20), nullable=False)
    transaction_desc = db.Column(db.String(255))
    status = db.Columndb.Column(
        db.Enum(Status),
        nullable=False,
        default=Status.PENDING,
    )  # pending, completed, failed
    result_code = db.Column(db.Integer)
    result_desc = db.Column(db.String(255))
    callback_received = db.Column(db.Boolean, default=False)
    callback_data = db.Column(db.Text)

    def __init__(self, amount, paid_by, phone_number, transaction_desc,
                 payment_date=None, currency='KES'):
        self.amount = amount
        self.paid_by = paid_by
        self.phone_number = phone_number
        self.transaction_desc = transaction_desc
        self.payment_date = payment_date or datetime.utcnow().date
        self.currency = currency
        # Generate a temporary transaction code until we get the real one from MPESA
        self.transaction_code = f"TEMP_{uuid.uuid4().hex[:10]}"

    def to_dict(self):
        return {
            'id': self.id,
            'amount': self.amount,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'transaction_code': self.transaction_code,
            'paid_by': self.paid_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'currency': self.currency,
            'phone_number': self.phone_number,
            'transaction_desc': self.transaction_desc,
            'status': self.status,
            'result_code': self.result_code,
            'result_desc': self.result_desc,
            'merchant_request_id': self.merchant_request_id,
            'checkout_request_id': self.checkout_request_id,
            'callback_received': self.callback_received
        }

    def __repr__(self):
        return f'<MpesaTransaction {self.transaction_code} - {self.amount} {self.currency}>'