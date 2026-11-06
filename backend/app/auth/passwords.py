from werkzeug.security import check_password_hash, generate_password_hash

MIN_LENGTH = 10

# Verified against when the email is unknown, so response time doesn't reveal which emails exist.
_DUMMY = generate_password_hash("not-a-real-password")


def hash_password(password: str) -> str:
    return generate_password_hash(password)  # scrypt with a per-password salt


def verify_password(password: str, password_hash: str | None) -> bool:
    return check_password_hash(password_hash or _DUMMY, password) and password_hash is not None
