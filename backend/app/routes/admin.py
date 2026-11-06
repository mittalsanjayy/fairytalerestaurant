"""Owner dashboard API. Every route except login requires a valid admin token."""

from datetime import datetime, timezone

from flask import Blueprint, current_app, g, jsonify, request

from ..auth import admin_required, create_token, verify_password
from ..extensions import db, limiter
from ..models import (
    STATUSES, AdminUser, ContactMessage, MenuItem, Offer, Reservation, Setting,
)
from ..utils.admin_validation import clean_hours, clean_menu_item, clean_offer
from ..utils.http import get_json_object, json_error
from ..utils.validation import now_ist

bp = Blueprint("admin", __name__)


def _payload():
    return get_json_object()


# ---------------------------------------------------------------- auth
@bp.post("/auth/login")
@limiter.limit(lambda: current_app.config["RATELIMIT_LOGIN"])
def login():
    data = _payload() or {}
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    user = AdminUser.query.filter_by(email=email).first() if email else None
    if not verify_password(password, user.password_hash if user else None):
        return json_error("Incorrect email or password.", 401)  # same message for both cases
    user.last_login_at = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify(token=create_token(user.id), email=user.email)


@bp.get("/auth/me")
@admin_required
def me():
    return jsonify(email=g.admin.email)


# ---------------------------------------------------------------- overview
@bp.get("/overview")
@admin_required
def overview():
    today = now_ist().date()
    return jsonify(
        pending_reservations=Reservation.query.filter_by(status="pending").count(),
        today_reservations=Reservation.query.filter(
            Reservation.date == today, Reservation.status.in_(("pending", "confirmed"))
        ).count(),
        unread_messages=ContactMessage.query.filter_by(is_read=False).count(),
    )


# ---------------------------------------------------------------- reservations
@bp.get("/reservations")
@admin_required
def list_reservations():
    q = Reservation.query
    status = request.args.get("status")
    if status in STATUSES:
        q = q.filter_by(status=status)
    if request.args.get("upcoming") == "1":
        q = q.filter(Reservation.date >= now_ist().date())
    search = request.args.get("q", "").strip()
    if search:
        like = f"%{search}%"
        q = q.filter(db.or_(Reservation.name.ilike(like), Reservation.phone.like(like), Reservation.reference.ilike(like)))
    rows = q.order_by(Reservation.date.asc(), Reservation.time.asc()).limit(300).all()
    return jsonify(items=[r.to_admin() for r in rows])


@bp.patch("/reservations/<int:rid>")
@admin_required
def update_reservation(rid):
    row = db.session.get(Reservation, rid)
    if row is None:
        return json_error("Not found.", 404)
    status = (_payload() or {}).get("status")
    if status not in STATUSES:
        return json_error("Invalid status.", 422, {"status": f"Use one of: {', '.join(STATUSES)}."})
    row.status = status
    db.session.commit()
    return jsonify(item=row.to_admin())


# ---------------------------------------------------------------- messages
@bp.get("/messages")
@admin_required
def list_messages():
    q = ContactMessage.query
    if request.args.get("unread") == "1":
        q = q.filter_by(is_read=False)
    rows = q.order_by(ContactMessage.created_at.desc()).limit(300).all()
    return jsonify(items=[m.to_dict() for m in rows])


@bp.patch("/messages/<int:mid>")
@admin_required
def update_message(mid):
    row = db.session.get(ContactMessage, mid)
    if row is None:
        return json_error("Not found.", 404)
    flag = (_payload() or {}).get("is_read")
    if not isinstance(flag, bool):
        return json_error("is_read must be true or false.", 422)
    row.is_read = flag
    db.session.commit()
    return jsonify(item=row.to_dict())


@bp.delete("/messages/<int:mid>")
@admin_required
def delete_message(mid):
    row = db.session.get(ContactMessage, mid)
    if row is None:
        return json_error("Not found.", 404)
    db.session.delete(row)
    db.session.commit()
    return "", 204


# ---------------------------------------------------------------- menu & offers (same CRUD shape)
def _crud(rule, model, cleaner, *, order):
    name = model.__name__.lower()

    def list_():
        return jsonify(items=[r.to_dict() for r in model.query.order_by(*order).all()])

    def create():
        data, errors = cleaner(_payload() or {})
        if errors:
            return json_error("Please check the highlighted details.", 422, errors)
        last = db.session.query(db.func.max(model.position)).scalar()
        row = model(position=(last or 0) + 1, **data)
        db.session.add(row)
        db.session.commit()
        return jsonify(item=row.to_dict()), 201

    def update(rid):
        row = db.session.get(model, rid)
        if row is None:
            return json_error("Not found.", 404)
        data, errors = cleaner(_payload() or {})
        if errors:
            return json_error("Please check the highlighted details.", 422, errors)
        for k, v in data.items():
            setattr(row, k, v)
        db.session.commit()
        return jsonify(item=row.to_dict())

    def delete(rid):
        row = db.session.get(model, rid)
        if row is None:
            return json_error("Not found.", 404)
        db.session.delete(row)
        db.session.commit()
        return "", 204

    bp.add_url_rule(f"/{rule}", f"list_{name}", admin_required(list_), methods=["GET"])
    bp.add_url_rule(f"/{rule}", f"create_{name}", admin_required(create), methods=["POST"])
    bp.add_url_rule(f"/{rule}/<int:rid>", f"update_{name}", admin_required(update), methods=["PUT"])
    bp.add_url_rule(f"/{rule}/<int:rid>", f"delete_{name}", admin_required(delete), methods=["DELETE"])


_crud("menu-items", MenuItem, clean_menu_item, order=(MenuItem.category, MenuItem.position, MenuItem.id))
_crud("offers", Offer, clean_offer, order=(Offer.position, Offer.id))


# ---------------------------------------------------------------- hours
@bp.get("/hours")
@admin_required
def get_hours():
    return jsonify(hours=Setting.get("hours"))


@bp.put("/hours")
@admin_required
def put_hours():
    data, errors = clean_hours(_payload() or {})
    if errors:
        return json_error("Please check the highlighted days.", 422, errors)
    Setting.put("hours", data)
    db.session.commit()
    return jsonify(hours=data)
