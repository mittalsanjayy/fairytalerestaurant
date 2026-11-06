"""JSON helpers and error handlers so the frontend always receives {message, errors?}."""

from flask import jsonify, request
from werkzeug.exceptions import HTTPException


def json_error(message: str, status: int = 400, errors: dict | None = None):
    body = {"message": message}
    if errors:
        body["errors"] = errors
    return jsonify(body), status


def get_json_object():
    """Parsed JSON body if it is an object, else None."""
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else None


def register_error_handlers(app):
    @app.errorhandler(HTTPException)
    def http_error(err):
        messages = {
            404: "Not found.",
            405: "Method not allowed.",
            413: "That request is too large.",
            415: "Please send JSON.",
            429: "Too many requests. Please wait a little while and try again, or call us.",
        }
        return json_error(messages.get(err.code, err.description or "Request failed."), err.code or 500)

    @app.errorhandler(Exception)
    def unexpected(err):
        app.logger.exception("Unhandled error: %s", err)
        return json_error("Something went wrong on our side. Please try again, or call us.", 500)
