from flask import Blueprint, jsonify

from ..models import MENU_CATEGORIES, MenuItem, Offer, Setting

bp = Blueprint("public", __name__)


@bp.get("/public/content")
def public_content():
    """Everything the owner manages that the public site displays. No private data."""
    items = (
        MenuItem.query.filter_by(is_available=True)
        .order_by(MenuItem.position, MenuItem.id).all()
    )
    menu = {c: [] for c in MENU_CATEGORIES}
    for i in items:
        menu.setdefault(i.category, []).append(
            {"name": i.name, "description": i.description or "", "price": i.price, "veg": i.veg}
        )
    offers = [
        {"title": o.title, "description": o.description, "terms": o.terms or ""}
        for o in Offer.query.filter_by(is_active=True).order_by(Offer.position, Offer.id).all()
    ]
    response = jsonify(menu=menu, offers=offers, hours=Setting.get("hours"))
    response.headers["Cache-Control"] = "public, max-age=60"  # edits appear within a minute
    return response
