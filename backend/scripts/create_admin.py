"""Create (or reset the password of) an admin account.

Run from backend/:   python scripts/create_admin.py
Reads ADMIN_EMAIL / ADMIN_PASSWORD from .env if set, otherwise asks interactively.
There is intentionally no default account.
"""

import getpass
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app  # noqa: E402
from app.auth.passwords import MIN_LENGTH, hash_password  # noqa: E402
from app.extensions import db  # noqa: E402
from app.models import AdminUser  # noqa: E402

email = (os.getenv("ADMIN_EMAIL") or input("Admin email: ")).strip().lower()
password = os.getenv("ADMIN_PASSWORD") or getpass.getpass(f"Password (min {MIN_LENGTH} characters): ")

if "@" not in email or len(password) < MIN_LENGTH:
    sys.exit(f"Need a valid email and a password of at least {MIN_LENGTH} characters.")

app = create_app()
with app.app_context():
    db.create_all()
    user = AdminUser.query.filter_by(email=email).first()
    if user:
        user.password_hash = hash_password(password)
        print(f"Password updated for {email}")
    else:
        db.session.add(AdminUser(email=email, password_hash=hash_password(password)))
        print(f"Admin created: {email}")
    db.session.commit()
