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
