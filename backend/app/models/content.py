"""Owner-managed website content: menu dishes, offers and opening hours."""

import json

from ..extensions import db

# Must match the category ids in frontend/src/config/content.js (MENU.categories).
MENU_CATEGORIES = ("biryani", "alfam", "kebabs", "tikka", "mocktails")
WEEKDAYS = ("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")


class MenuItem(db.Model):
    __tablename__ = "menu_items"

    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(30), nullable=False, index=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.String(300))
    price = db.Column(db.Integer)  # whole rupees; NULL hides the price
    veg = db.Column(db.Boolean)  # NULL hides the veg / non-veg marker
    position = db.Column(db.Integer, nullable=False, default=0)
    is_available = db.Column(db.Boolean, nullable=False, default=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id, "category": self.category, "name": self.name,
            "description": self.description or "", "price": self.price, "veg": self.veg,
            "position": self.position, "is_available": self.is_available,
        }


class Offer(db.Model):
    __tablename__ = "offers"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.String(400), nullable=False)
    terms = db.Column(db.String(200))
    position = db.Column(db.Integer, nullable=False, default=0)
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id, "title": self.title, "description": self.description,
            "terms": self.terms or "", "position": self.position, "is_active": self.is_active,
        }


class Setting(db.Model):
    """Small key -> JSON store (currently: 'hours')."""

    __tablename__ = "settings"

    key = db.Column(db.String(50), primary_key=True)
    value = db.Column(db.Text, nullable=False)

    @staticmethod
    def get(key: str, default=None):
        row = db.session.get(Setting, key)
        return json.loads(row.value) if row else default

    @staticmethod
    def put(key: str, value) -> None:
        row = db.session.get(Setting, key)
        text = json.dumps(value, ensure_ascii=False)
        if row:
            row.value = text
        else:
            db.session.add(Setting(key=key, value=text))
