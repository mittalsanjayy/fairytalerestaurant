def register_routes(app):
    from .admin import bp as admin_bp
    from .contact import bp as contact_bp
    from .health import bp as health_bp
    from .public import bp as public_bp
    from .reservations import bp as reservations_bp

    for bp in (health_bp, reservations_bp, contact_bp, public_bp):
        app.register_blueprint(bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
