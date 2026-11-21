"""Turn a species.json entry into a species row."""

from typing import Any

LANGS = ("en", "he")  # launch languages, see PRD 6.5


def species_row(slug: str, meta: dict[str, Any], catalog_id: str = "birds") -> dict[str, Any]:
    tax = meta.get("taxonomy", {})
    names_all = meta.get("names", {})
    names = {lang: names_all[lang] for lang in LANGS if names_all.get(lang)}
    if "en" not in names:
        names["en"] = meta.get("scientificName", slug)
    mass = (meta.get("traits") or {}).get("massG")
    return {
        "id": slug,
        "catalog_id": catalog_id,
        "scientific_name": meta.get("scientificName", slug),
        "order": tax.get("order", ""),
        "family": tax.get("family", ""),
        "family_english": tax.get("familyEnglish") or tax.get("family", ""),
        "genus": tax.get("genus", ""),
        "seq": int(tax.get("seq", 0)),
        "mass_g": float(mass) if isinstance(mass, (int, float)) and mass > 0 else None,
        "names": names,
    }
