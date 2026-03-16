"""Monitoring and error handling helpers for backend services."""

import os
from typing import Any, Dict

import sentry_sdk
from flask import jsonify
from sentry_sdk.integrations.flask import FlaskIntegration


_SENTRY_ENABLED = False


def _bool_env(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def init_monitoring(app=None) -> bool:
    """Initialize Sentry monitoring when enabled via environment variables."""
    global _SENTRY_ENABLED

    enabled = _bool_env("SENTRY_ENABLED", False)
    dsn = os.getenv("SENTRY_DSN", "").strip()

    if not enabled or not dsn:
        _SENTRY_ENABLED = False
        if app:
            app.logger.info("Sentry monitoring disabled")
        return False

    sentry_sdk.init(
        dsn=dsn,
        integrations=[FlaskIntegration()],
        traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0")),
        environment=os.getenv("APP_ENV", os.getenv("FLASK_ENV", "production")),
        send_default_pii=False,
        before_send=redact_sensitive_event,
    )
    _SENTRY_ENABLED = True
    if app:
        app.logger.info("Sentry monitoring enabled")
    return True


def is_monitoring_enabled() -> bool:
    return _SENTRY_ENABLED


def _sanitize_string(value: str) -> str:
    lowered = value.lower()
    blocked_keys = [
        "password",
        "token",
        "secret",
        "authorization",
        "cookie",
        "apikey",
        "api_key",
    ]
    if any(key in lowered for key in blocked_keys):
        return "[REDACTED]"
    return value


def sanitize_payload(value: Any) -> Any:
    if isinstance(value, dict):
        sanitized = {}
        for key, item in value.items():
            key_str = str(key).lower()
            if any(secret in key_str for secret in ["password", "token", "secret", "authorization", "cookie", "api_key", "apikey"]):
                sanitized[key] = "[REDACTED]"
            else:
                sanitized[key] = sanitize_payload(item)
        return sanitized
    if isinstance(value, list):
        return [sanitize_payload(item) for item in value]
    if isinstance(value, tuple):
        return tuple(sanitize_payload(item) for item in value)
    if isinstance(value, str):
        return _sanitize_string(value)
    return value


def redact_sensitive_event(event: Dict[str, Any], hint: Dict[str, Any]) -> Dict[str, Any]:
    request = event.get("request")
    if isinstance(request, dict):
        if "cookies" in request:
            request["cookies"] = "[REDACTED]"
        headers = request.get("headers")
        if isinstance(headers, dict):
            for header in list(headers.keys()):
                if header.lower() in {"authorization", "cookie", "x-api-key"}:
                    headers[header] = "[REDACTED]"
        data = request.get("data")
        if data is not None:
            request["data"] = sanitize_payload(data)
    return event


def capture_exception(error: Exception, context: Dict[str, Any] | None = None) -> None:
    if not _SENTRY_ENABLED:
        return
    if context:
        sentry_sdk.set_context("error_context", sanitize_payload(context))
    sentry_sdk.capture_exception(error)


def safe_error_response(message: str = "An unexpected error occurred", status_code: int = 500):
    return jsonify({"success": False, "error": message}), status_code