from collections.abc import Iterator
from pathlib import Path

import pytest
from animarka_api.main import app
from animarka_core.models import Artwork, Report, Species
from animarka_core.seed import seed
from animarka_core.storage import LocalStorage, get_storage
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


def add_species(
    db: Session, sid: str, seq: int, family: str, mass: float | None, styles=("fg", "wb")
) -> None:
    db.add(
        Species(
            id=sid,
            catalog_id="birds",
            scientific_name=sid.replace("-", " ").capitalize(),
            order="Strigiformes",
            family=family,
            family_english=f"{family} english",
            genus=sid.split("-")[0],
            seq=seq,
            mass_g=mass,
            names={"en": f"{sid} en", "he": f"{sid} he"},
        )
    )
    db.flush()
    for style in styles:
        db.add(
            Artwork(
                species_id=sid,
                style_id=style,
                pose="main",
                source_path="x",
                source_sha="s",
                image_key=f"art/{style}/{sid}/h.webp",
                medium_key=f"art/{style}/{sid}/h-640.webp",
                thumb_key=f"art/{style}/{sid}/h-200.webp",
                width=300,
                height=400,
                faces="right" if style == "wb" and sid == "tyto-alba" else None,
                faces_source="manual" if style == "wb" and sid == "tyto-alba" else None,
            )
        )


@pytest.fixture
def client(db: Session, tmp_path: Path) -> Iterator[TestClient]:
    seed(db)
    add_species(db, "tyto-alba", 2, "Tytonidae", 400.0)
    add_species(db, "bubo-bubo", 1, "Strigidae", 2000.0)
    add_species(db, "strix-aluco", 3, "Strigidae", None)  # mass from its family
    add_species(db, "only-fg", 4, "Strigidae", 10.0, styles=("fg",))  # one style: listed with it
    db.commit()
    storage = LocalStorage(tmp_path)
    storage.put("art/fg/tyto-alba/h-200.webp", b"RIFFxxxxWEBP")
    app.dependency_overrides.clear()
    get_storage.cache_clear()
    import animarka_api.routers.catalog as cat
    import animarka_api.routers.files as files

    original = (cat.get_storage, files.get_storage)
    cat.get_storage = files.get_storage = lambda: storage  # type: ignore[assignment]
    with TestClient(app) as c:
        yield c
    cat.get_storage, files.get_storage = original


def test_species_lists_every_bird_with_art_in_taxonomic_order(client: TestClient) -> None:
    res = client.get("/api/v1/catalogs/birds/species")
    assert res.status_code == 200
    body = res.json()
    assert body["count"] == 4
    assert [s["id"] for s in body["species"]] == [
        "bubo-bubo",
        "tyto-alba",
        "strix-aluco",
        "only-fg",
    ]
    # A bird with field guide art only is listed with just that style.
    assert list(body["species"][3]["art"]) == ["fg"]
    owl = body["species"][1]
    assert owl["names"] == {"en": "tyto-alba en", "he": "tyto-alba he"}
    assert owl["family"] == "Tytonidae english" and owl["familySci"] == "Tytonidae"
    assert owl["art"]["fg"] == {
        "thumb": "/api/v1/files/art/fg/tyto-alba/h-200.webp",
        "medium": "/api/v1/files/art/fg/tyto-alba/h-640.webp",
        "w": 300,
        "h": 400,
        "faces": "left",
        "facesKnown": False,
    }
    assert owl["art"]["wb"]["faces"] == "right" and owl["art"]["wb"]["facesKnown"] is True


def test_missing_mass_takes_the_family_median(client: TestClient) -> None:
    strix = client.get("/api/v1/catalogs/birds/species").json()["species"][2]
    # Median of its family's known weights: 2000 g and 10 g.
    assert strix["massG"] == 1005.0 and strix["massEstimated"] is True


def test_lang_filter(client: TestClient) -> None:
    names = client.get("/api/v1/catalogs/birds/species?lang=he").json()["species"][0]["names"]
    assert names == {"he": "bubo-bubo he"}
    fallback = client.get("/api/v1/catalogs/birds/species?lang=xx").json()["species"][0]["names"]
    assert fallback == {"en": "bubo-bubo en"}


def test_etag_gives_304_when_unchanged(client: TestClient) -> None:
    first = client.get("/api/v1/catalogs/birds/species")
    tag = first.headers["etag"]
    assert first.headers["cache-control"].startswith("public, max-age=300")
    again = client.get("/api/v1/catalogs/birds/species", headers={"If-None-Match": tag})
    assert again.status_code == 304 and again.content == b""
    other = client.get("/api/v1/catalogs/birds/species?lang=en", headers={"If-None-Match": tag})
    assert other.status_code == 200 and other.headers["etag"] != tag


def test_large_responses_are_gzipped(client: TestClient) -> None:
    res = client.get("/api/v1/catalogs/birds/species", headers={"Accept-Encoding": "gzip"})
    assert res.headers.get("content-encoding") == "gzip"


def test_unknown_catalog_is_404(client: TestClient) -> None:
    for path in ("species", "families", "presets"):
        assert client.get(f"/api/v1/catalogs/fish/{path}").status_code == 404


def test_families_with_counts(client: TestClient) -> None:
    res = client.get("/api/v1/catalogs/birds/families")
    assert res.json() == [
        {"id": "Strigidae", "name": "Strigidae english", "count": 3},
        {"id": "Tytonidae", "name": "Tytonidae english", "count": 1},
    ]
    assert "etag" in res.headers


def test_styles_backgrounds_presets(client: TestClient) -> None:
    styles = client.get("/api/v1/styles").json()
    assert [s["id"] for s in styles] == ["fg", "wb"]
    assert styles[1]["license"] == "MIT" and "sourceUrl" in styles[1]
    bgs = client.get("/api/v1/backgrounds").json()
    assert len(bgs) == 8 and bgs[0]["id"] == "cream"
    forest = next(b for b in bgs if b["id"] == "forest")
    assert forest["isDark"] is True and forest["imageFull"] == "/backgrounds/full/forest.jpg"
    presets = client.get("/api/v1/catalogs/birds/presets").json()
    assert presets and {"id", "title", "description", "ids"} <= set(presets[0])


def test_files_served_with_long_cache(client: TestClient) -> None:
    res = client.get("/api/v1/files/art/fg/tyto-alba/h-200.webp")
    assert res.status_code == 200
    assert res.headers["content-type"] == "image/webp"
    assert "immutable" in res.headers["cache-control"]
    assert client.get("/api/v1/files/art/fg/nope.webp").status_code == 404
    assert client.get("/api/v1/files/..%2F..%2Fetc%2Fpasswd").status_code == 404


def test_report_a_wrong_bird(client: TestClient, db: Session) -> None:
    res = client.post(
        "/api/v1/reports", json={"speciesId": "tyto-alba", "styleId": "wb", "note": " wrong beak "}
    )
    assert res.status_code == 201
    report = db.get(Report, res.json()["id"])
    assert report is not None and report.note == "wrong beak"
    assert client.post("/api/v1/reports", json={"speciesId": "nope"}).status_code == 422
    assert (
        client.post("/api/v1/reports", json={"speciesId": "tyto-alba", "styleId": "zz"}).status_code
        == 422
    )
    assert (
        client.post(
            "/api/v1/reports", json={"speciesId": "tyto-alba", "note": "x" * 501}
        ).status_code
        == 422
    )


def test_compact_form_has_every_bird_in_short_rows(client: TestClient) -> None:
    full = client.get("/api/v1/catalogs/birds/species").json()
    res = client.get("/api/v1/catalogs/birds/species?format=compact")
    assert res.status_code == 200 and "etag" in res.headers
    body = res.json()
    assert body["v"] == 2 and body["count"] == 4 and body["files"] == "/api/v1/files/"
    assert [r[0] for r in body["species"]] == [s["id"] for s in full["species"]]
    owl = next(r for r in body["species"] if r[0] == "tyto-alba")
    assert owl[1] == "tyto-alba en" and owl[2] == "tyto-alba he"
    assert body["families"][owl[3]] == ["Tytonidae", "Tytonidae english"]
    # [width, height, hash, faces right, faces known]: the URL is rebuilt from the hash.
    assert owl[6] == [300, 400, "h", 0, 0] and owl[7] == [300, 400, "h", 1, 1]
    only = next(r for r in body["species"] if r[0] == "only-fg")
    assert only[7] == 0
    strix = next(r for r in body["species"] if r[0] == "strix-aluco")
    assert strix[4] == 1005 and strix[5] == 1


def test_ids_returns_only_those_birds_with_whole_catalog_weights(client: TestClient) -> None:
    body = client.get(
        "/api/v1/catalogs/birds/species?format=compact&ids=strix-aluco,tyto-alba,nope"
    ).json()
    assert [r[0] for r in body["species"]] == ["tyto-alba", "strix-aluco"]
    strix = body["species"][1]
    assert strix[4] == 1005  # the family median over the whole catalog, not just these two
