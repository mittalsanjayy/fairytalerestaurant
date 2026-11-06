from flask import Blueprint, current_app, jsonify

from ..extensions import db, limiter
from ..models import ContactMessage
from ..services.notify import notify_owner
from ..utils.http import get_json_object, json_error
from ..utils.validation import clean_contact

bp = Blueprint("contact", __name__)


@bp.post("/contact")
@limiter.limit(lambda: current_app.config["RATELIMIT_CONTACT"])
def create_contact_message():
    payload = get_json_object()
    if payload is None:
        return json_error("Please send your message as JSON.", 400)

    if str(payload.get("website", "")).strip():  # honeypot
        return jsonify(message="Message received."), 201

    data, errors = clean_contact(payload)
    if errors:
        return json_error("Please check the highlighted details.", 422, errors)

    db.session.add(ContactMessage(**data))
    db.session.commit()

    notify_owner(
        subject=f"New message from {data['name']}",
        body=f"Name: {data['name']}\nPhone: {data['phone'] or '-'}\nEmail: {data['email'] or '-'}\n\n{data['message']}",
        reply_to=data["email"],
    )
    return jsonify(message="Thank you. We’ve received your message and will get back to you soon."), 201
