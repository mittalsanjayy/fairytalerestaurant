import secrets

from flask import Blueprint, current_app, jsonify
from sqlalchemy.exc import IntegrityError

from ..extensions import db, limiter
from ..models import Reservation
from ..services.notify import notify_owner
from ..utils.http import get_json_object, json_error
from ..utils.validation import clean_reservation

bp = Blueprint("reservations", __name__)

# No 0/O/1/I/L so a reference is easy to read out over the phone.
_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"


def _new_reference() -> str:
    return "FT-" + "".join(secrets.choice(_ALPHABET) for _ in range(6))


@bp.post("/reservations")
@limiter.limit(lambda: current_app.config["RATELIMIT_RESERVATIONS"])
def create_reservation():
    payload = get_json_object()
    if payload is None:
        return json_error("Please send the booking details as JSON.", 400)

    # Honeypot: real guests never see or fill this field. Pretend success so bots learn nothing.
    if str(payload.get("website", "")).strip():
        return jsonify(message="Request received.", reservation={"reference": "FT-000000", "status": "pending"}), 201

    cfg = current_app.config
    data, errors = clean_reservation(
        payload,
        max_party=cfg["MAX_PARTY_SIZE"],
        max_advance_days=cfg["MAX_ADVANCE_DAYS"],
        min_lead_minutes=cfg["MIN_LEAD_MINUTES"],
    )
    if errors:
        return json_error("Please check the highlighted details.", 422, errors)

    # Double-click / retry protection: an identical pending request returns the original.
    existing = Reservation.query.filter_by(
        phone=data["phone"], date=data["date"], time=data["time"], status="pending"
    ).first()
    if existing:
        return jsonify(message="We already have this request.", reservation=existing.to_public()), 200

    reservation = None
    for _ in range(5):  # reference collisions are astronomically unlikely, but handle them anyway
        reservation = Reservation(reference=_new_reference(), **data)
        db.session.add(reservation)
        try:
            db.session.commit()
            break
        except IntegrityError:
            db.session.rollback()
            reservation = None
    if reservation is None:
        return json_error("We couldn’t save your request. Please try again, or call us.", 500)

    notify_owner(
        subject=f"New table request {reservation.reference}: {data['guests']} guests, {data['date']:%d %b} {data['time']:%H:%M}",
        body=(
            f"Reference: {reservation.reference}\n"
            f"Name: {data['name']}\nPhone: {data['phone']}\nEmail: {data['email'] or '-'}\n"
            f"Date: {data['date']:%A, %d %B %Y}\nTime: {data['time']:%H:%M}\nGuests: {data['guests']}\n"
            f"Occasion: {data['occasion'] or '-'}\nNotes: {data['notes'] or '-'}\n\n"
            "Status: pending. Please confirm with the guest."
        ),
        reply_to=data["email"],
    )

    return (
        jsonify(
            message="Your table request has been received. We’ll confirm with you shortly.",
            reservation=reservation.to_public(),
        ),
        201,
    )
