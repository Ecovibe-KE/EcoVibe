from werkzeug.security import check_password_hash, generate_password_hash
from email_validator import validate_email, EmailNotValidError
from datetime import timezone, datetime
from sqlalchemy.orm import validates
from sqlalchemy import UniqueConstraint, func, text
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
    __tablename__ = "users"

    __mapper_args__ = {"eager_defaults": True}

    __table_args__ = (
        UniqueConstraint("email", name="uq_user_email"),
        UniqueConstraint("phone_number", name="uq_user_phone_number"),
    )

    id = db.Column(db.Integer, primary_key=True)
    industry = db.Column(db.String(80), nullable=False)
    full_name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), nullable=False, index=True)
    phone_number = db.Column(db.String(20), nullable=False, index=True)
    role = db.Column(
        db.Enum(Role, name="role_enum", validate_strings=True),
        nullable=False,
        default=Role.CLIENT,
    )
    profile_image_url = db.Column(db.String(200), nullable=True)
    account_status = db.Column(
        db.Enum(AccountStatus),
        nullable=False,
        default=AccountStatus.INACTIVE,
    )
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    password_hash = db.Column(db.String(255), nullable=False)

    @property
    def password(self):
        """Password is write-only, raises AttributeError if accessed."""
        raise AttributeError("Password is write-only.")

    @password.setter
    def password(self, password):
        """Setter for write-only password field."""
        self.set_password(password)

    def __repr__(self):
        return f"<User id={self.id} name={self.full_name} role={self.role.value}>"

    def to_dict(self):
        """Return full dict (includes sensitive fields)."""
        return {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "phone_number": self.phone_number,
            "role": self.role.value,
            "account_status": self.account_status.value,
            "industry": self.industry,
            "created_at": (
                self.created_at.isoformat() if self.created_at else None
            ),
            "updated_at": (
                self.updated_at.isoformat() if self.updated_at else None
            ),
            "profile_image_url": self.profile_image_url,
        }

    def to_safe_dict(self, include_email=False, include_phone=False):
        """Return a safe dict (omits sensitive fields by default)."""
        data = {
            "id": self.id,
            "full_name": self.full_name,
            "role": self.role.value,
            "account_status": self.account_status.value,
            "industry": self.industry,
            "created_at": (
                self.created_at.isoformat() if self.created_at else None
            ),
            "updated_at": (
                self.updated_at.isoformat() if self.updated_at else None
            ),
            "profile_image_url": self.profile_image_url,
        }
        if include_email:
            data["email"] = self.email
        if include_phone:
            data["phone_number"] = self.phone_number
        return data

    documents = db.relationship("Document", back_populates="admin")
    services = db.relationship("Service", back_populates="admin")
    client_tickets = db.relationship(
        "Ticket",
        back_populates="client",
        foreign_keys="Ticket.client_id",
    )
    admin_tickets = db.relationship(
        "Ticket",
        back_populates="admin",
        foreign_keys="Ticket.admin_id",
    )
    invoices = db.relationship("Invoice", back_populates="client", lazy=True)
    ticket_messages = db.relationship("TicketMessage", back_populates="sender")
    tokens = db.relationship("Token", back_populates="user")
    comments = db.relationship("Comment", back_populates="client")
    blogs = db.relationship(
        "Blog", back_populates="admin", cascade="all, delete-orphan"
    )
    bookings = db.relationship(
        "Booking", back_populates="client", cascade="all, delete-orphan"
    )

    @staticmethod
    def validate_password(password: str):
        if not isinstance(password, str) or not password.strip():
            raise ValueError("Password is required")
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(ch.isupper() for ch in password):
            raise ValueError("Password must contain at least one uppercase")
        if not any(ch.isdigit() for ch in password):
            raise ValueError("Password must contain at least one digit")

    def set_password(self, password):
        self.validate_password(password)
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
    def validate_phone(self, _key, number):
        import phonenumbers
        try:
            parsed = (
                phonenumbers.parse(number, None)
                if number.startswith("+")
                else phonenumbers.parse(number, "KE")
            )
        except phonenumbers.NumberParseException as e:
            raise ValueError(str(e)) from e
        if not phonenumbers.is_valid_number(parsed):
            raise ValueError("Invalid phone number.")
        return phonenumbers.format_number(
            parsed, phonenumbers.PhoneNumberFormat.E164
        )

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
                f"Invalid role: {role}. Must be one of: "
                + f"{', '.join([r.value for r in Role])}"
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
                f"Invalid account status: {status}. Must be one of: "
                + f"{', '.join([s.value for s in AccountStatus])}"
            )

    @validates("profile_image_url")
    def validate_profile_image_url(self, key, url):
        if url:
            parsed = urlparse(url)
            if not all([parsed.scheme in ("http", "https"), parsed.netloc]):
                raise ValueError(
                    "Invalid profile image URL. "
                    "Must start with http:// or https://"
                )
            valid_exts = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
            path_ext = (
                parsed.path.lower().rsplit(".", 1)[-1]
                if "." in parsed.path
                else None
            )
            if not path_ext or f".{path_ext}" not in valid_exts:
                raise ValueError(
                    "Profile image must be a valid image file "
                    "(jpg, png, gif, webp)"
                )
        return url
