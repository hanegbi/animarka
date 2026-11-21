import { SPECIES } from "./static-m1";
import type { Lang } from "@/poster/state/types";

/** What the poster needs to draw one species. M2 builds the same shape from the API. */
export type SpeciesView = {
  id: string;
  name: string;
  /** Names by language. English is the fallback. */
  names: Partial<Record<Lang, string>>;
  /** Scientific name. */
  sci: string;
  family: string;
  /** Use another species' art file. Only for synthetic test posters. */
  artId?: string;
  massG: number;
  /**
   * Width over height of the art box. One box per species for both styles, so a style switch keeps
   * place and size. It is the mean of the styles' own aspects, and art is fitted inside it.
   */
  aspect: number;
};

export function artSrc(style: string, id: string): string {
  return `/art/${style}/${id}.webp`;
}

export function displayName(s: SpeciesView, lang: Lang): string {
  return s.names[lang] ?? s.name;
}

export function staticSpeciesViews(): Map<string, SpeciesView> {
  return new Map(
    SPECIES.map((s) => [
      s.id,
      {
        id: s.id,
        name: s.name,
        names: { en: s.name },
        sci: s.sci,
        family: s.family,
        massG: s.massG,
        aspect: (s.art.fg.w / s.art.fg.h + s.art.wb.w / s.art.wb.h) / 2,
      },
    ]),
  );
}
