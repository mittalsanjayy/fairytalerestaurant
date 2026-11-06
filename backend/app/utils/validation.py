"""Input validation for public forms. Pure functions: no Flask or database imports, easy to test.

Every cleaner returns (clean_data, errors). `errors` maps field -> message and is empty when valid.
"""

import re
from datetime import date, datetime, time, timedelta, timezone

try:  # listed in requirements.txt; the regex below is only a safety net
    from email_validator import EmailNotValidError, validate_email
except ImportError:  # pragma: no cover
    validate_email = None

# India has no daylight saving, so a fixed offset is exact and avoids a tz-database dependency on Windows.
IST = timezone(timedelta(hours=5, minutes=30), "IST")

OCCASIONS = {"birthday", "anniversary", "family", "friends", "other"}

_CONTROL = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
_EMAIL_FALLBACK = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def now_ist() -> datetime:
    return datetime.now(IST)


def clean_text(value, max_len: int, *, multiline: bool = False) -> str:
    if value is None:
        return ""
    text = _CONTROL.sub("", str(value)).replace("\r\n", "\n").replace("\r", "\n")
    if not multiline:
        text = " ".join(text.split())
    else:
        text = "\n".join(line.rstrip() for line in text.split("\n")).strip()
        text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()[: max_len + 1]  # one extra char so callers can detect "too long"


def normalise_phone(value) -> str | None:
    """Return a normalised number or None. Indian mobiles -> '+91XXXXXXXXXX'; other countries need '+'."""
    raw = str(value or "").strip()
    if not raw:
        return None
    has_plus = raw.startswith("+")
    digits = re.sub(r"\D", "", raw)
    if has_plus:
        if digits.startswith("91") and len(digits) == 12 and digits[2] in "6789":
            return "+" + digits
        return "+" + digits if 8 <= len(digits) <= 15 and not digits.startswith("0") else None
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    elif len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]
    if len(digits) == 10 and digits[0] in "6789":
        return "+91" + digits
    return None


def _check_email(value: str) -> str | None:
    if len(value) > 254:
        return None
    if validate_email is None:
        return value.lower() if _EMAIL_FALLBACK.match(value) else None
    try:
        return validate_email(value, check_deliverability=False).normalized
    except EmailNotValidError:
        return None


def _name(payload, errors):
    name = clean_text(payload.get("name"), 80)
    if len(name) < 2:
        errors["name"] = "Please tell us your name."
    elif len(name) > 80:
        errors["name"] = "Please keep your name under 80 characters."
    return name


def _phone(payload, errors, *, required=True):
    raw = payload.get("phone")
    if not str(raw or "").strip():
        if required:
            errors["phone"] = "Please enter a phone number so we can confirm."
        return None
    phone = normalise_phone(raw)
    if phone is None:
        errors["phone"] = "Enter a valid 10-digit mobile number (or include your country code with +)."
    return phone


def _email(payload, errors, *, required=False):
    raw = clean_text(payload.get("email"), 254)
    if not raw:
        if required:
            errors["email"] = "Please enter your email address."
        return None
    email = _check_email(raw)
    if email is None:
        errors["email"] = "That email address doesn’t look right."
    return email


def clean_reservation(payload: dict, *, max_party: int, max_advance_days: int, min_lead_minutes: int, now: datetime | None = None):
    errors: dict[str, str] = {}
    now = now or now_ist()

    data = {
        "name": _name(payload, errors),
        "phone": _phone(payload, errors),
        "email": _email(payload, errors),
    }

    # Party size
    try:
        guests = int(str(payload.get("guests", "")).strip())
    except ValueError:
        guests = 0
    if guests < 1:
        errors["guests"] = "Please choose the number of guests."
    elif guests > max_party:
        errors["guests"] = f"For parties of more than {max_party}, please call us and we’ll arrange it."
    data["guests"] = guests

    # Date
    day = None
    try:
        day = date.fromisoformat(str(payload.get("date", "")).strip())
    except ValueError:
        errors["date"] = "Please choose a date."
    if day is not None:
        today = now.date()
        if day < today:
            errors["date"] = "That date has already passed."
        elif day > today + timedelta(days=max_advance_days):
            errors["date"] = f"We take bookings up to {max_advance_days} days ahead."
    data["date"] = day

    # Time
    slot = None
    try:
        slot = datetime.strptime(str(payload.get("time", "")).strip(), "%H:%M").time()
    except ValueError:
        errors["time"] = "Please choose a time."
    if slot is not None and day is not None and "date" not in errors and day == now.date():
        earliest = (now + timedelta(minutes=min_lead_minutes)).time().replace(second=0, microsecond=0)
        if slot < earliest:
            errors["time"] = "That time has passed. Please choose a later time, or call us."
    data["time"] = slot

    # Occasion
    occasion = clean_text(payload.get("occasion"), 30).lower()
    if occasion and occasion not in OCCASIONS:
        errors["occasion"] = "Please choose one of the listed occasions."
    data["occasion"] = occasion or None

    # Notes
    notes = clean_text(payload.get("notes"), 500, multiline=True)
    if len(notes) > 500:
        errors["notes"] = "Please keep your note under 500 characters."
    data["notes"] = notes[:500] or None

    return data, errors


def clean_contact(payload: dict):
    errors: dict[str, str] = {}
    data = {
        "name": _name(payload, errors),
        "phone": _phone(payload, errors, required=False),
        "email": _email(payload, errors),
    }
    if not data["phone"] and not data["email"] and "phone" not in errors and "email" not in errors:
        errors["phone"] = "Please share a phone number or an email so we can reply."

    message = clean_text(payload.get("message"), 1500, multiline=True)
    if len(message) < 5:
        errors["message"] = "Please write a short message."
    elif len(message) > 1500:
        errors["message"] = "Please keep your message under 1500 characters."
    data["message"] = message[:1500]
    return data, errors
