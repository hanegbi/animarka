"""Match the art sets to species.json by scientific name slug, genus-species in lower case."""

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
    aliases: dict[str, dict[str, str]] | None = None,
) -> list[Match]:
    """Every species.json bird with art in at least one style, in taxonomic order.

    A bird keeps the styles it has: most have only field guide art. `aliases` maps, per style,
    a file's older scientific name to the species.json name, so a renamed bird gets its art;
    an exact name always wins over an alias. Files with no species.json entry (non-birds, merged
    species) are left out.
    """
    by_style = {style: files_by_slug(trees[style], patterns[style]) for style in patterns}
    for style, mapping in (aliases or {}).items():
        files = by_style.get(style)
        if files is None:
            continue
        for old, new in mapping.items():
            if old in files and new not in files:
                files[new] = files[old]
    meta = {slug_of(s["id"]): s for s in species}
    matches = []
    for slug, m in meta.items():
        found = {style: by_style[style][slug] for style in by_style if slug in by_style[style]}
        if found:
            matches.append(Match(slug, m, found))
    matches.sort(key=lambda m: (m.meta.get("taxonomy", {}).get("seq", 0), m.slug))
    return matches
