from animarka_api.main import app
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


def test_healthz() -> None:
    res = TestClient(app).get("/healthz")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_readyz_checks_db_and_redis(db: Session) -> None:
    res = TestClient(app).get("/readyz")
    body = res.json()
    assert body["db"] == "ok"
    # Redis may not run beside the test database; either way the answer names the check.
    assert "redis" in body
    assert res.status_code == (200 if body["redis"] == "ok" else 503)
