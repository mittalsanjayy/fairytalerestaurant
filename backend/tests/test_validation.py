import pytest

from app.utils.validation import normalise_phone


@pytest.mark.parametrize("raw,expected", [
    ("7026360944", "+917026360944"),
    ("+91 70263 60944", "+917026360944"),
    ("07026360944", "+917026360944"),
    ("+14155552671", "+14155552671"),
    ("5026360944", None),
    ("12345", None),
])
def test_phone(raw, expected):
    assert normalise_phone(raw) == expected
