"""The ingest steps as plain functions. The Celery tasks in tasks/ingest.py only call these.

plan():   read species.json and both file listings, match, write species rows.
artwork(): fetch one image, make its sizes, store them, upsert its row. Skips unchanged files.
"""

import hashlib
import json
import logging
from dataclasses import dataclass
from typing import Any

from animarka_core.models import Artwork, Species
from animarka_core.storage import Storage
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from animarka_workers.ingest.catalog import species_row
from animarka_workers.ingest.images import process
from animarka_workers.ingest.match import Match, match_species
from animarka_workers.ingest.sources import Fetcher, TreeEntry, load_aliases

log = logging.getLogger(__name__)


@dataclass(frozen=True)
class Plan:
    matches: list[Match]
    counts: dict[str, int]  # files found per style, and the matched total


def plan(session: Session, fetcher: Fetcher, sources: dict[str, Any]) -> Plan:
    meta_src = sources["species_json"]
    species = json.loads(fetcher.raw(meta_src["repo"], meta_src["ref"], meta_src["path"]))
    species_list: list[dict[str, Any]] = species["species"]
    styles: dict[str, Any] = sources["styles"]
    trees = {sid: fetcher.tree(s["repo"], s["ref"]) for sid, s in styles.items()}
    matches = match_species(
        species_list, trees, {sid: s["pattern"] for sid, s in styles.items()}, load_aliases()
    )

    rows = [species_row(m.slug, m.meta) for m in matches]
    for i in range(0, len(rows), 500):
        chunk = rows[i : i + 500]
        stmt = insert(Species).values(chunk)
        cols = {c: stmt.excluded[c] for c in chunk[0] if c != "id"}
        session.execute(stmt.on_conflict_do_update(index_elements=["id"], set_=cols))
    session.flush()

    counts = {f"files_{sid}": len(t) for sid, t in trees.items()}
    counts["species_json"] = len(species_list)
    counts["matched"] = len(matches)
    for sid in styles:
        counts[f"with_{sid}"] = sum(1 for m in matches if sid in m.files)
    log.info("ingest plan: %s", counts)
    return Plan(matches, counts)


def art_keys(style: str, slug: str, digest: str) -> dict[str, str]:
    base = f"art/{style}/{slug}/{digest[:10]}"
    return {"image": f"{base}.webp", "medium": f"{base}-640.webp", "thumb": f"{base}-200.webp"}


def artwork(
    session: Session,
    storage: Storage,
    fetcher: Fetcher,
    source: dict[str, Any],
    style: str,
    slug: str,
    entry: TreeEntry,
    manual_faces: dict[str, dict[str, str]],
) -> str:
    """Returns 'skipped' when the file is unchanged since the last run, else 'stored'."""
    existing = session.scalar(
        select(Artwork).where(
            Artwork.species_id == slug, Artwork.style_id == style, Artwork.pose == "main"
        )
    )
    if existing and existing.source_sha == entry.sha and storage.exists(existing.thumb_key):
        return "skipped"

    data = fetcher.raw(source["repo"], source["ref"], entry.path)
    out = process(data)
    keys = art_keys(style, slug, hashlib.sha256(out.original).hexdigest())
    storage.put(keys["image"], out.original)
    storage.put(keys["medium"], out.medium)
    storage.put(keys["thumb"], out.thumb)

    faces = manual_faces.get(slug, {}).get(style)
    row = existing or Artwork(species_id=slug, style_id=style, pose="main")
    row.source_path = entry.path
    row.source_sha = entry.sha
    row.image_key = keys["image"]
    row.medium_key = keys["medium"]
    row.thumb_key = keys["thumb"]
    row.width = out.width
    row.height = out.height
    row.status = "active"
    # Hand-checked directions from M1 win. The rest stay unknown until the vision step in M3.
    if faces:
        row.faces, row.faces_confidence, row.faces_source = faces, 1.0, "manual"
    elif row.faces_source != "human":
        row.faces, row.faces_confidence, row.faces_source = None, None, None
    session.add(row)
    session.flush()
    return "stored"
