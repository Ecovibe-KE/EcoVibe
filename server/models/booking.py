import enum
from datetime import date, datetime, timedelta, timezone
from sqlalchemy.orm import validates
from . import db


class BookingStatus(enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"


class Booking(db.Model):
    __tablename__ = "bookings"

    # --- Schema Columns ---
    id = db.Column(db.Integer, primary_key=True)
    booking_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.DateTime(timezone=True), nullable=False)
    end_time = db.Column(db.DateTime(timezone=True), nullable=False)
    status = db.Column(
        db.Enum(BookingStatus),
        nullable=False,
        default=BookingStatus.pending,
    )
    client_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
    )
    service_id = db.Column(
        db.Integer,
        db.ForeignKey("services.id"),
        nullable=False,
    )
    created_at = db.Column(
        db.DateTime(timezone=True),
        server_default=db.func.now(),
        nullable=False,
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        onupdate=db.func.now(),
    )
    is_deleted = db.Column(db.Boolean, default=False, nullable=False)

    # --- Relationships ---
    client = db.relationship("User", back_populates="bookings")
    service = db.relationship("Service", back_populates="bookings")

    # --- Data Validations ---
    @validates("start_time")
    def validate_start_time(self, key, start_time_value):
        """Ensure start_time is not in the past."""
        # Normalize the incoming datetime to be timezone-aware
        if start_time_value.tzinfo is None:
            # If naive datetime, assume UTC
            start_time_value = start_time_value.replace(tzinfo=timezone.utc)
        
        # Compare against current UTC time
        if start_time_value < datetime.now(timezone.utc):
            raise ValueError("Start time cannot be in the past.")
        
        # Return the normalized timezone-aware datetime
        return start_time_value

    @validates("end_time")
    def validate_end_time(self, key, end_time_value):
        """Ensure end_time is strictly after start_time."""
        if self.start_time and end_time_value <= self.start_time:
            raise ValueError("End time must be after the start time.")
        return end_time_value

    # --- Serialization ---
    def to_dict(self):
        """Serialize the Booking model to a dictionary."""
        return {
            "id": self.id,
            "booking_date": (
                self.booking_date.isoformat() if self.booking_date else None
            ),
            "start_time": (self.start_time.isoformat() if self.start_time else None),
            "end_time": (self.end_time.isoformat() if self.end_time else None),
            "status": self.status.value if self.status else None,
            "client_id": self.client_id,
            "client_name": self.client.full_name if self.client else None,
            "service_id": self.service_id,
            "service_name": self.service.title if self.service else None,
            "service_duration": self.service.duration if self.service else None,
            "created_at": (self.created_at.isoformat() if self.created_at else None),
            "updated_at": (self.updated_at.isoformat() if self.updated_at else None),
        }