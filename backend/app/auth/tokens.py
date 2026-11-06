from datetime import datetime, timedelta, timezone

import jwt
from flask import current_app

ALGORITHM = "HS256"


def create_token(user_id: int) -> str:
    now = datetime.now(timezone.utc)
    hours = current_app.config["JWT_EXPIRES_HOURS"]
    payload = {"sub": str(user_id), "iat": now, "exp": now + timedelta(hours=hours), "typ": "admin"}
    return jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm=ALGORITHM)


def decode_token(token: str) -> int | None:
    """User id for a valid, unexpired admin token, else None."""
    try:
        data = jwt.decode(
            token, current_app.config["JWT_SECRET_KEY"], algorithms=[ALGORITHM],
            options={"require": ["exp", "sub"]},
        )
        return int(data["sub"]) if data.get("typ") == "admin" else None
    except (jwt.PyJWTError, ValueError):
        return None
