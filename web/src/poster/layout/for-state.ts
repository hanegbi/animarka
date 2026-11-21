import type { SpeciesView } from "@/catalog/species-view";
import type { PosterState } from "@/poster/state/types";
import { computeLayout } from "./index";
import { frameAspect } from "./sizing";
import type { LayoutInput, LayoutResult } from "./types";

/** Build the layout input for a saved poster. The browser and the print render both call this. */
export function layoutInputFor(
  state: PosterState,
  species: Map<string, SpeciesView>,
): LayoutInput {
  const animals = state.order.flatMap((id) => {
    const s = species.get(id);
    return s ? [{ id, massG: s.massG, aspect: s.aspect }] : [];
  });
  return {
    animals,
    frameAspect: frameAspect(state.size, state.orientation),
    labels: state.labels,
    seed: state.seed,
    center: state.center,
  };
}

export function layoutForState(
  state: PosterState,
  species: Map<string, SpeciesView>,
): LayoutResult {
  return computeLayout(state.layout, layoutInputFor(state, species));
}
