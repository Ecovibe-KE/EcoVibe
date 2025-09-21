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
        db.Enum(AccountStatus), nullable=False, default=AccountStatus.INACTIVE
    )
    created_at = db.Column(
    db.DateTime(timezone=True),
    default=lambda: datetime.now(timezone.utc),  # Python default
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
        """
        Password property getter that is intentionally write-only.
        
        Attempting to read this property always raises an AttributeError to prevent exposing plaintext passwords.
        Use the `set_password` method to set a password and `check_password` to verify one.
        
        Raises:
            AttributeError: Always raised to indicate the password is write-only.
        """
        raise AttributeError("Password is write-only.")

    @password.setter
    def password(self, password):
        """
        Setter for the write-only `password` property.
        
        Validates the provided plain-text password against the model's password policy and stores the resulting hash on the instance.
        
        Parameters:
            password (str): Plain-text password to validate and hash.
        """
        self.set_password(password)

    def __repr__(self):
        """
        Return an unambiguous developer-facing string representation of the User.
        
        The string includes the user's `id`, `full_name`, and `role` value in the format:
        "<User id={id} name={full_name} role={role}>".
        """
        return f"<User id={self.id} name={self.full_name} role={self.role.value}>"

    def to_dict(self):
        """
        Return a complete dictionary representation of the User, including sensitive fields.
        
        Returns a dict containing all stored User attributes suitable for internal use or admin APIs. The dictionary includes:
        - id (int)
        - full_name (str)
        - email (str) — sensitive
        - phone_number (str) — sensitive
        - role (str) — role name (e.g., "CLIENT", "ADMIN", "SUPER_ADMIN")
        - account_status (str) — status name (e.g., "ACTIVE", "SUSPENDED", "INACTIVE")
        - industry (str)
        - created_at (str|None) — ISO 8601 timestamp or None if not set
        - updated_at (str|None) — ISO 8601 timestamp or None if not set
        - profile_image_url (str|None)
        
        Note: This representation exposes sensitive fields (email, phone_number); only use where full access is appropriate.
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

    def to_safe_dict(self, include_email=False, include_phone=False):
        """
        Return a "safe" dictionary representation of the User suitable for public responses.
        
        By default this omits sensitive contact fields (email and phone_number). Set
        include_email and/or include_phone to True to include those fields.
        
        Parameters:
            include_email (bool): If True, include the user's email in the returned dict.
            include_phone (bool): If True, include the user's phone_number in the returned dict.
        
        Returns:
            dict: A mapping containing keys:
                - id (int)
                - full_name (str)
                - role (str): Role name (e.g., "CLIENT", "ADMIN").
                - account_status (str): Account status name (e.g., "ACTIVE").
                - industry (str)
                - created_at (str|None): ISO 8601 timestamp or None.
                - updated_at (str|None): ISO 8601 timestamp or None.
                - profile_image_url (str|None)
                - email (str) [optional]
                - phone_number (str) [optional]
        """
        data = {
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

        if include_email:
            data["email"] = self.email

        if include_phone:
            data["phone_number"] = self.phone_number

        return data

    documents = db.relationship("Document", back_populates="admin")
    services = db.relationship("Service", back_populates="admin")
    client_tickets = db.relationship(   "Ticket",back_populates="client",foreign_keys="Ticket.client_id")

    admin_tickets = db.relationship( "Ticket",back_populates="admin",foreign_keys="Ticket.admin_id")
    invoices = db.relationship("Invoice", back_populates="client", lazy=True)

    ticket_messages = db.relationship("TicketMessage", back_populates="sender")
    tokens = db.relationship("Token", back_populates="user")
    comments = db.relationship("Comment", back_populates="client")
    blogs = db.relationship("Blog", back_populates="admin", cascade="all, delete-orphan")
    bookings = db.relationship("Booking", back_populates="client", cascade="all, delete-orphan")



    @staticmethod
    def validate_password(password: str):
        """
        Validate that a plaintext password meets the application's strength policy.
        
        Checks:
        - non-empty string
        - minimum length 8
        - contains at least one uppercase letter
        - contains at least one digit
        
        Parameters:
            password (str): Plaintext password to validate.
        
        Raises:
            ValueError: If the password is empty or fails any policy check (message describes the specific violation).
        """
        if not isinstance(password, str) or not password.strip():
            raise ValueError("Password is required")
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(ch.isupper() for ch in password):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(ch.isdigit() for ch in password):
            raise ValueError("Password must contain at least one digit")

    def set_password(self, password):
        """
        Set the user's password after validating it and storing its secure hash.
        
        Validates the provided plaintext password against the model's password policy and stores a salted hash in the instance's `password_hash` field.
        
        Parameters:
            password (str): Plaintext password to validate and hash.
        
        Raises:
            ValueError: If the password does not meet validation requirements.
        """
        self.validate_password(password)
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """
        Return True if the provided plaintext password matches the stored password hash.
        
        Parameters:
            password (str): Plaintext password to verify against the user's stored hash.
        
        Returns:
            bool: True if the password matches the stored hash, False otherwise.
        """
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
        """
        Validate and normalize a phone number to E.164 format.
        
        Parses the provided number as an international number if it starts with '+', otherwise parses it using the Kenya ("KE") default region. Returns the normalized E.164 string (e.g. '+254712345678').
        
        Raises:
            ValueError: if the number cannot be parsed or is not a valid phone number.
        """
        import phonenumbers
        try:
            # If the number starts with "+", parse it as international
            if number.startswith("+"):
                parsed = phonenumbers.parse(number, None)
            else:
                # Default to Kenya region if it's a local number like 0712...
                parsed = phonenumbers.parse(number, "KE")
        except phonenumbers.NumberParseException as e:
            raise ValueError(str(e)) from e

        if not phonenumbers.is_valid_number(parsed):
            raise ValueError("Invalid phone number.")
        
        # Always store as E.164, e.g. +254712345678
        return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)


    @validates("full_name")
    def validate_name(self, key, name):
        """
        Validate that a user's full name is not empty or only whitespace.
        
        Parameters:
            key (str): attribute name being validated (unused).
            name (str): the full name value to validate.
        
        Returns:
            str: the original `name` if valid.
        
        Raises:
            ValueError: if `name` is empty or contains only whitespace.
        """
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
        """
        Validate and normalize a role value to the Role enum.
        
        Accepts either a Role enum member or a string name/value that can be converted to Role.
        Returns the corresponding Role enum. Raises ValueError if the role is empty or not one of the allowed Role values.
        Parameters:
            role: A Role member or a string representing a Role.
        Returns:
            Role: The validated Role enum member.
        Raises:
            ValueError: If `role` is empty or cannot be converted to a valid Role.
        """
        if not role:
            raise ValueError("Role cannot be empty")
        if isinstance(role, Role):
            return role
        try:
            return Role(role)
        except ValueError:
            raise ValueError(
                f"Invalid role: {role}. Must be one of:"
                + f"{', '.join([r.value for r in Role])}"
            )

    @validates("account_status")
    def validate_account_status(self, key, status):
        """
        Validate and normalize an account status value to an AccountStatus enum.
        
        If `status` is already an AccountStatus, it is returned unchanged. If `status` is a string matching
        one of the enum members, the corresponding AccountStatus is returned. Raises ValueError if `status`
        is empty or cannot be converted to a valid AccountStatus.
        
        Parameters:
            key: The mapped attribute name being validated (unused by this validator).
            status: The value to validate and convert to AccountStatus.
        
        Returns:
            AccountStatus: The validated enum member.
        
        Raises:
            ValueError: If `status` is empty or not a valid AccountStatus.
        """
        if not status:
            raise ValueError("Account status cannot be empty")
        if isinstance(status, AccountStatus):
            return status
        try:
            return AccountStatus(status)
        except ValueError:
            raise ValueError(
                f"Invalid account status: {status}. Must be one of:"
                + f"{', '.join([s.value for s in AccountStatus])}"
            )

    @validates("profile_image_url")
    def validate_profile_image_url(self, key, url):
        """
        Validate and normalize a profile image URL.
        
        Checks that a provided URL (if non-empty) uses http or https, has a network location, and points to a file with an allowed image extension (jpg, jpeg, png, gif, webp). Returns the original URL unchanged when valid.
        
        Parameters:
            key (str): Attribute/key name being validated (unused by this validator but kept for SQLAlchemy validator signature).
            url (str | None): The URL to validate. If falsy, it is returned unchanged.
        
        Returns:
            str | None: The validated URL (unchanged) or the original falsy value.
        
        Raises:
            ValueError: If the URL has an unsupported scheme or missing netloc, or if the path does not end with a permitted image file extension.
        """
        if url:
            parsed = urlparse(url)

            if not all([parsed.scheme in ("http", "https"), parsed.netloc]):
                raise ValueError(
                    "Invalid profile image URL. Must start with http:// or https://"
                )

            valid_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
            path_ext = (
                parsed.path.lower().rsplit(".", 1)[-1] if "." in parsed.path else None
            )
            if not path_ext or f".{path_ext}" not in valid_extensions:
                raise ValueError(
                    "Profile image must be a valid image file (jpg, png, gif, webp)"
                )
        return url
