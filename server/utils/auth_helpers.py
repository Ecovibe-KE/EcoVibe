# utils/auth_helpers.py

from flask_jwt_extended import get_jwt_identity
from flask import current_app
from models.user import User


def get_current_user_and_role():
    """
    Helper function to get the current authenticated user and their role.
    Returns:
        (User, Role) if valid user is found, otherwise (None, None).
    """
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return None, None

        user = User.query.get(user_id)
        if not user:
            return None, None

        return user, user.role
    except Exception as e:
        current_app.logger.error(f"Error getting current user: {str(e)}")
        return None, None
