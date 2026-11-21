"""Response and request bodies. Field names match the web types (camelCase on the wire)."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

Faces = Literal["left", "right", "front"]


class Wire(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class Art(Wire):
    thumb: str
    medium: str
    w: int
    h: int
    faces: Faces
    faces_known: bool  # false while faces is the M2 default, before the vision step


class SpeciesOut(Wire):
    id: str
    sci: str
    names: dict[str, str]
    family: str  # English family name, used for chips
    family_sci: str
    order: str
    seq: int
    mass_g: float
    mass_estimated: bool
    art: dict[str, Art]


class SpeciesList(Wire):
    catalog: str
    count: int
    species: list[SpeciesOut]


class FamilyOut(Wire):
    id: str
    name: str
    count: int


class StyleOut(Wire):
    id: str
    name: str
    source_url: str
    license: str
    attribution: str


class BackgroundOut(Wire):
    id: str
    name: str
    kind: Literal["color", "image"]
    color: str
    image: str | None
    image_full: str | None
    is_dark: bool
    ink: str
    rule: str


class PresetOut(Wire):
    id: str
    title: str
    description: str
    ids: list[str]


class ReportIn(Wire):
    species_id: str = Field(min_length=1, max_length=80)
    style_id: str | None = Field(default=None, max_length=16)
    note: str = Field(default="", max_length=500)


class ReportOut(Wire):
    id: int


class PosterState(BaseModel):
    """The saved poster, as the web stores it. Unknown keys are kept, sizes are bounded."""

    model_config = ConfigDict(extra="allow")
    v: Literal[1]
    catalog: Literal["birds"]
    order: list[str] = Field(max_length=150)
    flip: dict[str, bool] = Field(default_factory=dict)
    center: str | None = None
    seed: int = 0
    title: str = Field(default="", max_length=32)
    titleAuto: bool = True  # noqa: N815 (wire name from the web)
    labels: Literal["names", "legend", "none"]
    lang: Literal["en", "he"]
    style: str = Field(max_length=16)
    bg: str = Field(max_length=32)
    layout: Literal["scatter", "grid", "centerpiece"]
    size: Literal["3:4", "2:3", "4:5"]
    orientation: Literal["portrait", "landscape"] = "portrait"


class PosterIn(BaseModel):
    state: PosterState


class PosterOut(BaseModel):
    id: str
    url: str


class PosterStateOut(BaseModel):
    id: str
    state: dict[str, object]


class JobOut(Wire):
    id: str
    type: str
    status: str
    progress: float
    result: dict[str, object] | None = None
    error: str | None = None
