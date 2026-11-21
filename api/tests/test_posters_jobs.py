from collections.abc import Iterator

import pytest
from animarka_api.main import app
from animarka_core.models import Job, Species
from animarka_core.seed import seed
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


def state(order: list[str], title: str = "Owls") -> dict[str, object]:
    return {
        "v": 1,
        "catalog": "birds",
        "order": order,
        "flip": {},
        "seed": 7,
        "title": title,
        "titleAuto": False,
        "labels": "names",
        "lang": "en",
        "style": "fg",
        "bg": "cream",
        "layout": "scatter",
        "size": "3:4",
        "orientation": "portrait",
    }


@pytest.fixture
def client(db: Session) -> Iterator[TestClient]:
    seed(db)
    for i, sid in enumerate(["tyto-alba", "bubo-bubo"]):
        db.add(
            Species(
                id=sid,
                catalog_id="birds",
                scientific_name=sid,
                order="O",
                family="F",
                family_english="Owls",
                genus="g",
                seq=i,
                mass_g=1.0,
                names={"en": sid},
            )
        )
    db.commit()
    with TestClient(app) as c:
        yield c


def test_share_round_trip_and_same_state_same_id(client: TestClient) -> None:
    a = client.post("/api/v1/posters", json={"state": state(["tyto-alba", "bubo-bubo"])})
    assert a.status_code == 200
    pid = a.json()["id"]
    assert len(pid) == 8 and a.json()["url"] == f"/p/{pid}"
    again = client.post("/api/v1/posters", json={"state": state(["tyto-alba", "bubo-bubo"])})
    assert again.json()["id"] == pid
    other = client.post("/api/v1/posters", json={"state": state(["bubo-bubo"])})
    assert other.json()["id"] != pid
    got = client.get(f"/api/v1/posters/{pid}").json()
    assert got["state"]["order"] == ["tyto-alba", "bubo-bubo"]
    assert got["state"]["title"] == "Owls"


def test_share_rejects_bad_states(client: TestClient) -> None:
    assert client.post("/api/v1/posters", json={"state": state(["nope"])}).status_code == 422
    assert (
        client.post(
            "/api/v1/posters", json={"state": state(["tyto-alba"], title="x" * 33)}
        ).status_code
        == 422
    )
    too_many = state(["tyto-alba"] * 151)
    assert client.post("/api/v1/posters", json={"state": too_many}).status_code == 422
    bad = state(["tyto-alba"]) | {"size": "a"}
    assert client.post("/api/v1/posters", json={"state": bad}).status_code == 422
    assert client.get("/api/v1/posters/missing1").status_code == 404


def test_job_status(client: TestClient, db: Session) -> None:
    db.add(
        Job(
            id="j1",
            type="render",
            status="done",
            progress=1.0,
            input_hash="h",
            result={"png": "/x.png"},
        )
    )
    db.commit()
    body = client.get("/api/v1/jobs/j1").json()
    assert body == {
        "id": "j1",
        "type": "render",
        "status": "done",
        "progress": 1.0,
        "result": {"png": "/x.png"},
        "error": None,
    }
    assert client.get("/api/v1/jobs/none").status_code == 404


def test_render_queues_once_and_reuses_the_job(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    import animarka_api.routers.renders as renders

    sent: list[tuple[str, str, int, str]] = []
    monkeypatch.setattr(renders, "enqueue", lambda *a: sent.append(a))
    pid = client.post("/api/v1/posters", json={"state": state(["tyto-alba"])}).json()["id"]
    first = client.post("/api/v1/renders", json={"poster_id": pid})
    assert first.status_code == 202 and first.json()["status"] == "queued"
    again = client.post("/api/v1/renders", json={"poster_id": pid})
    assert again.json()["job_id"] == first.json()["job_id"]
    assert len(sent) == 1
    job_id, poster_id, width, kind = sent[0]
    assert (poster_id, width, kind) == (pid, 1200, "preview")  # 3:4, long edge 1600
    assert client.get(f"/api/v1/jobs/{job_id}").json()["status"] == "queued"


def test_render_print_needs_payment_and_unknown_poster_is_404(client: TestClient) -> None:
    assert (
        client.post("/api/v1/renders", json={"poster_id": "x", "kind": "print"}).status_code == 402
    )
    assert client.post("/api/v1/renders", json={"poster_id": "nope0000"}).status_code == 404


def test_signed_links_match_the_web_rule() -> None:
    from animarka_core.render import preview_width, sign

    assert preview_width("2:3") == 1067 and preview_width("4:5") == 1280
    token = sign("abc", 1200, "preview")
    assert len(token) == 64 and token != sign("abc", 1201, "preview")
