"""Catalog, styles, backgrounds and presets. All read only, all with ETag."""

from collections import defaultdict
from statistics import median
from typing import Annotated, Any

from animarka_core.db import get_session
from animarka_core.models import Artwork, Background, Catalog, Preset, Species, Style
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
    """Species that have active main art in every style, in taxonomic order."""
    style_ids = set((await session.scalars(select(Style.id))).all())
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
    return [
        (s, by_species[s.id]) for s in species if style_ids and set(by_species[s.id]) >= style_ids
    ]


@router.get("/catalogs/{catalog_id}/species", response_model=SpeciesList)
async def list_species(
    catalog_id: str,
    request: Request,
    session: Session,
    lang: Annotated[str, Query(description="Comma separated language codes")] = "en,he",
) -> Response:
    await require_catalog(session, catalog_id)
    langs = {code.strip() for code in lang.split(",")} & SUPPORTED_LANGS or {"en"}
    rows = await load_catalog(session, catalog_id)
    mass = fill_mass([s for s, _ in rows])
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
