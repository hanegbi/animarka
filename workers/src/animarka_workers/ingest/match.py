"""Match the two art sets by scientific name slug, genus-species in lower case."""

import re
from dataclasses import dataclass
from typing import Any

from animarka_workers.ingest.sources import TreeEntry


@dataclass(frozen=True)
class Match:
    slug: str
    meta: dict[str, Any]  # the species.json entry
    files: dict[str, TreeEntry]  # style id to its file


def slug_of(species_id: str) -> str:
    """species.json ids look like Tyto_alba. The slug is tyto-alba."""
    return species_id.lower().replace("_", "-")


def files_by_slug(tree: list[TreeEntry], pattern: str) -> dict[str, TreeEntry]:
    rx = re.compile(pattern)
    out: dict[str, TreeEntry] = {}
    for entry in tree:
        m = rx.match(entry.path)
        if m:
            out[f"{m.group('genus').lower()}-{m.group('species').lower()}"] = entry
    return out


def match_species(
    species: list[dict[str, Any]],
    trees: dict[str, list[TreeEntry]],
    patterns: dict[str, str],
) -> list[Match]:
    """Species that have art in every style and an entry in species.json, in taxonomic order."""
    by_style = {style: files_by_slug(trees[style], patterns[style]) for style in patterns}
    meta = {slug_of(s["id"]): s for s in species}
    common = set(meta)
    for files in by_style.values():
        common &= set(files)
    matches = [
        Match(slug, meta[slug], {style: by_style[style][slug] for style in by_style})
        for slug in common
    ]
    matches.sort(key=lambda m: (m.meta.get("taxonomy", {}).get("seq", 0), m.slug))
    return matches
