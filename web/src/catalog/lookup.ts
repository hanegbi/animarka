import { BACKGROUNDS } from "./backgrounds";
import type { SpeciesView } from "./species-view";
import type { CatalogLookup } from "@/poster/state/types";

/**
 * A catalog lookup whose birds can be swapped later (`set`), so a store made from the first,
 * partial catalog sees the full one when it arrives. Plain JavaScript, outside React.
 */
export function liveLookup(views: Map<string, SpeciesView>) {
  let current = views;
  let ids = [...views.keys()];
  const lookup: CatalogLookup = {
    has: (id) => current.has(id),
    family: (id) => current.get(id)?.family ?? null,
    faces: (id, style) => {
      const art = current.get(id)?.art;
      // A bird with one style faces the way its own art does.
      return (art?.[style] ?? Object.values(art ?? {})[0])?.faces ?? "left";
    },
    ids: () => ids,
  };
  return {
    lookup,
    set(next: Map<string, SpeciesView>) {
      current = next;
      ids = [...next.keys()];
    },
  };
}

/** Catalog lookup over the loaded species views, in catalog order. */
export function viewLookup(views: Map<string, SpeciesView>): CatalogLookup {
  return liveLookup(views).lookup;
}

export const STYLE_IDS = ["fg", "wb"];
export const BACKGROUND_IDS = BACKGROUNDS.map((b) => b.id);
