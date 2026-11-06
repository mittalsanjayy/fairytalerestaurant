from functools import wraps

from flask import g, request

from ..extensions import db
from ..models import AdminUser
from ..utils.http import json_error
from .tokens import decode_token


def admin_required(view):
    """Require `Authorization: Bearer <token>` from an existing admin. Sets g.admin."""

    @wraps(view)
    def wrapper(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        token = header[7:].strip() if header.lower().startswith("bearer ") else ""
        user_id = decode_token(token) if token else None
        user = db.session.get(AdminUser, user_id) if user_id else None
        if user is None:
            return json_error("Please sign in.", 401)
        g.admin = user
        return view(*args, **kwargs)

    return wrapper
