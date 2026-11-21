"""Tables. See docs/PLAN.md, Data model."""

from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from animarka_core.db import Base


class Catalog(Base):
    __tablename__ = "catalogs"
    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(80))


class Species(Base):
    __tablename__ = "species"
    id: Mapped[str] = mapped_column(String(80), primary_key=True)  # genus-species slug
    catalog_id: Mapped[str] = mapped_column(ForeignKey("catalogs.id"), index=True)
    scientific_name: Mapped[str] = mapped_column(String(120))
    order: Mapped[str] = mapped_column(String(80))
    family: Mapped[str] = mapped_column(String(80), index=True)
    family_english: Mapped[str] = mapped_column(String(120))
    genus: Mapped[str] = mapped_column(String(80))
    seq: Mapped[int] = mapped_column(Integer, index=True)  # taxonomic order
    mass_g: Mapped[float | None] = mapped_column(Float)
    names: Mapped[dict[str, str]] = mapped_column(default=dict)  # language code to common name
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Style(Base):
    __tablename__ = "styles"
    id: Mapped[str] = mapped_column(String(16), primary_key=True)
    name: Mapped[str] = mapped_column(String(60))
    source_url: Mapped[str] = mapped_column(String(300))
    license: Mapped[str] = mapped_column(String(60))
    attribution: Mapped[str] = mapped_column(Text)
    sort: Mapped[int] = mapped_column(Integer, default=0)


class Artwork(Base):
    __tablename__ = "artworks"
    __table_args__ = (UniqueConstraint("species_id", "style_id", "pose"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    species_id: Mapped[str] = mapped_column(
        ForeignKey("species.id", ondelete="CASCADE"), index=True
    )
    style_id: Mapped[str] = mapped_column(ForeignKey("styles.id"))
    pose: Mapped[str] = mapped_column(String(16), default="main")  # main or flight
    source_path: Mapped[str] = mapped_column(String(300))
    source_sha: Mapped[str] = mapped_column(
        String(64)
    )  # git blob sha, so a rerun can skip unchanged files
    image_key: Mapped[str] = mapped_column(String(200))  # original, kept for print
    medium_key: Mapped[str] = mapped_column(String(200))
    thumb_key: Mapped[str] = mapped_column(String(200))
    print_key: Mapped[str | None] = mapped_column(String(200))  # upscaled master, M3
    width: Mapped[int] = mapped_column(Integer)  # trimmed original size
    height: Mapped[int] = mapped_column(Integer)
    faces: Mapped[str | None] = mapped_column(String(8))  # left, right, front, or unknown until M3
    faces_confidence: Mapped[float | None] = mapped_column(Float)
    faces_source: Mapped[str | None] = mapped_column(String(16))  # manual, model, human
    status: Mapped[str] = mapped_column(String(16), default="active")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Background(Base):
    __tablename__ = "backgrounds"
    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(60))
    kind: Mapped[str] = mapped_column(String(8))  # color or image
    color: Mapped[str] = mapped_column(String(16))
    image: Mapped[str | None] = mapped_column(String(200))
    image_full: Mapped[str | None] = mapped_column(String(200))
    is_dark: Mapped[bool] = mapped_column(default=False)
    ink: Mapped[str] = mapped_column(String(16))
    rule: Mapped[str] = mapped_column(String(40))
    sort: Mapped[int] = mapped_column(Integer, default=0)


class Preset(Base):
    __tablename__ = "presets"
    id: Mapped[str] = mapped_column(String(48), primary_key=True)
    catalog_id: Mapped[str] = mapped_column(ForeignKey("catalogs.id"))
    title: Mapped[str] = mapped_column(String(80))
    description: Mapped[str] = mapped_column(String(200), default="")
    species_ids: Mapped[list[str]] = mapped_column(default=list)
    sort: Mapped[int] = mapped_column(Integer, default=0)


class Poster(Base):
    __tablename__ = "posters"
    id: Mapped[str] = mapped_column(String(16), primary_key=True)
    state: Mapped[dict[str, Any]] = mapped_column()
    state_hash: Mapped[str] = mapped_column(String(64), unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Job(Base):
    __tablename__ = "jobs"
    __table_args__ = (UniqueConstraint("type", "input_hash"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    type: Mapped[str] = mapped_column(String(32))
    status: Mapped[str] = mapped_column(
        String(16), default="queued"
    )  # queued, running, done, failed
    progress: Mapped[float] = mapped_column(Float, default=0.0)
    input_hash: Mapped[str] = mapped_column(String(64))
    result: Mapped[dict[str, Any] | None] = mapped_column()
    error: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Report(Base):
    __tablename__ = "reports"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    species_id: Mapped[str] = mapped_column(
        ForeignKey("species.id", ondelete="CASCADE"), index=True
    )
    style_id: Mapped[str | None] = mapped_column(ForeignKey("styles.id"))
    note: Mapped[str] = mapped_column(String(500), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
