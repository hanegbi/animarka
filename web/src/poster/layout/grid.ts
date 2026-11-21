import { placeInRows } from "./cells";
import type { LayoutFn } from "./types";

/** Straight rows and columns, evenly spaced, like a classic field guide chart. The last row is centered. */
export const gridLayout: LayoutFn = (input) =>
  placeInRows(input, { brick: false, jitter: 0, fill: 0.92 });
