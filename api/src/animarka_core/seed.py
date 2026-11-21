"""Seed the small data tables from api/data/*.json.

Safe to run any number of times: rows are upserted by id.
Run: uv run python -m animarka_core.seed"""

import json
from pathlib import Path
from typing import Any

from sqlalchemy.orm import Session

from animarka_core.db import sync_session
from animarka_core.models import Background, Catalog, Preset, Style

DATA = Path(__file__).resolve().parents[2] / "data"


def load(name: str) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = json.loads((DATA / f"{name}.json").read_text(encoding="utf-8"))
    return rows


def seed(session: Session) -> dict[str, int]:
    counts: dict[str, int] = {}
    for name, model in (
        ("catalogs", Catalog),
        ("styles", Style),
        ("backgrounds", Background),
        ("presets", Preset),
    ):
        rows = load(name)
        for row in rows:
            session.merge(model(**row))
        counts[name] = len(rows)
    return counts


def main() -> None:
    with sync_session() as session:
        print(seed(session))


if __name__ == "__main__":
    main()
