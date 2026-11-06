import pytest

from app.auth import hash_password
from app.extensions import db
from app.models import AdminUser


@pytest.fixture()
def auth(client):
    db.session.add(AdminUser(email="owner@example.com", password_hash=hash_password("correct-horse-1")))
    db.session.commit()
    res = client.post("/api/admin/auth/login", json={"email": "Owner@example.com", "password": "correct-horse-1"})
    return {"Authorization": f"Bearer {res.get_json()['token']}"}


def test_login_rejects_bad_credentials(client, auth):
    for body in ({"email": "owner@example.com", "password": "nope"}, {"email": "x@y.com", "password": "nope"}, {}):
        assert client.post("/api/admin/auth/login", json=body).status_code == 401


def test_admin_routes_need_token(client):
    for path in ("/api/admin/reservations", "/api/admin/messages", "/api/admin/menu-items", "/api/admin/hours"):
        assert client.get(path).status_code == 401
    assert client.get("/api/admin/overview", headers={"Authorization": "Bearer junk"}).status_code == 401


def test_reservation_status_flow(client, auth):
    from datetime import timedelta
    from app.utils.validation import now_ist
    day = (now_ist() + timedelta(days=2)).date().isoformat()
    client.post("/api/reservations", json={"name": "Asha", "phone": "9845012345", "guests": 2, "date": day, "time": "20:00"})
    rows = client.get("/api/admin/reservations", headers=auth).get_json()["items"]
    assert rows[0]["phone"] == "+919845012345"
    res = client.patch(f"/api/admin/reservations/{rows[0]['id']}", json={"status": "confirmed"}, headers=auth)
    assert res.get_json()["item"]["status"] == "confirmed"
    assert client.patch(f"/api/admin/reservations/{rows[0]['id']}", json={"status": "bogus"}, headers=auth).status_code == 422
    assert client.get("/api/admin/overview", headers=auth).get_json()["pending_reservations"] == 0


def test_menu_item_appears_publicly_until_hidden(client, auth):
    body = {"category": "biryani", "name": "Chicken Dum Biryani", "price": 320, "veg": False}
    item = client.post("/api/admin/menu-items", json=body, headers=auth).get_json()["item"]
    assert client.get("/api/public/content").get_json()["menu"]["biryani"][0]["price"] == 320
    client.put(f"/api/admin/menu-items/{item['id']}", json={**body, "is_available": False}, headers=auth)
    assert client.get("/api/public/content").get_json()["menu"]["biryani"] == []
    assert client.post("/api/admin/menu-items", json={**body, "category": "pizza"}, headers=auth).status_code == 422


def test_offers_and_hours(client, auth):
    assert client.post("/api/admin/offers", json={"title": "", "description": ""}, headers=auth).status_code == 422
    client.post("/api/admin/offers", json={"title": "Weekend special", "description": "Details"}, headers=auth)
    assert client.get("/api/public/content").get_json()["offers"][0]["title"] == "Weekend special"

    assert client.get("/api/public/content").get_json()["hours"] is None
    days = [{"open": "11:00", "close": "23:30", "closed": False}] * 6 + [{"closed": True}]
    assert client.put("/api/admin/hours", json={"days": days}, headers=auth).status_code == 200
    assert client.get("/api/public/content").get_json()["hours"]["days"][6]["closed"] is True
    bad = [{"open": "late", "close": "", "closed": False}] * 7
    assert client.put("/api/admin/hours", json={"days": bad}, headers=auth).status_code == 422


def test_messages(client, auth):
    client.post("/api/contact", json={"name": "Ravi", "email": "r@example.com", "message": "Is there parking?"})
    mid = client.get("/api/admin/messages", headers=auth).get_json()["items"][0]["id"]
    assert client.patch(f"/api/admin/messages/{mid}", json={"is_read": True}, headers=auth).get_json()["item"]["is_read"]
    assert client.delete(f"/api/admin/messages/{mid}", headers=auth).status_code == 204
