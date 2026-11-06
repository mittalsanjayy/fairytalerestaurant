from datetime import datetime, timezone

from ..extensions import db

STATUSES = ("pending", "confirmed", "cancelled", "completed")


def _now():
    return datetime.now(timezone.utc)


class Reservation(db.Model):
    __tablename__ = "reservations"

    id = db.Column(db.Integer, primary_key=True)
    reference = db.Column(db.String(12), unique=True, nullable=False, index=True)
    name = db.Column(db.String(80), nullable=False)
    phone = db.Column(db.String(20), nullable=False, index=True)
    email = db.Column(db.String(254))
    date = db.Column(db.Date, nullable=False, index=True)
    time = db.Column(db.Time, nullable=False)
    guests = db.Column(db.Integer, nullable=False)
    occasion = db.Column(db.String(30))
    notes = db.Column(db.String(500))
    status = db.Column(db.String(12), nullable=False, default="pending", index=True)
    created_at = db.Column(db.DateTime, nullable=False, default=_now)

    def to_public(self) -> dict:
        """What the guest sees after booking. Never includes contact details."""
        return {
            "reference": self.reference,
            "name": self.name,
            "date": self.date.isoformat(),
            "time": self.time.strftime("%H:%M"),
            "guests": self.guests,
            "status": self.status,
        }

    def to_admin(self) -> dict:
        return {
            "id": self.id, "reference": self.reference, "name": self.name, "phone": self.phone,
            "email": self.email, "date": self.date.isoformat(), "time": self.time.strftime("%H:%M"),
            "guests": self.guests, "occasion": self.occasion, "notes": self.notes,
            "status": self.status, "created_at": self.created_at.isoformat(),
        }
