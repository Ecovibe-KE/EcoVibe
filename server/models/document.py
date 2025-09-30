from datetime import timezone, datetime
from sqlalchemy.orm import validates
from .user import Role, User
from . import db


class Document(db.Model):
    __tablename__ = "documents"

    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(1000), nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    file_data = db.Column(db.LargeBinary, nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    mimetype = db.Column(db.String(100), nullable=False)

    admin = db.relationship("User", back_populates="documents")

    def __repr__(self):
        return (
            f"<Document id={self.id} admin_id={self.admin_id} filename={self.filename}>"
        )

    def to_dict(self):
        return {
            "id": self.id,
            "admin_id": self.admin_id,
            "title": self.title,
            "description": self.description,
            "filename": self.filename,
            "mimetype": self.mimetype,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    @validates("admin_id")
    def validate_admin_id(self, key, admin_id):
        if admin_id is None:
            raise ValueError("Admin ID is required.")
        admin_user = User.query.get(admin_id)
        if not admin_user:
            raise ValueError(f"Admin ID {admin_id} is not valid.")
        if admin_user.role not in [Role.ADMIN, Role.SUPER_ADMIN]:
            raise ValueError(f"User with ID {admin_id} is not an admin.")
        return admin_id
