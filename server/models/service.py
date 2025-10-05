from datetime import date
import enum
import base64
from sqlalchemy.orm import validates
from . import db


class ServiceStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class Service(db.Model):
    __tablename__ = "services"

    # ---- Schema Columns ----
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    currency = db.Column(db.String(10), nullable=False, default="KES")
    price = db.Column(
        db.Float,
        nullable=False,
    )
    duration = db.Column(db.String(50), nullable=False)
    image = db.Column(db.LargeBinary, nullable=False)  # Storing image as binary
    status = db.Column(db.Enum(ServiceStatus), nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        server_default=db.func.now(),
        nullable=False,
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        onupdate=db.func.now(),
    )
    admin_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
    )

    # --- Relationships ---
    invoices = db.relationship("Invoice", back_populates="service")
    bookings = db.relationship("Booking", back_populates="service")
    admin = db.relationship(
        "User",
        foreign_keys=[admin_id],
        back_populates="services",
    )

    def __repr__(self):
        return f"<Service {self.title}>"

    # --- Data Validations ---
    @validates(
        "title", "description", "duration", "currency", "image", "status", "admin_id"
    )
    def validate_not_empty(self, key, value):
        """Ensures that key text fields are not empty."""
        if not value or (isinstance(value, str) and not value.strip()):
            raise ValueError(f"{key.capitalize()} cannot be empty.")
        return value.strip() if isinstance(value, str) else value

    @validates("price")
    def validate_price(self, key, value):
        """
        Validates that the price is a positive number,
        """
        if value < 0:
            raise ValueError(f"{key.capitalize()} cannot be negative.")
        return value

    # --- Serialization ---
    def to_dict(self):
        """
        Return a dictionary representation of the Service model.

        Includes scalar fields (id, title, description, duration, price,
        admin_id, currency) and timestamp fields `created_at` / `updated_at`
        converted to ISO 8601 strings or None when not set.
        Converts image from binary to base64 string.
        """
        # Convert binary image to base64
        image_base64 = None
        if self.image:
            try:
                image_base64 = "data:image/png;base64," + base64.b64encode(
                    self.image
                ).decode("utf-8")
            except Exception as e:

                print(f"Error encoding image to base64: {e}")

        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "currency": self.currency,
            "price": self.price,
            "duration": self.duration,
            "image": image_base64,  # Now returns base64 string instead of binary
            "status": self.status.value if self.status else None,
            "admin_id": self.admin_id,
            "created_at": (self.created_at.isoformat() if self.created_at else None),
            "updated_at": (self.updated_at.isoformat() if self.updated_at else None),
        }