import enum
from datetime import datetime, timezone
from sqlalchemy.orm import validates
from . import db


class BlogType(enum.Enum):
    ARTICLE = "article"
    NEWSLETTER = "newsletter"
    TUTORIAL = "tutorial"
    CASE_STUDY = "case_study"


class Blog(db.Model):
    __tablename__ = "blogs"

    id = db.Column(db.Integer, primary_key=True)
    date_created = db.Column(
        db.DateTime(timezone=True),
        server_default=db.func.now(),
        nullable=False
    )
    date_updated = db.Column(
        db.DateTime(timezone=True),
        onupdate=db.func.now()
    )
    title = db.Column(db.String(255), nullable=False)
    likes = db.Column(db.Integer, default=0)
    views = db.Column(db.Integer, default=0)
    image = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    author_name = db.Column(db.String(100), nullable=False)
    admin_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    reading_duration = db.Column(db.String(50), nullable=False)
    type = db.Column(db.Enum(BlogType), default=BlogType.ARTICLE, nullable=False)

    # --- Relationships ---
    admin = db.relationship("User", back_populates="blogs")  # FIXED
    comments = db.relationship("Comment", back_populates="blog")

    # --- Validations ---
    @validates("title", "category", "author_name", "reading_duration", "content", "image")
    def validate_not_empty(self, key, value):
        """
        Validate that a string field is not empty or only whitespace, stripping surrounding whitespace.
        
        This validator is intended for use with SQLAlchemy's @validates on string-like columns (e.g., title, category, author_name, reading_duration, content, image). It raises ValueError if the provided value is None, empty, or contains only whitespace, otherwise returns the value with surrounding whitespace removed.
        
        Parameters:
            key (str): Column/attribute name (used in the raised error message).
            value (str): The value to validate and clean.
        
        Returns:
            str: The trimmed value.
        
        Raises:
            ValueError: If the value is None, empty, or only whitespace.
        """
        if not value or not value.strip():
            raise ValueError(f"{key.replace('_', ' ').capitalize()} cannot be empty.")
        return value.strip()

    @validates("likes", "views")
    def validate_non_negative(self, key, value):
        """
        Validate that a numeric field value is not negative.
        
        Checks the provided value and raises ValueError if it is a negative number.
        Returns the original value when it is None or non-negative.
        
        Parameters:
            key (str): Name of the field being validated; used in the error message.
            value (int | float | None): The numeric value to validate.
        
        Returns:
            int | float | None: The original value if valid.
        
        Raises:
            ValueError: If `value` is not None and is negative.
        """
        if value is not None and value < 0:
            raise ValueError(f"{key.capitalize()} cannot be negative.")
        return value

    # --- Serialization ---
    def to_dict(self):
        """
        Return a JSON-serializable dictionary representation of the Blog instance.
        
        The returned dictionary includes primary fields and metadata suitable for API responses:
        - id: int
        - date_created: ISO 8601 timestamp string or None
        - date_updated: ISO 8601 timestamp string or None
        - title: str
        - likes: int
        - views: int
        - image: str
        - category: str
        - author_name: str
        - admin_id: int
        - content: str
        - reading_duration: str
        - type: blog type as a lowercase string (from BlogType) or None
        
        Datetime fields are represented as ISO 8601 strings. The `type` field uses the enum value (e.g., "article").
        """
        return {
            "id": self.id,
            "date_created": self.date_created.isoformat() if self.date_created else None,
            "date_updated": self.date_updated.isoformat() if self.date_updated else None,
            "title": self.title,
            "likes": self.likes,
            "views": self.views,
            "image": self.image,
            "category": self.category,
            "author_name": self.author_name,
            "admin_id": self.admin_id,
            "content": self.content,
            "reading_duration": self.reading_duration,
            "type": self.type.value if self.type else None,
        }

    def __repr__(self):
        return f"<Blog id={self.id} title='{self.title}'>"
