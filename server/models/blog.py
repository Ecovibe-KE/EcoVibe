import enum
from datetime import datetime, timezone
import os
from sqlalchemy.orm import validates
from . import db
import base64

SERVER_HOST = os.getenv("FLASK_SERVER_URL", "http://localhost:5000").rstrip("/")


class BlogType(enum.Enum):
    ARTICLE = "article"
    NEWSLETTER = "newsletter"
    TUTORIAL = "tutorial"
    CASE_STUDY = "case_study"


class BlogStatus(enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class Blog(db.Model):
    __tablename__ = "blogs"

    id = db.Column(db.Integer, primary_key=True)
    date_created = db.Column(
        db.DateTime(timezone=True),
        server_default=db.func.now(),
        nullable=False,
    )
    date_updated = db.Column(
        db.DateTime(timezone=True),
        onupdate=db.func.now(),
    )
    title = db.Column(db.String(255), nullable=False)
    likes = db.Column(db.Integer, default=0)
    views = db.Column(db.Integer, default=0)
    image = db.Column(db.LargeBinary, nullable=False)  # Storing image as binary
    image_content_type = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    author_name = db.Column(db.String(100), nullable=False)
    admin_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
    )
    content = db.Column(db.Text, nullable=False)
    reading_duration = db.Column(db.String(50), nullable=False)
    type = db.Column(
        db.Enum(BlogType),
        default=BlogType.ARTICLE,
        nullable=False,
    )

    # --- Relationships ---
    admin = db.relationship("User", back_populates="blogs")
    comments = db.relationship("Comment", back_populates="blog")

    # --- Validations ---
    @validates(
        "title",
        "category",
        "author_name",
        "reading_duration",
        "content",
        "image",
        "image_content_type",
    )
    def validate_not_empty(self, key, value):
        """
        Validate that a string field is not empty or only whitespace,
        stripping surrounding whitespace.

        This validator is intended for use with SQLAlchemy's @validates
        on string-like columns (e.g., title, category, author_name,
        reading_duration, content, image). It raises ValueError if the
        provided value is None, empty, or contains only whitespace,
        otherwise returns the value with surrounding whitespace removed.
        """
        if not value or not value.strip():
            raise ValueError(f"{key.replace('_', ' ').capitalize()} cannot be empty.")

        if key == "image_content_type":
            allowed_types = ["image/jpeg", "image/png", "image/jpg"]
            if value not in allowed_types:
                allowed_str = ", ".join(allowed_types)
                msg = f"Invalid image content type. Allowed types are: {allowed_str}"
                raise ValueError(msg)

        return value.strip()

    @validates("likes", "views")
    def validate_non_negative(self, key, value):
        """
        Validate that a numeric field value is not negative.
        """
        if value is not None and value < 0:
            raise ValueError(f"{key.capitalize()} cannot be negative.")
        return value

    # --- Serialization ---
    def to_dict(self):
        """
        Return a JSON-serializable dictionary representation of the Blog.
        """

        return {
            "id": self.id,
            "date_created": (
                self.date_created.isoformat() if self.date_created else None
            ),
            "date_updated": (
                self.date_updated.isoformat() if self.date_updated else None
            ),
            "title": self.title,
            "likes": self.likes,
            "views": self.views,
            "category": self.category,
            "author_name": self.author_name,
            "image": f"{SERVER_HOST}/blogs/image/{self.id}",
            "admin_id": self.admin_id,
            "content": self.content,
            "reading_duration": self.reading_duration,
            "type": self.type.value if self.type else None,
        }

    def __repr__(self):
        return f"<Blog id={self.id} title='{self.title}'>"
