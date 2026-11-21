import { BACKGROUNDS } from "./backgrounds";
import { SPECIES } from "./static-m1";
import type { CatalogLookup } from "@/poster/state/types";

/** Catalog lookup backed by the M1 static data. M2 swaps this for the API. */
export function staticLookup(): CatalogLookup {
  const byId = new Map(SPECIES.map((s) => [s.id, s]));
  const ids = SPECIES.map((s) => s.id);
  return {
    has: (id) => byId.has(id),
    family: (id) => byId.get(id)?.family ?? null,
    faces: (id, style) => {
      const art = byId.get(id)?.art;
      if (!art) return "left";
      return style === "wb" ? art.wb.faces : art.fg.faces;
    },
    ids: () => ids,
  };
}

export const STYLE_IDS = ["fg", "wb"];
export const BACKGROUND_IDS = BACKGROUNDS.map((b) => b.id);
