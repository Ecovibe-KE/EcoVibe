from . import db
from datetime import datetime, timezone


class Comment(db.Model):
    __tablename__ = "comments"

    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.Text, nullable=False)
    client_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
    )
    blog_id = db.Column(
        db.Integer,
        db.ForeignKey("blogs.id"),
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

    # --- Relationships ---
    blog = db.relationship("Blog", back_populates="comments")
    client = db.relationship("User", back_populates="comments")

    # --- Serialization ---
    def to_dict(self):
        """
        Return a JSON-serializable dictionary representation of the Comment.
        """
        return {
            "id": self.id,
            "description": self.description,
            "client_id": self.client_id,
            "blog_id": self.blog_id,
            "created_at": (
                self.created_at.isoformat() if self.created_at else None
            ),
            "updated_at": (
                self.updated_at.isoformat() if self.updated_at else None
            ),
        }

    def __repr__(self):
        """
        Return a compact developer-facing string representation of the Comment.
        """
        return (
            f"<Comment id={self.id} client_id={self.client_id} "
            f"blog_id={self.blog_id}>"
        )
