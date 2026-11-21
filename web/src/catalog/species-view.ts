import type { ApiSpecies } from "./api";
import type { Faces, Lang } from "@/poster/state/types";

export type ArtView = { thumb: string; medium: string; faces: Faces };

/** What the poster and the picker need to draw one species. Built from the catalog API. */
export type SpeciesView = {
  id: string;
  name: string;
  /** Names by language. English is the fallback. */
  names: Partial<Record<Lang, string>>;
  /** Scientific name. */
  sci: string;
  /** English family name, used for the chips and the automatic title. */
  family: string;
  massG: number;
  /**
   * Width over height of the art box. One box per species for both styles, so a style switch keeps
   * place and size. It is the mean of the styles' own aspects, and art is fitted inside it.
   */
  aspect: number;
  /** Art per style id. */
  art: Record<string, ArtView>;
};

export type ArtSize = "thumb" | "medium";

export function artSrc(
  s: SpeciesView,
  style: string,
  size: ArtSize = "medium",
): string {
  const art = s.art[style] ?? Object.values(s.art)[0];
  return art ? art[size] : "";
}

export function displayName(s: SpeciesView, lang: Lang): string {
  return s.names[lang] ?? s.name;
}

export function toView(s: ApiSpecies): SpeciesView {
  const arts = Object.values(s.art);
  const aspect = arts.length
    ? arts.reduce((a, x) => a + x.w / x.h, 0) / arts.length
    : 1;
  const names: Partial<Record<Lang, string>> = {};
  if (s.names.en) names.en = s.names.en;
  if (s.names.he) names.he = s.names.he;
  return {
    id: s.id,
    name: s.names.en ?? s.sci,
    names,
    sci: s.sci,
    family: s.family,
    massG: s.massG,
    aspect,
    art: Object.fromEntries(
      Object.entries(s.art).map(([style, a]) => [
        style,
        { thumb: a.thumb, medium: a.medium, faces: a.faces },
      ]),
    ),
  };
}
