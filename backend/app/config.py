"""Application configuration, read from environment variables (see .env.example)."""

import os
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

_INSECURE_KEYS = {"", "change-me", "change-me-too"}


def _normalise_db_url(url: str) -> str:
    # Some hosts still hand out the legacy "postgres://" scheme, which SQLAlchemy rejects.
    if url.startswith("postgres://"):
        return "postgresql+psycopg2://" + url[len("postgres://"):]
    if url.startswith("postgresql://"):
        return "postgresql+psycopg2://" + url[len("postgresql://"):]
    return url


def _int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


class Config:
    ENV = os.getenv("FLASK_ENV", "development")
    SECRET_KEY = os.getenv("SECRET_KEY", "")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "")

    SQLALCHEMY_DATABASE_URI = _normalise_db_url(os.getenv("DATABASE_URL", "sqlite:///fairytale.db"))
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]

    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")
    MAX_UPLOAD_MB = _int("MAX_UPLOAD_MB", 8)
    MAX_CONTENT_LENGTH = MAX_UPLOAD_MB * 1024 * 1024

    JWT_EXPIRES_HOURS = _int("JWT_EXPIRES_HOURS", 8)
    RATELIMIT_LOGIN = os.getenv("RATELIMIT_LOGIN", "5 per minute;30 per hour")

    # --- Rate limiting (per client IP). Use Redis in production: redis://host:6379/0
    RATELIMIT_ENABLED = os.getenv("RATELIMIT_ENABLED", "true").lower() != "false"
    RATELIMIT_STORAGE_URI = os.getenv("RATELIMIT_STORAGE_URI", "memory://")
    RATELIMIT_RESERVATIONS = os.getenv("RATELIMIT_RESERVATIONS", "6 per hour;20 per day")
    RATELIMIT_CONTACT = os.getenv("RATELIMIT_CONTACT", "6 per hour;20 per day")
    # How many reverse proxies sit in front of Flask (0 = none). Needed for correct client IPs.
    TRUSTED_PROXY_COUNT = _int("TRUSTED_PROXY_COUNT", 0)

    # --- Booking rules. Operating hours are deliberately NOT enforced: they are business data
    # that arrives with the admin dashboard (Phase 5). Every request is "pending" until the
    # restaurant confirms it.
    MAX_PARTY_SIZE = _int("MAX_PARTY_SIZE", 20)
    MAX_ADVANCE_DAYS = _int("MAX_ADVANCE_DAYS", 90)
    MIN_LEAD_MINUTES = _int("MIN_LEAD_MINUTES", 30)

    # --- Owner notification by email (optional). Leave SMTP_HOST empty to only log + store.
    NOTIFY_EMAIL = os.getenv("NOTIFY_EMAIL", "")
    SMTP_HOST = os.getenv("SMTP_HOST", "")
    SMTP_PORT = _int("SMTP_PORT", 587)
    SMTP_USER = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM = os.getenv("SMTP_FROM", "")
    SMTP_USE_SSL = os.getenv("SMTP_USE_SSL", "false").lower() == "true"  # true = port 465 (implicit TLS)

    TESTING = False

    @classmethod
    def validate(cls) -> None:
        """Refuse to boot a production server with placeholder secrets."""
        if cls.ENV == "production":
            if cls.SECRET_KEY in _INSECURE_KEYS or cls.JWT_SECRET_KEY in _INSECURE_KEYS:
                raise RuntimeError("Set strong SECRET_KEY and JWT_SECRET_KEY before running in production.")
            if cls.RATELIMIT_ENABLED and cls.RATELIMIT_STORAGE_URI.startswith("memory://"):
                # Not fatal (single-process deployments are fine) but worth knowing about.
                import logging

                logging.getLogger(__name__).warning(
                    "Rate limits are stored in memory; use RATELIMIT_STORAGE_URI=redis://... with several workers."
                )
