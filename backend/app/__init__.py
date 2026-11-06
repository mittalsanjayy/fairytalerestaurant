"""Fairytale Café & Restaurant API (application factory)."""

import logging

from flask import Flask
from werkzeug.middleware.proxy_fix import ProxyFix

from .config import Config
from .extensions import cors, db, limiter, migrate


def create_app(overrides: dict | None = None) -> Flask:
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(Config)
    if overrides:
        app.config.update(overrides)
    if not app.config.get("TESTING"):
        Config.validate()

    if not app.config.get("JWT_SECRET_KEY"):
        # Development convenience only (Config.validate() blocks this in production):
        # a random key per process, so admin sign-ins end whenever the server restarts.
        import secrets

        app.config["JWT_SECRET_KEY"] = secrets.token_hex(32)

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

    if app.config["TRUSTED_PROXY_COUNT"] > 0:
        n = app.config["TRUSTED_PROXY_COUNT"]
        app.wsgi_app = ProxyFix(app.wsgi_app, x_for=n, x_proto=n, x_host=n)

    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        max_age=600,
    )
    limiter.init_app(app)

    from . import models  # noqa: F401  (registers tables with SQLAlchemy)
    from .routes import register_routes
    from .utils.http import register_error_handlers

    register_routes(app)
    register_error_handlers(app)

    @app.after_request
    def security_headers(response):
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("Referrer-Policy", "no-referrer")
        response.headers.setdefault("Cache-Control", "no-store")
        return response

    @app.cli.command("init-db")
    def init_db_command():
        """Create all tables (Phase 4). Phase 5 moves to Flask-Migrate."""
        db.create_all()
        print("Database tables created.")

    return app
