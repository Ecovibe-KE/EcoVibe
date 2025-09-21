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

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    industry = db.Column(db.String(80), nullable=False)
    full_name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone_number = db.Column(db.String(20), unique=True, nullable=False)
    role = db.Column(db.Enum(Role), nullable=False, default=Role.CLIENT)
    profile_image_url = db.Column(db.String(200), nullable=True)
    account_status = db.Column(
        db.Enum(AccountStatus), nullable=False, default=AccountStatus.INACTIVE
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

    def __repr__(self):
        return f"<User id={self.id} name={self.full_name} role={self.role.value}>"

    def to_dict(self):
        """
        Convert the full User model into a dictionary representation.
        Includes sensitive fields like email and phone_number, so use carefully.
        Useful for internal logic or admin APIs where full data is needed.
        """
        return {
            "id": self.id,  # Primary key
            "full_name": self.full_name,  # User's full name
            "email": self.email,  # Email (sensitive, don’t expose to everyone)
            "phone_number": self.phone_number,  # Phone number (sensitive)
            "role": self.role.value,  # Role as string (client/admin/super_admin)
            "account_status": self.account_status.value,  # Account status as string
            "industry": self.industry,  # Industry field
            "created_at": (
                self.created_at.isoformat() if self.created_at else None
            ),  # ISO timestamp for creation
            "updated_at": (
                self.updated_at.isoformat() if self.updated_at else None
            ),  # ISO timestamp for last update
            "profile_image_url": self.profile_image_url,  # Profile picture URL
        }

    def to_safe_dict(self):
        """
        Convert the User model into a "safe" dictionary representation.
        Excludes sensitive fields like email and phone_number.
        Useful when returning user data to clients (e.g., public API responses).
        """
        return {
            "id": self.id,  # Primary key
            "full_name": self.full_name,  # User's full name
            "role": self.role.value,  # Role as string
            "account_status": self.account_status.value,  # Account status as string
            "industry": self.industry,  # Industry field
            "created_at": (
                self.created_at.isoformat() if self.created_at else None
            ),  # ISO timestamp for creation
            "updated_at": (
                self.updated_at.isoformat() if self.updated_at else None
            ),  # ISO timestamp for last update
            "profile_image_url": self.profile_image_url,  # Profile picture URL
        }

    documents = db.relationship("Document", back_populates="admin")
    services = db.relationship("Services", back_populates="admin", lazy=True)
    client_tickets = db.relationship(
        "Ticket", foreign_keys="Ticket.client_id", back_populates="client"
    )
    admin_tickets = db.relationship(
        "Ticket", foreign_keys="Ticket.assigned_admin_id", back_populates="admin"
    )
    invoices = db.relationship("Invoices", back_populates="client", lazy=True)
    ticket_messages = db.relationship("TicketMessage", back_populates="sender")
    tokens = db.relationship("Token", back_populates="user")
    comments = db.relationship("Comment", back_populates="client")
    blogs = db.relationship("Blog", back_populates="admin")
    bookings = db.relationship("Bookings", back_populates="client", lazy=True)

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
    def validate_phone(self, _key, number):
        import phonenumbers

        try:
            # We assume 'KE' as the default region.
            # For a production environment, it would be better to get the region
            # from the user's profile or the request context.
            parsed = phonenumbers.parse(number, "KE")
        except phonenumbers.NumberParseException as e:
            raise ValueError(str(e)) from e
        if not phonenumbers.is_valid_number(parsed):
            raise ValueError("Invalid phone number.")
        return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)

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
                f"Invalid role: {role}. Must be one of: {
                    ', '.join([r.value for r in Role])}"
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
                f"Invalid account status: {status}. Must be one of: {
                    ', '.join([s.value for s in AccountStatus])}"
            )

    @validates("profile_image_url")
    def validate_profile_image_url(self, key, url):
        if url:
            parsed = urlparse(url)
            if not all([parsed.scheme in ("http", "https"), parsed.netloc]):
                raise ValueError(
                    "Invalid profile image URL. Must start with http:// or https://"
                )
        return url
