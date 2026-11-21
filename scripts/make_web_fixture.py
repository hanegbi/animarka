"""Write the web test catalog from a running API: web/src/catalog/fixture/catalog.json.

It is a slice of the real API response: the 118 prototype birds (scripts/fixture_ids.json)
plus every bird in a preset, so tests, design pages and the Playwright mocks all see real
data without an API.
Run after an ingest: uv run python scripts/make_web_fixture.py [api origin]
"""

import json
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "web" / "src" / "catalog" / "fixture" / "catalog.json"


def get(origin: str, path: str) -> object:
    with urllib.request.urlopen(f"{origin}{path}", timeout=60) as res:
        return json.load(res)


def main() -> None:
    origin = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
    species = get(origin, "/api/v1/catalogs/birds/species?lang=en,he")
    presets = get(origin, "/api/v1/catalogs/birds/presets")
    assert isinstance(species, dict) and isinstance(presets, list)
    keep = set(json.loads((ROOT / "scripts" / "fixture_ids.json").read_text()))
    for p in presets:
        keep |= set(p["ids"])
    rows = [s for s in species["species"] if s["id"] in keep]
    missing = keep - {s["id"] for s in rows}
    if missing:
        sys.exit(f"not in the API yet, run the ingest first: {sorted(missing)[:10]}")
    out = {"species": {**species, "count": len(rows), "species": rows}, "presets": presets}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{len(rows)} species, {len(presets)} presets -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
