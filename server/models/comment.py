from . import db


class Comment(db.Model):
    __tablename__ = "comments"

    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.Text, nullable=False)
    client_id = db.Column(db.Integer, nullable=False)
    blog_id = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime)

    # ---Relationships---
    blog = db.relationship("Blog", back_populates="comments")
    client = db.relationship("User", back_populates="comments")

    # ---Serializing---
    def to_dict(self):
        return {
            "id": self.id,
            "description": self.description,
            "client_id": self.client_id,
            "blog_id": self.blog_id,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    def __repr__(self):
        return f"<Comment: {self.id},{self.description},{self.client_id},{
            self.blog_id},{self.created_at},{self.updated_at}/>"
