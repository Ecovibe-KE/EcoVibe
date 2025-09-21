import enum
from datetime import date, datetime
from sqlalchemy.orm import validates
from . import db


# Enum for booking_status
class BookingStatus(enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"


class Booking(db.Model):  # singular for consistency
    __tablename__ = "bookings"

    # --- Schema Columns ---
    id = db.Column(db.Integer, primary_key=True)
    booking_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.DateTime(timezone=True), nullable=False)
    end_time = db.Column(db.DateTime(timezone=True), nullable=False)
    status = db.Column(
        db.Enum(BookingStatus), nullable=False, default=BookingStatus.pending
    )
    client_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey("services.id"), nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        server_default=db.func.now(),
        nullable=False
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        onupdate=db.func.now()
    )

    # --- Relationships ---
    client = db.relationship("User", back_populates="bookings")
    service = db.relationship("Service", back_populates="bookings")

    # --- Data Validations ---
    @validates("booking_date")
    def validate_booking_date(self, key, booking_date_value):
        """
        Validate that the booking_date is not in the past.
        
        Parameters:
            key (str): Attribute name being validated (unused by logic, provided by SQLAlchemy).
            booking_date_value (date): The date to validate; must be >= today's date.
        
        Returns:
            date: The validated booking date.
        
        Raises:
            ValueError: If booking_date_value is earlier than today.
        """
        if booking_date_value < date.today():
            raise ValueError("Booking date cannot be in the past.")
        return booking_date_value

    @validates("end_time")
    def validate_end_time(self, key, end_time_value):
        """
        Validate that the booking end time is strictly after the booking start time.
        
        Parameters:
            key: The name of the attribute being validated (unused).
            end_time_value (datetime): Proposed end time (timezone-aware).
        
        Returns:
            datetime: The validated end time.
        
        Raises:
            ValueError: If a start time exists and `end_time_value` is less than or equal to it.
        """
        if self.start_time and end_time_value <= self.start_time:
            raise ValueError("End time must be after the start time.")
        return end_time_value

    # --- Serialization ---
    def to_dict(self):
        """
        Serialize the Booking model to a JSON-serializable dictionary.
        
        Returns a dictionary with the booking's fields suitable for JSON responses:
        - id (int)
        - booking_date (str|None): ISO 8601 date string, or None
        - start_time (str|None): ISO 8601 datetime with timezone, or None
        - end_time (str|None): ISO 8601 datetime with timezone, or None
        - status (str|None): enum value (e.g., "pending"), or None
        - client_id (int)
        - service_id (int)
        - created_at (str|None): ISO 8601 datetime with timezone, or None
        - updated_at (str|None): ISO 8601 datetime with timezone, or None
        """
        return {
            "id": self.id,
            "booking_date": self.booking_date.isoformat() if self.booking_date else None,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "status": self.status.value if self.status else None,
            "client_id": self.client_id,
            "service_id": self.service_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
