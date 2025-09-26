# utils/tokens.py
from datetime import datetime, timedelta, timezone
from models.token import Token
from models import db
import secrets


def create_refresh_token_for_user(user, days_valid=7):
    token_value = secrets.token_urlsafe(64)
    expiry = datetime.utcnow() + timedelta(days=days_valid)

    token = Token(user_id=user.id, value=token_value, expiry_time=expiry)

    db.session.add(token)
    db.session.commit()

    return token_value
