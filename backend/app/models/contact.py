from datetime import datetime, timezone

from ..extensions import db


def _now():
    return datetime.now(timezone.utc)


class ContactMessage(db.Model):
    __tablename__ = "contact_messages"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    phone = db.Column(db.String(20))
    email = db.Column(db.String(254))
    message = db.Column(db.String(1500), nullable=False)
    is_read = db.Column(db.Boolean, nullable=False, default=False, index=True)
    created_at = db.Column(db.DateTime, nullable=False, default=_now)

    def to_dict(self) -> dict:
        return {
            "id": self.id, "name": self.name, "phone": self.phone, "email": self.email,
            "message": self.message, "is_read": self.is_read, "created_at": self.created_at.isoformat(),
        }
