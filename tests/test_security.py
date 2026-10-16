from conftest import AUTH

TOKEN = "super-secret-tistory-token"


def test_health_and_public_endpoints(client):
    assert client.get("/api/health").status_code == 200
    assert client.get("/api/bible/categories").status_code == 200
    assert client.get("/api/bible/posts").status_code == 200


def test_settings_requires_auth(client):
    assert client.get("/api/bible/settings").status_code == 401
    assert client.post("/api/bible/settings", json={}).status_code == 401
    bad = {"X-Admin-Key": "wrong"}
    assert client.get("/api/bible/settings", headers=bad).status_code == 401


def test_generate_requires_auth(client):
    assert client.post("/api/bible/generate", json={}).status_code == 401
    r = client.post("/api/bible/generate", json={}, headers=AUTH)
    assert r.status_code == 200
    assert r.get_json()["post"]["passage"]


def test_bearer_auth_accepted(client):
    r = client.get("/api/bible/settings", headers={"Authorization": "Bearer test-admin-key"})
    assert r.status_code == 200


def test_fail_closed_without_admin_key(client, monkeypatch):
    monkeypatch.delenv("ADMIN_API_KEY")
    assert client.get("/api/bible/settings", headers=AUTH).status_code == 503


def test_token_never_returned_and_encrypted_at_rest(client):
    r = client.post("/api/bible/settings", json={"tistory_access_token": TOKEN}, headers=AUTH)
    assert r.status_code == 200
    r = client.get("/api/bible/settings", headers=AUTH)
    body = r.get_data(as_text=True)
    assert TOKEN not in body
    assert r.get_json()["tistory_token_set"] is True

    from models import BibleAutomationSettings
    from security import decrypt_secret
    with client.app_module.app.app_context():
        row = BibleAutomationSettings.query.filter_by(user_id=1).first()
        assert TOKEN not in row.tistory_access_token
        assert row.tistory_access_token.startswith("enc:v1:")
        assert decrypt_secret(row.tistory_access_token) == TOKEN


def test_blank_token_keeps_existing_and_clear_removes(client):
    client.post("/api/bible/settings", json={"tistory_access_token": TOKEN}, headers=AUTH)
    client.post("/api/bible/settings", json={"tistory_blog_name": "x"}, headers=AUTH)
    assert client.get("/api/bible/settings", headers=AUTH).get_json()["tistory_token_set"] is True
    client.post("/api/bible/settings", json={"clear_tistory_token": True}, headers=AUTH)
    assert client.get("/api/bible/settings", headers=AUTH).get_json()["tistory_token_set"] is False


def test_cors_restricted(client):
    evil = client.get("/api/health", headers={"Origin": "https://evil.example"})
    assert "Access-Control-Allow-Origin" not in evil.headers
    ok = client.get("/api/health", headers={"Origin": "http://localhost:5173"})
    assert ok.headers.get("Access-Control-Allow-Origin") == "http://localhost:5173"


def test_unknown_api_route_is_404(client):
    assert client.get("/api/automation/status/1").status_code == 404
