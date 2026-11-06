from datetime import timedelta

from app.utils.validation import now_ist


def booking(**over):
    day = (now_ist() + timedelta(days=3)).date().isoformat()
    data = {"name": "Asha Rao", "phone": "9845012345", "guests": 4, "date": day, "time": "20:30", "occasion": "birthday"}
    data.update(over)
    return data


def test_health(client):
    assert client.get("/api/health").get_json() == {"status": "ok"}


def test_reservation_created(client):
    res = client.post("/api/reservations", json=booking())
    assert res.status_code == 201
    body = res.get_json()["reservation"]
    assert body["reference"].startswith("FT-") and body["status"] == "pending"
    assert "phone" not in body  # contact details are never echoed back


def test_duplicate_submit_returns_original(client):
    first = client.post("/api/reservations", json=booking()).get_json()["reservation"]
    second = client.post("/api/reservations", json=booking())
    assert second.status_code == 200
    assert second.get_json()["reservation"]["reference"] == first["reference"]


def test_validation_errors_are_field_level(client):
    res = client.post("/api/reservations", json=booking(name="", phone="12", guests=99, date="2020-01-01"))
    assert res.status_code == 422
    assert {"name", "phone", "guests", "date"} <= set(res.get_json()["errors"])


def test_non_json_rejected(client):
    assert client.post("/api/reservations", data="x", content_type="text/plain").status_code == 400


def test_honeypot_looks_successful_but_stores_nothing(client):
    res = client.post("/api/reservations", json=booking(website="http://spam.example"))
    assert res.status_code == 201
    # a real, identical booking afterwards is a new one (201), proving nothing was stored
    assert client.post("/api/reservations", json=booking()).status_code == 201


def test_contact_requires_a_way_to_reply(client):
    assert client.post("/api/contact", json={"name": "Ravi", "message": "Do you have parking?"}).status_code == 422
    ok = client.post("/api/contact", json={"name": "Ravi", "email": "ravi@example.com", "message": "Do you have parking?"})
    assert ok.status_code == 201


def test_unknown_route_is_json(client):
    res = client.get("/api/nope")
    assert res.status_code == 404 and "message" in res.get_json()
