import { centerpieceLayout } from "./centerpiece";
import { gridLayout } from "./grid";
import { scatterLayout } from "./scatter";
import type { LayoutId } from "@/poster/state/types";
import type { LayoutFn, LayoutInput, LayoutResult } from "./types";

/** One interface, one function per layout. A fourth layout is a new entry here. */
export const LAYOUT_FUNCTIONS: Record<LayoutId, LayoutFn> = {
  scatter: scatterLayout,
  grid: gridLayout,
  centerpiece: centerpieceLayout,
};

export function computeLayout(id: LayoutId, input: LayoutInput): LayoutResult {
  return LAYOUT_FUNCTIONS[id](input);
}

export type {
  Box,
  Frame,
  LayoutAnimal,
  LayoutInput,
  LayoutResult,
  Placed,
} from "./types";
export { frameAspect } from "./sizing";
