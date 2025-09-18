from . import db
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime, timezone
from sqlalchemy.orm import relationship
from sqlalchemy import func, Enum
from enum import Enum as PyEnum

class Role(PyEnum):
    CLIENT = "client"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class AccountStatus(PyEnum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DELETED = "deleted"

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    industry = db.Column(db.String(80), nullable=False)
    full_name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone_number = db.Column(db.String(20), unique=True, nullable=False)
    role = db.Column(db.Enum(Role), nullable=False, default=Role.CLIENT)
    profile_image_url = db.Column(db.String(200), nullable=True)
    account_status = db.Column(db.Enum(AccountStatus), nullable=False, default=AccountStatus.ACTIVE)
    created_at = db.Column(db.DateTime, server_default=func.now(), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    password_hash = db.Column(db.String(128), nullable=False)

    def __repr__(self):
        return f"<User {self.full_name} ({self.role.value})>"

    def to_dict(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "phone_number": self.phone_number,
            "role": self.role.value,
            "account_status": self.account_status.value,
            "industry": self.industry,
            "created_at": self.created_at.isoformat() + "Z" if self.created_at else None,
            "updated_at": self.updated_at.isoformat() + "Z" if self.updated_at else None,
            "profile_image_url": self.profile_image_url,
        }


    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)