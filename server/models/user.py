from werkzeug.security import check_password_hash, generate_password_hash
from email_validator import validate_email, EmailNotValidError
from datetime import timezone, datetime
from sqlalchemy.orm import validates
from urllib.parse import urlparse
from enum import Enum as PyEnum
from . import db
import re

class Role(PyEnum):
    CLIENT = "client"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class AccountStatus(PyEnum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    INACTIVE = "inactive"

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    industry = db.Column(db.String(80), nullable=False)
    full_name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone_number = db.Column(db.String(20), unique=True, nullable=False)
    role = db.Column(db.Enum(Role), nullable=False, default=Role.CLIENT)
    profile_image = db.Column(db.String(200), nullable=True)
    account_status = db.Column(db.Enum(AccountStatus), nullable=False, default=AccountStatus.ACTIVE)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    password_hash = db.Column(db.String(128), nullable=False)

    def __repr__(self):
        return f"<User id={self.id} name={self.full_name} role={self.role.value}>"

    def to_dict(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "phone_number": self.phone_number,
            "role": self.role.value,
            "account_status": self.account_status.value,
            "industry": self.industry,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "profile_image_url": self.profile_image_url,
        }


    def to_safe_dict(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "role": self.role.value,
            "account_status": self.account_status.value,
            "industry": self.industry,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "profile_image_url": self.profile_image_url,
        }



    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    @validates("email")
    def validate_email_field(self, key, address):
        try:
            valid = validate_email(address)
            return valid.email
        except EmailNotValidError as e:
            raise ValueError(str(e))

    @validates("phone_number")
    def validate_phone(self, key, number):
        pattern = r"^(?:\+\d{7,15}|0\d{6,14})$"
        if not re.match(pattern, number):
            raise ValueError(
                "Invalid phone number format. Use international (+254722123456) or local (0722123456)."
            )
        return number

    @validates("full_name")
    def validate_name(self, key, name):
        if not name.strip():
            raise ValueError("Full name cannot be empty")
        return name
    
    @validates("industry")
    def validate_industry(self, key, industry):
        if not industry.strip():
            raise ValueError("Industry cannot be empty")
        return industry
    
    @validates("role")
    def validate_role(self, key, role):
        if not role:
            raise ValueError("Role cannot be empty")
        if isinstance(role, Role):
            return role
        try:
            return Role(role)
        except ValueError:
            raise ValueError(
                f"Invalid role: {role}. Must be one of: {', '.join([r.value for r in Role])}"
            )
    
    @validates("account_status")
    def validate_account_status(self, key, status):
        if not status:
            raise ValueError("Account status cannot be empty")
        if isinstance(status, AccountStatus):
            return status
        try:
            return AccountStatus(status)
        except ValueError:
            raise ValueError(
                f"Invalid account status: {status}. Must be one of: {', '.join([s.value for s in AccountStatus])}"
            )

    @validates("profile_image_url")
    def validate_profile_image_url(self, key, url):
        if url:
            parsed = urlparse(url)
            if not all([parsed.scheme in ("http", "https"), parsed.netloc]):
                raise ValueError("Invalid profile image URL. Must start with http:// or https://")
        return url