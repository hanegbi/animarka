import type { LegendPlan } from "./types";

export const LEGEND_MAX_FONT = 2;
/** Average characters in "12 Eurasian Eagle-Owl", for fitting a column. */
const CHARS_PER_ENTRY = 11;
const ROW_FACTOR = 1.4;
const PAD_FACTOR = 0.6;
/** The legend may take at most this share of the poster height. */
export const LEGEND_MAX_SHARE = 0.3;

/** Columns allowed for a poster shape. Portrait grows from 3 to 5, wide posters may use more. */
export function legendColumnRange(frameAspect: number): number[] {
  return frameAspect >= 1 ? [3, 4, 5, 6, 7, 8] : [3, 4, 5];
}

/**
 * Plan the numbers legend at the foot of the poster. Picks the column count that gives the largest
 * type, preferring fewer columns on a tie. Type shrinks as the count grows.
 */
export function planLegend(
  count: number,
  width: number,
  height: number,
  frameAspect: number,
  margin: number,
): LegendPlan {
  const inner = width - 2 * margin;
  const budget = height * LEGEND_MAX_SHARE;
  let best: { cols: number; rows: number; font: number } | null = null;
  for (const cols of legendColumnRange(frameAspect)) {
    const rows = Math.max(1, Math.ceil(count / cols));
    const font = Math.min(
      LEGEND_MAX_FONT,
      inner / cols / CHARS_PER_ENTRY,
      budget / (rows * ROW_FACTOR + PAD_FACTOR),
    );
    if (!best || font > best.font + 0.01) best = { cols, rows, font };
  }
  const { cols, rows, font } = best!;
  const h = rows * ROW_FACTOR * font + PAD_FACTOR * font;
  return {
    cols,
    rows,
    font,
    rowHeight: ROW_FACTOR * font,
    box: { x: margin, y: height - margin - h, w: inner, h },
  };
}
