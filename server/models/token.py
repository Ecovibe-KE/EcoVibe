from . import db


class Token(db.Model):
    __tablename__ = "tokens"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True), nullable=False, default=db.func.now()
    )
    value = db.Column(db.String)
    # expiry_time = db.Column(db.DateTime)
    expiry_time = db.Column(db.DateTime(timezone=True), nullable=False)

    # --- Relationship ---
    user = db.relationship("User", back_populates="tokens")

    # --- Serialization ---
    def to_dict(self):
        """
        Convert the full Token model into a dictionary representation.
        Useful for internal logic or admin APIs where full data is needed.
        """
        return {
            "id": self.id,  # Primary key
            "user_id": self.user_id,
            "created_at": (
                self.created_at.isoformat() if self.created_at else None
            ),  # ISO timestamp for creation
            "value": self.value,
        }

    def __repr__(self):
        return f"<Tokens {self.id}, {self.user_id}, {
            self.created_at}, {self.value}, {self.expiry_time}>"
