from datetime import date
from sqlalchemy.orm import validates
from . import db


class Services(db.Model):
    __tablename__ = "services"

    # --- Schema Columns ---
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    duration = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.Date, default=date.today, nullable=False)
    updated_at = db.Column(db.Date, onupdate=date.today)
    admin_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    currency = db.Column(db.String(10), nullable=False, default="KES")

    # --- Relationships ---
    invoices = db.relationship("Invoices", back_populates="service")
    bookings = db.relationship("Bookings", back_populates="service")
    admin = db.relationship("Users", back_populates="services")

    # --- Data Validations ---
    @validates("name", "description", "duration")
    def validate_not_empty(self, key, value):
        """Ensures that key text fields are not empty."""
        # .strip() removes whitespace from the beginning and end
        if not value or not value.strip():
            raise ValueError(f"{key.capitalize()} cannot be empty.")
        return value.strip()

    @validates("price")
    def validate_price(self, key, price_str):
        """
        Validates that the price string is a positive number,
        even though it's stored as text in the database.
        """
        if not price_str or not price_str.strip():
            raise ValueError("Price cannot be empty.")
        try:
            price_value = float(price_str)
            if price_value <= 0:
                raise ValueError("Price must be a positive number.")
        except (ValueError, TypeError):
            raise ValueError(f"Price must be a valid number, but got '{price_str}'.")
        return price_str.strip()

    # --- Serialization ---
    def to_dict(self):
        """Converts the model instance to a dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "duration": self.duration,
            "price": self.price,
            "admin_id": self.admin_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
