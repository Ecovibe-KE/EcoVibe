from . import db
from datetime import timezone, datetime
from sqlalchemy.orm import validates
import re


class NewsletterSubscriber(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(254), unique=True, nullable=False)
    subscription_date = db.Column(
    db.DateTime(timezone=True),
    server_default=db.func.now(),
    nullable=False,
     )


    @validates("email")
    def validate_and_normalize_email(self, key, email_address):
        """
        Validate and normalize an email address for storage.
        
        Checks that email_address is non-empty and matches a basic email pattern, then returns a lowercased version for consistent storage and uniqueness checks.
        
        Parameters:
            key (str): ORM attribute name (unused by this validator).
            email_address (str): The email address to validate and normalize.
        
        Returns:
            str: The normalized (lowercased) email address.
        
        Raises:
            ValueError: If email_address is empty or does not match a valid email format.
        """
        if not email_address:
            raise ValueError("Email address cannot be empty.")

        # Use a regular expression for basic email format validation.
        if not re.match(
            r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", email_address
        ):
            raise ValueError(f"'{email_address}' is not a valid email address format.")

        # Normalize the email to lowercase. This is crucial for the 'unique'
        # constraint to work correctly regardless of casing (e.g., preventing
        # 'user@example.com' and 'User@example.com' from being separate entries).
        return email_address.lower()

    def to_dict(self):
        """Return a dictionary representation of the model."""
        # Simplified date formatting as the field is non-nullable.
        return {
            "id": self.id,
            "email": self.email,
            "subscription_date": self.subscription_date.isoformat(),
        }
