"""Create the database tables.   Run from backend/:   python scripts/init_db.py"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app  # noqa: E402
from app.extensions import db  # noqa: E402

app = create_app()
with app.app_context():
    db.create_all()
    print("Database ready:", app.config["SQLALCHEMY_DATABASE_URI"].split("@")[-1])
