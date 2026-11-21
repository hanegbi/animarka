import type { CatalogLookup, PosterState } from "./types";

/**
 * Effective mirror = user mirror XOR (style faces right).
 * The poster baseline is art looking left. Art that faces right is flipped to match.
 * Front facing art is never flipped automatically.
 */
export function effectiveMirror(
  state: Pick<PosterState, "flip" | "style">,
  id: string,
  catalog: CatalogLookup,
): boolean {
  const auto = catalog.faces(id, state.style) === "right";
  return Boolean(state.flip[id]) !== auto;
}

/** Which way the poster's birds look: all left (the default), all right, or a mix. */
export function facing(
  state: Pick<PosterState, "flip" | "order">,
): "left" | "right" | "mixed" {
  const turned = state.order.filter((id) => state.flip[id]).length;
  if (turned === 0) return "left";
  if (turned === state.order.length) return "right";
  return "mixed";
}
