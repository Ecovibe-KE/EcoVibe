from . import db
from datetime import datetime, timezone


class Comment(db.Model):
    __tablename__ = "comments"

    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.Text, nullable=False)
    client_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    blog_id = db.Column(db.Integer, db.ForeignKey("blogs.id"), nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        server_default=db.func.now(),
        nullable=False,
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        onupdate=db.func.now()
    )

    # --- Relationships ---
    blog = db.relationship("Blog", back_populates="comments")
    client = db.relationship("User", back_populates="comments")

    # --- Serialization ---
    def to_dict(self):
        """
        Return a JSON-serializable dictionary representation of the Comment.
        
        The dictionary contains the comment's id, description, client_id, blog_id, and timestamps.
        Timestamps (created_at and updated_at) are returned as ISO 8601-formatted strings when present, otherwise None.
        
        Returns:
            dict: {
                "id": int,
                "description": str,
                "client_id": int,
                "blog_id": int,
                "created_at": str | None,
                "updated_at": str | None
            }
        """
        return {
            "id": self.id,
            "description": self.description,
            "client_id": self.client_id,
            "blog_id": self.blog_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        """
        Return a compact developer-facing string representation of the Comment.
        
        The representation includes the comment's id, client_id, and blog_id in the format:
        "<Comment id=<id> client_id=<client_id> blog_id=<blog_id>>".
        
        Returns:
            str: Compact identifier-only representation suitable for debugging.
        """
        return f"<Comment id={self.id} client_id={self.client_id} blog_id={self.blog_id}>"
