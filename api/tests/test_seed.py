from animarka_core.models import Background, Catalog, Preset, Style
from animarka_core.seed import load, seed
from sqlalchemy import func, select
from sqlalchemy.orm import Session


def count(db: Session, model: type) -> int:
    return db.scalar(select(func.count()).select_from(model)) or 0


def test_seed_fills_the_small_tables(db: Session) -> None:
    seed(db)
    db.commit()
    assert count(db, Catalog) == 1
    assert count(db, Style) == 2
    assert count(db, Background) == 8
    assert count(db, Preset) == len(load("presets"))


def test_seed_twice_changes_nothing(db: Session) -> None:
    seed(db)
    db.commit()
    seed(db)
    db.commit()
    assert count(db, Style) == 2
    assert count(db, Background) == 8


def test_backgrounds_keep_the_dark_flag_and_ink(db: Session) -> None:
    seed(db)
    db.commit()
    forest = db.get(Background, "forest")
    assert forest is not None and forest.is_dark and forest.kind == "image"
    cream = db.get(Background, "cream")
    assert cream is not None and not cream.is_dark and cream.image is None


def test_every_preset_species_is_in_the_matched_catalog() -> None:
    import json
    from pathlib import Path

    matched = set(json.loads((Path(__file__).parents[1] / "data" / "matched.json").read_text()))
    assert len(matched) == 1161
    for preset in load("presets"):
        ids = preset["species_ids"]
        assert 2 <= len(ids) <= 150, preset["id"]
        assert len(ids) == len(set(ids)), preset["id"]
        assert set(ids) <= matched, (preset["id"], set(ids) - matched)


def test_seed_removes_presets_dropped_from_the_file(db: Session) -> None:
    seed(db)
    db.add(Preset(id="old-list", catalog_id="birds", title="Old", species_ids=[]))
    db.commit()
    seed(db)
    db.commit()
    assert db.get(Preset, "old-list") is None
