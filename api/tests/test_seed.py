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
