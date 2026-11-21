import { placeInRows } from "./cells";
import type { LayoutFn } from "./types";

/**
 * Loose and hand placed. Rows alternate between full and one short, so neighbours sit half a cell
 * apart, and each animal drifts inside its own cell by a seeded amount. Same seed, same poster.
 */
export const scatterLayout: LayoutFn = (input) =>
  placeInRows(input, { brick: true, jitter: 0.9, fill: 0.9 });
