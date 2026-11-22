import { hash01 } from "@/poster/state/random";
import type { LabelMode } from "@/poster/state/types";
import { labelFont, labelReserve, smallCountCap } from "./cells";
import { computeFrame } from "./frame";
import { fitBox, massRel } from "./sizing";
import type { Box, LayoutFn, LayoutResult, Placed } from "./types";

/**
 * Scattered (B6): loose and hand placed, with no rows and no empty bands, packed as tight as a grid.
 *
 * A masonry of columns. Each slot gets a seeded height, so the poster has real big and small
 * places, and slots go to the shortest column, so every column ends near the bottom. Each column's
 * spare height is shared out unevenly between its gaps (above, between and below its birds), so
 * tops and bottoms never line up across columns: no rows, and no band wider than one gap. Inside
 * its column a bird drifts a little to the side, its label right under it.
 *
 * Slots depend only on the seed, the count, the label mode and the poster shape, and are cached, so
 * swapping two birds moves only those two, and mirroring or renaming recomputes nothing.
 */

/** Space between columns and between birds in a column, in layout units. */
const GAP = 1.2;
/** Seeded slot height range, relative. */
const VAR_MIN = 0.85;
const VAR_SPAN = 0.3;
/** Share of the height left spare in the fullest column, so every column can start at its own depth. */
const SLACK = 0.92;
/** How far a bird may drift sideways inside its column, as a share of the spare width. */
const DRIFT = 1;

type Slot = { x: number; y: number; w: number; side: number; drift: number };
type Plan = { slots: Slot[]; font: number };
type Option = {
  side: number;
  widths: number[];
  font: number;
  columns: number[][];
};

const cache = new Map<string, Plan>();

function plan(n: number, area: Box, mode: LabelMode, seed: number): Plan {
  const vary = Array.from(
    { length: n },
    (_, i) => VAR_MIN + VAR_SPAN * hash01(`v${seed}:${i}`),
  );
  const maxVary = Math.max(...vary);
  /** Every second column starts half a slot lower, like bricks, so neighbours never share a baseline. */
  const brick = (0.5 * vary.reduce((a, b) => a + b, 0)) / n;
  const offset = (c: number, cols: number) =>
    cols > 1 && c % 2 === 1 ? brick : 0;
  const cap = smallCountCap(n);
  let best: Option | null = null;
  let bestScore = -1;
  for (let cols = 1; cols <= Math.min(n, 24); cols++) {
    const colW = (area.w - GAP * (cols - 1)) / cols;
    // Columns of slightly different widths, so they never read as a grid.
    const raw = Array.from(
      { length: cols },
      (_, c) => 0.88 + 0.24 * hash01(`w${seed}:${cols}:${c}`),
    );
    const sum = raw.reduce((a, b) => a + b, 0);
    const widths = raw.map((r) => (r / sum) * colW * cols);
    const font = labelFont(colW);
    const reserve = labelReserve(mode, font);
    // Shortest column first, in units of the base side.
    const columns: number[][] = Array.from({ length: cols }, () => []);
    const units = new Array<number>(cols).fill(0);
    for (let i = 0; i < n; i++) {
      let c = 0;
      for (let k = 1; k < cols; k++) if (units[k] < units[c] - 1e-9) c = k;
      columns[c].push(i);
      units[c] += vary[i];
    }
    // The largest base side that fits every column in the height and every slot in the width.
    let side = Infinity;
    columns.forEach((list, c) => {
      if (!list.length) return;
      const fixed = list.length * reserve + (list.length + 1) * GAP;
      side = Math.min(
        side,
        ((area.h - fixed) * SLACK) / (units[c] + offset(c, cols)),
      );
    });
    side = Math.min(
      side,
      Math.min(...widths) / maxVary,
      (Math.min(area.w, area.h) * cap) / maxVary,
    );
    if (!(side > 0)) continue;
    // Birds grow with the side, but cannot be wider than their column.
    const score = Math.min(side, colW) * side;
    if (score > bestScore + 1e-9) {
      bestScore = score;
      best = { side, widths, font, columns };
    }
  }
  // A degenerate area: one column, everything tiny, but nothing is dropped.
  const chosen: Option = best ?? {
    side: Math.max(0.5, area.h / (n * 2)),
    widths: [area.w],
    font: 0.85,
    columns: [Array.from({ length: n }, (_, i) => i)],
  };

  const reserve = labelReserve(mode, chosen.font);
  const slots: Slot[] = new Array(n);
  let x = area.x;
  chosen.columns.forEach((list, c) => {
    const colW = chosen.widths[c];
    const heights = list.map((i) => chosen.side * vary[i] + reserve);
    const used = heights.reduce((a, b) => a + b, 0) + (list.length - 1) * GAP;
    // Spare height, shared out unevenly over the gap above, the gaps between and the gap below.
    const spare = Math.max(0, area.h - used);
    // Neighbouring columns start at clearly different depths, so the tops never form a row.
    const weights = Array.from({ length: list.length + 1 }, (_, g) =>
      g === 0
        ? 0.05 + 0.35 * hash01(`t${seed}:${c}`)
        : 0.2 + hash01(`g${seed}:${c}:${g}`),
    );
    const total = weights.reduce((a, b) => a + b, 0);
    const lead = offset(c, chosen.columns.length) * chosen.side;
    let y = area.y + lead + ((spare - lead) * weights[0]) / total;
    list.forEach((i, k) => {
      slots[i] = {
        x,
        y,
        w: colW,
        side: chosen.side * vary[i],
        drift: hash01(`d${seed}:${i}`) * 2 - 1,
      };
      y += heights[k] + GAP + ((spare - lead) * weights[k + 1]) / total;
    });
    x += colW + GAP;
  });
  // Reading order for the birds (and their legend numbers): bands of one slot, then left to right.
  const band = chosen.side * 1.1;
  slots.sort(
    (a, b) =>
      Math.floor(a.y / band) - Math.floor(b.y / band) || a.x - b.x || a.y - b.y,
  );
  return { slots, font: chosen.font };
}

export const scatterLayout: LayoutFn = (input): LayoutResult => {
  const { animals, frameAspect, labels, seed } = input;
  const n = animals.length;
  const frame = computeFrame(frameAspect, labels, n);
  if (n === 0) return { frame, items: [], nameFont: 0 };

  const key = `${n}|${seed}|${labels}|${frameAspect.toFixed(4)}`;
  let p = cache.get(key);
  if (!p) {
    if (cache.size > 40) cache.delete(cache.keys().next().value as string);
    p = plan(n, frame.area, labels, seed);
    cache.set(key, p);
  }
  const { slots, font } = p;

  const items: Placed[] = animals.map((animal, i) => {
    const s = slots[i];
    // Light birds fill 72% of their slot, heavy ones all of it.
    const m = 0.72 + 0.28 * massRel(animal.massG);
    const art = fitBox(animal.aspect, s.w * m, s.side * m);
    const labelW =
      labels === "names" ? Math.min(s.w, Math.max(art.w * 1.3, s.w * 0.8)) : 0;
    const numberW = labels === "legend" ? font * 2.4 : 0;
    const blockW = Math.max(art.w, labelW, numberW);
    const spareX = Math.max(0, s.w - blockW);
    const cx = s.x + s.w / 2 + (s.drift * spareX * DRIFT) / 2;
    const artY = s.y + s.side - art.h;
    const placed: Placed = {
      id: animal.id,
      index: i,
      art: { x: cx - art.w / 2, y: artY, w: art.w, h: art.h },
      font,
    };
    const below = s.y + s.side + 0.3 * font;
    if (labels === "names")
      placed.label = { x: cx - labelW / 2, y: below, w: labelW, h: 2.3 * font };
    if (labels === "legend")
      placed.number = {
        x: cx - numberW / 2,
        y: below,
        w: numberW,
        h: 1.5 * font,
      };
    return placed;
  });
  return { frame, items, nameFont: font };
};
