"""Catalog, styles, backgrounds and presets. All read only, all with ETag."""

from collections import defaultdict
from statistics import median
from typing import Annotated, Any

from animarka_core.db import get_session
from animarka_core.models import Artwork, Background, Catalog, Preset, Species, Style
from animarka_core.settings import get_settings
from animarka_core.storage import get_storage
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from animarka_api.etag import etag_json
from animarka_api.schemas import (
    Art,
    BackgroundOut,
    FamilyOut,
    PresetOut,
    SpeciesList,
    SpeciesOut,
    StyleOut,
)

router = APIRouter(prefix="/api/v1")
Session = Annotated[AsyncSession, Depends(get_session)]
DEFAULT_FACES = "left"  # until the vision step in M3, see docs/PLAN.md M2
SUPPORTED_LANGS = {"en", "he"}


async def require_catalog(session: AsyncSession, catalog_id: str) -> None:
    if await session.get(Catalog, catalog_id) is None:
        raise HTTPException(404, "No such catalog")


def fill_mass(rows: list[Species]) -> dict[str, tuple[float, bool]]:
    """Mass per species. Missing ones take their family median, then the catalog median."""
    known = [r.mass_g for r in rows if r.mass_g]
    overall = median(known) if known else 100.0
    by_family: dict[str, list[float]] = defaultdict(list)
    for r in rows:
        if r.mass_g:
            by_family[r.family].append(r.mass_g)
    out: dict[str, tuple[float, bool]] = {}
    for r in rows:
        if r.mass_g:
            out[r.id] = (r.mass_g, False)
        else:
            fam = by_family.get(r.family)
            out[r.id] = (round(median(fam) if fam else overall, 1), True)
    return out


async def load_catalog(
    session: AsyncSession, catalog_id: str
) -> list[tuple[Species, dict[str, Artwork]]]:
    """Species with active main art in at least one style, in taxonomic order. Most birds have
    field guide art only; a poster shows each bird in the art it has."""
    species = (
        await session.scalars(
            select(Species)
            .where(Species.catalog_id == catalog_id)
            .order_by(Species.seq, Species.id)
        )
    ).all()
    arts = (
        await session.scalars(
            select(Artwork)
            .join(Species, Species.id == Artwork.species_id)
            .where(
                Species.catalog_id == catalog_id, Artwork.pose == "main", Artwork.status == "active"
            )
        )
    ).all()
    by_species: dict[str, dict[str, Artwork]] = defaultdict(dict)
    for a in arts:
        by_species[a.species_id][a.style_id] = a
    return [(s, by_species[s.id]) for s in species if by_species[s.id]]


def art_hash(medium_key: str) -> str:
    """The part of an art key that changes with the file: art/{style}/{id}/{hash}-640.webp."""
    return medium_key.rsplit("/", 1)[-1].removesuffix("-640.webp")


def compact(
    catalog_id: str,
    rows: list[tuple[Species, dict[str, Artwork]]],
    mass: dict[str, tuple[float, bool]],
    langs: set[str],
) -> dict[str, Any]:
    """The whole catalog in one small document (about 11,000 birds).

    species rows: [id, english, hebrew or 0, family index, mass in grams, 1 if mass is estimated,
    field guide art, woodblock art], where art is 0 when the bird has none in that style, else
    [width, height, hash, faces (0 left, 1 right), 1 if faces is known]. Image URLs are rebuilt
    from `files`: {files}art/{style}/{id}/{hash}-640.webp and -200.webp. The scientific name is
    the id with a capital and a space. Same order as the full form: taxonomic.
    """
    families: dict[str, int] = {}
    fam_rows: list[list[str]] = []
    out: list[list[Any]] = []
    for s, arts in rows:
        if s.family not in families:
            families[s.family] = len(fam_rows)
            fam_rows.append([s.family, s.family_english])
        m, estimated = mass[s.id]

        def art(style: str, arts: dict[str, Artwork] = arts) -> Any:
            a = arts.get(style)
            if a is None:
                return 0
            faces = a.faces or DEFAULT_FACES
            return [
                a.width,
                a.height,
                art_hash(a.medium_key),
                1 if faces == "right" else 0,
                0 if a.faces is None else 1,
            ]

        out.append(
            [
                s.id,
                s.names.get("en") if "en" in langs else s.names.get(next(iter(langs)), ""),
                (s.names.get("he") or 0) if "he" in langs else 0,
                families[s.family],
                round(m) if m >= 10 else m,
                1 if estimated else 0,
                art("fg"),
                art("wb"),
            ]
        )
    return {
        "v": 2,
        "catalog": catalog_id,
        "count": len(out),
        "files": get_settings().files_url_prefix.rstrip("/") + "/",
        "families": fam_rows,
        "species": out,
    }


@router.get("/catalogs/{catalog_id}/species", response_model=SpeciesList)
async def list_species(
    catalog_id: str,
    request: Request,
    session: Session,
    lang: Annotated[str, Query(description="Comma separated language codes")] = "en,he",
    format: Annotated[
        str, Query(description="full (default) or compact: one short row per bird")
    ] = "full",
) -> Response:
    await require_catalog(session, catalog_id)
    langs = {code.strip() for code in lang.split(",")} & SUPPORTED_LANGS or {"en"}
    rows = await load_catalog(session, catalog_id)
    mass = fill_mass([s for s, _ in rows])
    if format == "compact":
        return etag_json(request, compact(catalog_id, rows, mass, langs))
    storage = get_storage()
    out: list[SpeciesOut] = []
    for s, arts in rows:
        names: dict[str, Any] = {k: v for k, v in s.names.items() if k in langs}
        m, estimated = mass[s.id]
        out.append(
            SpeciesOut(
                id=s.id,
                sci=s.scientific_name,
                names=names,
                family=s.family_english,
                family_sci=s.family,
                order=s.order,
                seq=s.seq,
                mass_g=m,
                mass_estimated=estimated,
                art={
                    style: Art(
                        thumb=storage.url(a.thumb_key),
                        medium=storage.url(a.medium_key),
                        w=a.width,
                        h=a.height,
                        faces=a.faces or DEFAULT_FACES,  # until M3
                        faces_known=a.faces is not None,
                    )
                    for style, a in sorted(arts.items())
                },
            )
        )
    return etag_json(request, SpeciesList(catalog=catalog_id, count=len(out), species=out))


@router.get("/catalogs/{catalog_id}/families", response_model=list[FamilyOut])
async def list_families(catalog_id: str, request: Request, session: Session) -> Response:
    await require_catalog(session, catalog_id)
    counts: dict[str, FamilyOut] = {}
    for s, _ in await load_catalog(session, catalog_id):
        f = counts.setdefault(s.family, FamilyOut(id=s.family, name=s.family_english, count=0))
        f.count += 1
    return etag_json(request, list(counts.values()))


@router.get("/catalogs/{catalog_id}/presets", response_model=list[PresetOut])
async def list_presets(catalog_id: str, request: Request, session: Session) -> Response:
    await require_catalog(session, catalog_id)
    rows = (
        await session.scalars(
            select(Preset).where(Preset.catalog_id == catalog_id).order_by(Preset.sort, Preset.id)
        )
    ).all()
    out = [
        PresetOut(id=p.id, title=p.title, description=p.description, ids=p.species_ids)
        for p in rows
    ]
    return etag_json(request, out)


@router.get("/styles", response_model=list[StyleOut])
async def list_styles(request: Request, session: Session) -> Response:
    rows = (await session.scalars(select(Style).order_by(Style.sort, Style.id))).all()
    out = [
        StyleOut(
            id=s.id,
            name=s.name,
            source_url=s.source_url,
            license=s.license,
            attribution=s.attribution,
        )
        for s in rows
    ]
    return etag_json(request, out)


@router.get("/backgrounds", response_model=list[BackgroundOut])
async def list_backgrounds(request: Request, session: Session) -> Response:
    rows = (
        await session.scalars(select(Background).order_by(Background.sort, Background.id))
    ).all()
    out = [
        BackgroundOut(
            id=b.id,
            name=b.name,
            kind=b.kind,
            color=b.color,
            image=b.image,
            image_full=b.image_full,
            is_dark=b.is_dark,
            ink=b.ink,
            rule=b.rule,
        )
        for b in rows
    ]
    return etag_json(request, out)
