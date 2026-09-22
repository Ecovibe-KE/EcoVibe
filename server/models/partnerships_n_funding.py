import os

from . import db
from enum import Enum
from sqlalchemy.orm import validates


SERVER_HOST = os.getenv("FLASK_SERVER_URL", "http://localhost:5000").rstrip("/")
api_endpoint = os.getenv("FLASK_API", "/api").rstrip("/")


class partnershipType(Enum):
    funding = "Funding"
    partnership = "Partnership"


class partnershipStatus(Enum):
    draft = "Draft"
    pending = "Pending"
    published = "Published"
    rejected = "Rejected"
    archived = "Archived"


class partmenership_n_funding(db.Model):
    __tablename__ = "partnerships_n_funding"

    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(db.String(255), nullable=False)

    type = db.Column(db.Enum(partnershipType), nullable=False)

    description = db.Column(db.Text, nullable=False)

    image = db.Column(db.LargeBinary, nullable=False)

    image_content_type = db.Column(db.String(50), nullable=False)

    launch_date = db.Column(db.DateTime, nullable=False)

    deadline_date = db.Column(db.DateTime, nullable=False)

    status = db.Column(
        db.Enum(partnershipStatus), nullable=False, default=partnershipStatus.draft
    )

    created_at = db.Column(
        db.DateTime, default=db.func.current_timestamp(), nullable=False
    )

    updated_at = db.Column(
        db.DateTime,
        default=db.func.current_timestamp(),
        onupdate=db.func.current_timestamp(),
        nullable=False,
    )

    @validates("title", "type", "description", "status")
    def validate_not_empty(self, key, value):

        if value is None:
            raise ValueError(f"{key} cannot be null")

        if isinstance(value, str) and not value.strip():
            raise ValueError(f"{key} cannot be empty")

        return value

    @validates("launch_date", "deadline_date")
    def validate_timeline(self, key, value):

        if value is None:
            raise ValueError(f"{key} cannot be null")

        launch = value if key == "launch_date" else self.launch_date

        deadline = value if key == "deadline_date" else self.deadline_date

        if launch and deadline and launch > deadline:
            raise ValueError("Launch date cannot be after deadline date")

        return value

    @validates("image")
    def validate_image_size(self, key, value):
        """Validate image data and size."""

        if not value:
            raise ValueError("Image cannot be empty")

        max_size = 5 * 1024 * 1024
        if len(value) > max_size:
            raise ValueError("Image size must be less than 5MB")

        return value

    @validates("image_content_type")
    def validate_image_content_type(self, key, value):

        if not value or not value.strip():
            raise ValueError("Image content type cannot be empty")

        return value

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "type": self.type.value,
            "description": self.description,
            "image": (
                f"{SERVER_HOST}{api_endpoint}" f"/partnerships/image/{self.id}"
                if self.image
                else None
            ),
            "launch_date": self.launch_date.isoformat(),
            "deadline_date": self.deadline_date.isoformat(),
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
