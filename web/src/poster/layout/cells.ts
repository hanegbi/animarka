import { hash01 } from "@/poster/state/random";
import type { LabelMode } from "@/poster/state/types";
import { computeFrame } from "./frame";
import { clamp, fitBox, fitFactor, median } from "./sizing";
import type {
  Box,
  LayoutAnimal,
  LayoutInput,
  LayoutResult,
  Placed,
} from "./types";

export const MAX_COLUMNS = 24;
/** Breathing room between art and the label, in layout units. */
const ART_PAD = 0.4;

/** Label font follows the cell width, within readable limits. */
export function labelFont(cellWidth: number): number {
  return clamp(cellWidth * 0.16, 0.85, 1.9);
}

/** Height reserved under the art for the label or number, including the gap. */
export function labelReserve(mode: LabelMode, font: number): number {
  if (mode === "names") return 2.6 * font;
  if (mode === "legend") return 1.8 * font;
  return 0;
}

/** Big birds fill the poster when there are only one or two. */
export function smallCountCap(n: number): number {
  return n === 1 ? 0.7 : n === 2 ? 0.85 : 1;
}

export type CellSpec = { box: Box; animal: LayoutAnimal; index: number };

/**
 * Put one animal inside one cell. The art, its label and its number badge always stay inside the cell.
 * `jitter` (0 to 1) moves the whole block inside the cell's spare room, so the result stays reproducible.
 */
export function placeInCell(
  cell: Box,
  animal: LayoutAnimal,
  index: number,
  opts: {
    mode: LabelMode;
    font: number;
    fill: number;
    jitter: number;
    seed: number;
    cap: number;
    artPad?: number;
    /** False draws the animal at full cell size whatever its weight. Used for the centerpiece. */
    useMass?: boolean;
  },
): Placed {
  const { mode, font, fill, jitter, seed, cap } = opts;
  const reserve = labelReserve(mode, font);
  const pad = opts.artPad ?? ART_PAD;
  const ff = opts.useMass === false ? 1 : fitFactor(animal.massG);
  const maxW = cell.w * fill * ff * cap;
  const maxH = Math.max(0, cell.h - reserve - pad) * ff * cap;
  const art = fitBox(animal.aspect, maxW, maxH);

  const labelW =
    mode === "names" ? clamp(art.w * 1.25, cell.w * 0.7, cell.w * 0.96) : 0;
  const numberW = mode === "legend" ? font * 2.4 : 0;
  const blockW = Math.max(art.w, labelW, numberW);
  const blockH = art.h + reserve;

  const slackX = Math.max(0, cell.w - blockW);
  const slackY = Math.max(0, cell.h - blockH);
  const jx = jitter
    ? (hash01(`${animal.id}x${seed}${index}`) - 0.5) * slackX * jitter
    : 0;
  const jy = jitter
    ? (hash01(`${animal.id}y${seed}${index}`) - 0.5) * slackY * jitter
    : 0;
  const bx = cell.x + slackX / 2 + jx;
  const by = cell.y + slackY / 2 + jy;
  const cx = bx + blockW / 2;

  const placed: Placed = {
    id: animal.id,
    index,
    art: { x: cx - art.w / 2, y: by, w: art.w, h: art.h },
    font,
  };
  const below = by + art.h + 0.3 * font;
  if (mode === "names")
    placed.label = { x: cx - labelW / 2, y: below, w: labelW, h: 2.3 * font };
  if (mode === "legend")
    placed.number = {
      x: cx - numberW / 2,
      y: below,
      w: numberW,
      h: 1.5 * font,
    };
  return placed;
}

/** Rows of items. Grid rows all hold `cols`. Brick rows alternate `cols` and `cols - 1`. */
export function rowCounts(
  n: number,
  cols: number,
  brick: boolean,
): number[] | null {
  if (cols < 1) return null;
  if (!brick || cols < 2) {
    const rows = Math.ceil(n / cols);
    return Array.from({ length: rows }, (_, r) =>
      r < rows - 1 ? cols : n - (rows - 1) * cols,
    );
  }
  const counts: number[] = [];
  let left = n;
  for (let r = 0; left > 0; r++) {
    const cap = r % 2 === 0 ? cols : cols - 1;
    const take = Math.min(cap, left);
    counts.push(take);
    left -= take;
  }
  return counts;
}

/**
 * Shared engine for grid and scatter. Tries every column count and keeps the one that gives the
 * largest animals. Cells never overlap, so neither do animals, and nothing leaves the free area.
 */
export function placeInRows(
  input: LayoutInput,
  options: { brick: boolean; jitter: number; fill: number },
): LayoutResult {
  const { animals, frameAspect, labels, seed } = input;
  const n = animals.length;
  const frame = computeFrame(frameAspect, labels, n);
  if (n === 0) return { frame, items: [], nameFont: 0 };

  const { area } = frame;
  const refAspect = median(animals.map((a) => a.aspect));
  const cap = smallCountCap(n);

  let best: {
    cols: number;
    counts: number[];
    cw: number;
    ch: number;
    font: number;
    score: number;
  } | null = null;
  for (let cols = 1; cols <= Math.min(n, MAX_COLUMNS); cols++) {
    const counts = rowCounts(n, cols, options.brick);
    if (!counts) continue;
    const rows = counts.length;
    const cw = area.w / cols;
    const ch = area.h / rows;
    const font = labelFont(cw);
    const maxW = cw * options.fill * cap;
    const maxH = (ch - labelReserve(labels, font) - ART_PAD) * cap;
    if (maxW <= 0 || maxH <= 0) continue;
    const box = fitBox(refAspect, maxW, maxH);
    const score = box.w * box.h;
    if (!best || score > best.score + 1e-9)
      best = { cols, counts, cw, ch, font, score };
  }
  // Only possible when the area is tiny. Fall back to the densest grid so nothing is dropped.
  if (!best) {
    const cols = Math.min(n, MAX_COLUMNS);
    const counts = rowCounts(n, cols, false)!;
    best = {
      cols,
      counts,
      cw: area.w / cols,
      ch: area.h / counts.length,
      font: 0.85,
      score: 0,
    };
  }

  const items: Placed[] = [];
  let i = 0;
  best.counts.forEach((k, r) => {
    const x0 = area.x + (area.w - k * best!.cw) / 2;
    for (let c = 0; c < k; c++, i++) {
      const cell: Box = {
        x: x0 + c * best!.cw,
        y: area.y + r * best!.ch,
        w: best!.cw,
        h: best!.ch,
      };
      items.push(
        placeInCell(cell, animals[i], i, {
          mode: labels,
          font: best!.font,
          fill: options.fill,
          jitter: options.jitter,
          seed,
          cap,
        }),
      );
    }
  });
  return { frame, items, nameFont: best.font };
}
