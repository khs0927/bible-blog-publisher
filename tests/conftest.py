import importlib
import os
import sys

import pytest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_PATH", f"sqlite:///{tmp_path / 'test.db'}")
    monkeypatch.setenv("ADMIN_API_KEY", "test-admin-key")
    monkeypatch.delenv("SETTINGS_ENCRYPTION_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.delenv("CORS_ORIGINS", raising=False)
    for mod in ("app", "routes_bible"):
        sys.modules.pop(mod, None)
    app_module = importlib.import_module("app")
    app_module.app.config["TESTING"] = True
    with app_module.app.test_client() as c:
        c.app_module = app_module
        yield c


AUTH = {"X-Admin-Key": "test-admin-key"}
