import enum
from datetime import date
from sqlalchemy.orm import validates
from . import db


# Define an Enum for the 'type' column to ensure consistent values
class BlogType(enum.Enum):
    ARTICLE = "article"
    NEWSLETTER = "newsletter"
    TUTORIAL = "tutorial"
    CASE_STUDY = "case_study"


class Blog(db.Model):
    __tablename__ = "blogs"

    # --- Schema Columns ---
    id = db.Column(db.Integer, primary_key=True)
    date_created = db.Column(db.Date, default=date.today, nullable=False)
    date_updated = db.Column(db.Date, onupdate=date.today)
    title = db.Column(db.String(255), nullable=False)
    likes = db.Column(db.Integer, default=0)
    views = db.Column(db.Integer, default=0)
    image = db.Column(db.String(255), nullable=False)  # For URL or file path
    category = db.Column(db.String(100), nullable=False)
    author_name = db.Column(db.String(100), nullable=False)
    admin_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    content = db.Column(
        db.Text, nullable=False
    )  # Switched to Text for long-form content
    reading_duration = db.Column(db.String(50), nullable=False)
    type = db.Column(db.Enum(BlogType), default=BlogType.ARTICLE, nullable=False)

    # --- Relationships ---
    # This assumes you have an 'Admin' model with a 'blogs' back-populating relationship
    admin = db.relationship("User", back_populates="blogs")
    comments = db.relationship("Comment", back_populates="blog")

    # --- Validations ---
    @validates(
        "title", "category", "author_name", "reading_duration", "content", "image"
    )
    def validate_not_empty(self, key, value):
        """Ensures that essential text fields are not empty or just whitespace."""
        if not value or not value.strip():
            raise ValueError(f"{key.replace('_', ' ').capitalize()} cannot be empty.")
        return value.strip()

    @validates("likes", "views")
    def validate_non_negative(self, key, value):
        """Ensures that counters like 'likes' and 'views' are not negative."""
        if value is not None and value < 0:
            raise ValueError(f"{key.capitalize()} cannot be a negative number.")
        return value

    # --- Serialization ---
    def to_dict(self):
        """Converts the blog post object into a JSON-friendly dictionary."""
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
