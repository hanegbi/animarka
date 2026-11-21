import io
import json
from pathlib import Path

import fakeredis
import pytest
from animarka_core.models import Artwork, Species
from animarka_core.seed import seed
from animarka_core.storage import LocalStorage
from animarka_workers import progress
from animarka_workers.ingest.catalog import species_row
from animarka_workers.ingest.images import process
from animarka_workers.ingest.match import files_by_slug, match_species, slug_of
from animarka_workers.ingest.run import artwork, plan
from animarka_workers.ingest.sources import TransientError, TreeEntry, with_retries
from PIL import Image
from sqlalchemy import func, select
from sqlalchemy.orm import Session

FG = r"^stickers/[^/]+/[^/]+/(?P<genus>[A-Z][a-z]+)_(?P<species>[a-z]+)\.webp$"
WB = r"^avian/assets/illustrations/(?P<genus>[a-z]+)-(?P<species>[a-z]+)\.png$"
SOURCES = {
    "species_json": {"repo": "o/fg", "ref": "r1", "path": "data/species.json"},
    "styles": {
        "fg": {"repo": "o/fg", "ref": "r1", "pattern": FG},
        "wb": {"repo": "o/wb", "ref": "r2", "pattern": WB},
    },
}


def png(w: int = 120, h: int = 80, pad: int = 20, fmt: str = "PNG") -> bytes:
    im = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    im.paste(Image.new("RGBA", (w, h), (200, 80, 40, 255)), (pad, pad))
    buf = io.BytesIO()
    im.save(buf, fmt)
    return buf.getvalue()


def meta(sid: str, seq: int, he: str | None = None, mass: float | None = 100.0) -> dict:
    names = {"en": sid.replace("_", " ")}
    if he:
        names["he"] = he
    return {
        "id": sid,
        "scientificName": sid.replace("_", " "),
        "names": names,
        "taxonomy": {
            "order": "O",
            "family": "F",
            "familyEnglish": "Fams",
            "genus": sid.split("_")[0],
            "seq": seq,
        },
        "traits": {"massG": mass},
    }


class FakeFetcher:
    def __init__(self) -> None:
        self.species = [meta("Tyto_alba", 2, he="תנשמת"), meta("Bubo_bubo", 1), meta("Only_fg", 3)]
        self.trees = {
            "o/fg": [
                TreeEntry("stickers/Strigiformes/Tytonidae/Tyto_alba.webp", "a1"),
                TreeEntry("stickers/Strigiformes/Strigidae/Bubo_bubo.webp", "b1"),
                TreeEntry("stickers/X/Y/Only_fg.webp", "c1"),
                TreeEntry("data/species.json", "j"),
            ],
            "o/wb": [
                TreeEntry("avian/assets/illustrations/tyto-alba.png", "a2"),
                TreeEntry("avian/assets/illustrations/tyto-alba-2.png", "a3"),
                TreeEntry("avian/assets/illustrations/bubo-bubo.png", "b2"),
                TreeEntry("avian/assets/illustrations/not-inmeta.png", "z"),
            ],
        }
        self.raw_calls: list[str] = []

    def tree(self, repo: str, ref: str) -> list[TreeEntry]:
        return self.trees[repo]

    def raw(self, repo: str, ref: str, path: str) -> bytes:
        self.raw_calls.append(path)
        if path.endswith("species.json"):
            return json.dumps({"species": self.species}).encode()
        return png(fmt="WEBP" if path.endswith(".webp") else "PNG")


def test_slug_and_file_patterns() -> None:
    assert slug_of("Tyto_alba") == "tyto-alba"
    fetcher = FakeFetcher()
    assert set(files_by_slug(fetcher.trees["o/wb"], WB)) == {"tyto-alba", "bubo-bubo", "not-inmeta"}
    assert set(files_by_slug(fetcher.trees["o/fg"], FG)) == {"tyto-alba", "bubo-bubo", "only-fg"}


def test_match_needs_both_styles_and_metadata_and_sorts_by_taxonomy() -> None:
    f = FakeFetcher()
    trees = {"fg": f.trees["o/fg"], "wb": f.trees["o/wb"]}
    matches = match_species(f.species, trees, {"fg": FG, "wb": WB})
    assert [m.slug for m in matches] == ["bubo-bubo", "tyto-alba"]
    assert (
        matches[1].files["wb"].path.endswith("tyto-alba.png")
    )  # the flight pose is not the main art


def test_species_row_keeps_launch_languages_and_mass() -> None:
    row = species_row("tyto-alba", meta("Tyto_alba", 2, he="תנשמת"))
    assert row["names"] == {"en": "Tyto alba", "he": "תנשמת"}
    assert row["mass_g"] == 100.0 and row["seq"] == 2 and row["family_english"] == "Fams"
    assert species_row("x-y", meta("X_y", 1, mass=None))["mass_g"] is None


def test_process_trims_and_makes_sizes() -> None:
    out = process(png(120, 80, pad=30))
    assert (out.width, out.height) == (120, 80)
    assert Image.open(io.BytesIO(out.thumb)).size == (120, 80)  # never upscaled
    big = process(png(1000, 500, pad=10))
    assert max(Image.open(io.BytesIO(big.medium)).size) == 640
    assert max(Image.open(io.BytesIO(big.thumb)).size) == 200


def test_retries_transient_errors_then_gives_up() -> None:
    calls: list[int] = []
    delays: list[float] = []

    def flaky() -> str:
        calls.append(1)
        if len(calls) < 3:
            raise TransientError("503")
        return "ok"

    assert with_retries(flaky, sleep=delays.append) == "ok"
    assert delays == [0.5, 1.0]
    with pytest.raises(TransientError):
        with_retries(
            lambda: (_ for _ in ()).throw(TransientError("x")), attempts=2, sleep=delays.append
        )


def test_progress_counts() -> None:
    r = fakeredis.FakeRedis(decode_responses=True)
    progress.start("j1", 4, r)
    progress.advance("j1", done=2, r=r)
    state = progress.advance("j1", failed=1, r=r)
    assert state == {"status": "running", "total": 4, "done": 2, "failed": 1, "progress": 0.75}
    progress.finish("j1", "done", r)
    assert progress.read("j1", r)["status"] == "done"
    assert progress.read("missing", r) == {}


def test_plan_and_artworks_end_to_end(db: Session, tmp_path: Path) -> None:
    seed(db)
    fetcher = FakeFetcher()
    storage = LocalStorage(tmp_path)
    p = plan(db, fetcher, SOURCES)
    assert p.counts["matched"] == 2
    assert db.scalar(select(func.count()).select_from(Species)) == 2
    owl = db.get(Species, "tyto-alba")
    assert owl is not None and owl.names["he"] == "תנשמת"

    faces = {"tyto-alba": {"fg": "left", "wb": "right"}}
    results = [
        artwork(db, storage, fetcher, SOURCES["styles"][style], style, m.slug, e, faces)
        for m in p.matches
        for style, e in m.files.items()
    ]
    db.commit()
    assert results == ["stored"] * 4
    rows = db.scalars(select(Artwork)).all()
    assert len(rows) == 4
    wb_owl = next(r for r in rows if r.species_id == "tyto-alba" and r.style_id == "wb")
    assert (wb_owl.faces, wb_owl.faces_source) == ("right", "manual")
    assert (wb_owl.width, wb_owl.height) == (120, 80)
    assert storage.exists(wb_owl.thumb_key) and storage.exists(wb_owl.image_key)
    bubo = next(r for r in rows if r.species_id == "bubo-bubo")
    assert bubo.faces is None  # unknown until the vision step

    # A second run downloads nothing for unchanged files.
    fetcher.raw_calls.clear()
    again = [
        artwork(db, storage, fetcher, SOURCES["styles"][style], style, m.slug, e, faces)
        for m in plan(db, fetcher, SOURCES).matches
        for style, e in m.files.items()
    ]
    assert again == ["skipped"] * 4
    assert fetcher.raw_calls == ["data/species.json"]
