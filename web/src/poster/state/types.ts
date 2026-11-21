export type Faces = "left" | "right" | "front";
export type LabelMode = "names" | "legend" | "none";
export type LayoutId = "scatter" | "grid" | "centerpiece";
export type Lang = "en" | "he";
export type Orientation = "portrait" | "landscape";

/** Poster shapes. Ratios are width over height in portrait. */
// The A series shape was removed in R8. A saved poster with it falls back to 3:4.
export const SIZES = ["3:4", "2:3", "4:5"] as const;
/** The most birds one poster holds. Every layout is tested up to this count. */
export const MAX_BIRDS = 150;

export type SizeId = (typeof SIZES)[number];

export const LABEL_MODES: LabelMode[] = ["names", "legend", "none"];
export const LAYOUTS: LayoutId[] = ["scatter", "grid", "centerpiece"];
export const LANGS: Lang[] = ["en", "he"];
export const ORIENTATIONS: Orientation[] = ["portrait", "landscape"];

/** The saved poster. Everything that must reopen identically lives here. */
export type PosterState = {
  v: 1;
  catalog: "birds";
  /** Species slugs in poster order. */
  order: string[];
  /** Species the user mirrored. */
  flip: Record<string, true>;
  /** Centerpiece override. Empty means the heaviest species. */
  center?: string;
  seed: number;
  title: string;
  /** True until the user edits the title. The title then follows the selection. */
  titleAuto: boolean;
  labels: LabelMode;
  lang: Lang;
  style: string;
  bg: string;
  layout: LayoutId;
  size: SizeId;
  orientation: Orientation;
};

/** What the state layer needs to know about the catalog. Keeps the reducer pure. */
export interface CatalogLookup {
  has(id: string): boolean;
  /** Family name used for the automatic title. */
  family(id: string): string | null;
  /** Which way the art looks in the given style. */
  faces(id: string, style: string): Faces;
  /** Every species id, in catalog order. */
  ids(): string[];
}

export type PosterContext = {
  catalog: CatalogLookup;
  /** Valid style ids, first is the default. */
  styles: string[];
  /** Valid background ids, first is the default. */
  backgrounds: string[];
};

export type PosterAction =
  | { type: "toggle"; id: string }
  | { type: "addMany"; ids: string[] }
  | { type: "removeMany"; ids: string[] }
  | { type: "replaceWith"; ids: string[] }
  | { type: "clear" }
  | { type: "surprise"; seed: number }
  /** `center` hands the centerpiece spot to another bird in the same step. */
  | { type: "swap"; a: string; b: string; center?: string }
  /** Turn every bird to look the same way. */
  | { type: "faceAll"; dir: "left" | "right" }
  | { type: "move"; id: string; delta: number }
  | { type: "mirror"; id: string }
  | { type: "shuffle"; seed: number }
  | { type: "setStyle"; style: string }
  | { type: "setLabels"; labels: LabelMode }
  | { type: "setLayout"; layout: LayoutId }
  | { type: "setBg"; bg: string }
  | { type: "setSize"; size: SizeId }
  | { type: "setOrientation"; orientation: Orientation }
  | { type: "setLang"; lang: Lang }
  | { type: "setTitle"; title: string }
  | { type: "setCenter"; id: string | undefined };
