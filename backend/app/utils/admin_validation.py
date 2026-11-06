"""Validation for admin-managed content. Same contract as validation.py: (data, errors)."""

import re

from ..models.content import MENU_CATEGORIES, WEEKDAYS
from .validation import clean_text

_HHMM = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


def _bool_or_none(value):
    if value is None or value == "":
        return None, False
    if isinstance(value, bool):
        return value, False
    return None, True


def clean_menu_item(p: dict):
    errors = {}
    category = str(p.get("category", "")).strip()
    if category not in MENU_CATEGORIES:
        errors["category"] = "Choose a category."
    name = clean_text(p.get("name"), 120)
    if not name:
        errors["name"] = "Dish name is required."
    elif len(name) > 120:
        errors["name"] = "Keep the name under 120 characters."
    description = clean_text(p.get("description"), 300)
    if len(description) > 300:
        errors["description"] = "Keep the description under 300 characters."

    price = p.get("price")
    if price in (None, ""):
        price = None
    else:
        try:
            if isinstance(price, bool):
                raise ValueError
            price = int(price)
            if not 0 <= price <= 100000:
                raise ValueError
        except (TypeError, ValueError):
            errors["price"] = "Price must be a whole number of rupees."
            price = None
    veg, bad = _bool_or_none(p.get("veg"))
    if bad:
        errors["veg"] = "Choose veg, non-veg or none."

    available = p.get("is_available", True)
    if not isinstance(available, bool):
        errors["is_available"] = "Invalid value."
    return {
        "category": category, "name": name, "description": description[:300] or None,
        "price": price, "veg": veg, "is_available": available is not False,
    }, errors


def clean_offer(p: dict):
    errors = {}
    title = clean_text(p.get("title"), 120)
    if not title:
        errors["title"] = "Title is required."
    elif len(title) > 120:
        errors["title"] = "Keep the title under 120 characters."
    description = clean_text(p.get("description"), 400, multiline=True)
    if not description:
        errors["description"] = "Description is required."
    elif len(description) > 400:
        errors["description"] = "Keep the description under 400 characters."
    terms = clean_text(p.get("terms"), 200)
    if len(terms) > 200:
        errors["terms"] = "Keep the terms under 200 characters."
    active = p.get("is_active", True)
    if not isinstance(active, bool):
        errors["is_active"] = "Invalid value."
    return {
        "title": title[:120], "description": description[:400],
        "terms": terms[:200] or None, "is_active": active is not False,
    }, errors


def clean_hours(p: dict):
    """Expect {"days": [7 x {open, close, closed}], "note": str} in Monday..Sunday order."""
    errors = {}
    days_in = p.get("days")
    if not isinstance(days_in, list) or len(days_in) != 7:
        return None, {"days": "Provide all seven days."}
    days = []
    for name, d in zip(WEEKDAYS, days_in):
        d = d if isinstance(d, dict) else {}
        closed = d.get("closed") is True
        open_, close = str(d.get("open", "")).strip(), str(d.get("close", "")).strip()
        if not closed and not (_HHMM.match(open_) and _HHMM.match(close)):
            errors[name] = "Enter opening and closing times, or mark the day closed."
        days.append({"day": name, "closed": closed, "open": "" if closed else open_, "close": "" if closed else close})
    note = clean_text(p.get("note"), 200)
    if len(note) > 200:
        errors["note"] = "Keep the note under 200 characters."
    return {"days": days, "note": note[:200]}, errors
