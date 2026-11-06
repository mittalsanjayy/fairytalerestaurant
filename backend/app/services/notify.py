"""Owner notifications. Email is optional: with no SMTP settings, submissions are still stored
(and visible in the Phase 5 dashboard) and a line is written to the server log."""

import smtplib
import threading
from email.message import EmailMessage

from flask import current_app


def _send(cfg: dict, subject: str, body: str, reply_to: str | None) -> None:
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = cfg["SMTP_FROM"] or cfg["SMTP_USER"] or cfg["NOTIFY_EMAIL"]
    msg["To"] = cfg["NOTIFY_EMAIL"]
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.set_content(body)

    try:
        if cfg["SMTP_USE_SSL"]:
            server = smtplib.SMTP_SSL(cfg["SMTP_HOST"], cfg["SMTP_PORT"], timeout=15)
        else:
            server = smtplib.SMTP(cfg["SMTP_HOST"], cfg["SMTP_PORT"], timeout=15)
            server.starttls()
        with server:
            if cfg["SMTP_USER"]:
                server.login(cfg["SMTP_USER"], cfg["SMTP_PASSWORD"])
            server.send_message(msg)
    except Exception:  # never let a mail problem lose or fail a booking
        current_app.logger.exception("Could not send notification email")


def notify_owner(subject: str, body: str, reply_to: str | None = None) -> None:
    """Fire-and-forget so the guest never waits on the mail server."""
    app = current_app._get_current_object()
    app.logger.info("New submission: %s", subject)
    cfg = app.config
    if not (cfg["SMTP_HOST"] and cfg["NOTIFY_EMAIL"]) or cfg["TESTING"]:
        return

    snapshot = {k: cfg[k] for k in (
        "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM", "SMTP_USE_SSL", "NOTIFY_EMAIL"
    )}

    def run():
        with app.app_context():
            _send(snapshot, subject, body, reply_to)

    threading.Thread(target=run, daemon=True).start()
