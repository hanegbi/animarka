import { BACKGROUNDS } from "./backgrounds";
import type { SpeciesView } from "./species-view";
import type { CatalogLookup } from "@/poster/state/types";

/** Catalog lookup over the loaded species views, in catalog order. */
export function viewLookup(views: Map<string, SpeciesView>): CatalogLookup {
  const ids = [...views.keys()];
  return {
    has: (id) => views.has(id),
    family: (id) => views.get(id)?.family ?? null,
    faces: (id, style) => views.get(id)?.art[style]?.faces ?? "left",
    ids: () => ids,
  };
}

export const STYLE_IDS = ["fg", "wb"];
export const BACKGROUND_IDS = BACKGROUNDS.map((b) => b.id);
