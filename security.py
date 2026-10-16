"""Auth, CORS and at-rest encryption helpers.

Environment:
  ADMIN_API_KEY            required for protected endpoints (fail closed if unset)
  SETTINGS_ENCRYPTION_KEY  Fernet key for encrypting the Tistory token at rest.
                           If unset, a key is derived from ADMIN_API_KEY.
  CORS_ORIGINS             comma-separated allowed origins
                           (default: http://localhost:5173,http://127.0.0.1:5173)
"""
import base64
import hashlib
import hmac
import os
from functools import wraps

from cryptography.fernet import Fernet, InvalidToken
from flask import jsonify, request

DEFAULT_CORS_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173"
ENC_PREFIX = "enc:v1:"


def cors_origins():
    raw = os.environ.get("CORS_ORIGINS", DEFAULT_CORS_ORIGINS)
    return [o.strip() for o in raw.split(",") if o.strip() and o.strip() != "*"]


def _provided_key():
    key = request.headers.get("X-Admin-Key", "")
    if not key:
        auth = request.headers.get("Authorization", "")
        if auth.lower().startswith("bearer "):
            key = auth[7:].strip()
    return key


def require_admin(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        expected = os.environ.get("ADMIN_API_KEY", "")
        if not expected:
            return jsonify({"error": "ADMIN_API_KEY is not configured on the server"}), 503
        provided = _provided_key()
        if not provided or not hmac.compare_digest(provided.encode(), expected.encode()):
            return jsonify({"error": "unauthorized"}), 401
        return fn(*args, **kwargs)

    return wrapper


def _fernet():
    key = os.environ.get("SETTINGS_ENCRYPTION_KEY")
    if key:
        return Fernet(key.encode())
    admin = os.environ.get("ADMIN_API_KEY")
    if not admin:
        raise RuntimeError("SETTINGS_ENCRYPTION_KEY or ADMIN_API_KEY must be set to store secrets")
    digest = hashlib.sha256(b"bible-blog-publisher:" + admin.encode()).digest()
    return Fernet(base64.urlsafe_b64encode(digest))


def encrypt_secret(value):
    if not value:
        return ""
    return ENC_PREFIX + _fernet().encrypt(value.encode()).decode()


def decrypt_secret(value):
    if not value:
        return ""
    if not value.startswith(ENC_PREFIX):
        return value  # legacy plaintext row; re-encrypted on next save
    try:
        return _fernet().decrypt(value[len(ENC_PREFIX):].encode()).decode()
    except (InvalidToken, RuntimeError, ValueError):
        return ""
