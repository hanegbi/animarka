import { MAX_COLUMNS, labelFont, labelReserve, placeInCell } from "./cells";
import { computeFrame } from "./frame";
import { gridLayout } from "./grid";
import { clamp, fitBox, median } from "./sizing";
import type { Box, LayoutFn, Placed } from "./types";

const ART_PAD = 0.4;
const MAX_ROWS = 30;

/** The animal that sits in the middle: the user's pick, else the heaviest. */
export function pickCenter(
  animals: { id: string; massG: number }[],
  override?: string,
): number {
  const chosen = override ? animals.findIndex((a) => a.id === override) : -1;
  if (chosen !== -1) return chosen;
  let best = 0;
  animals.forEach((a, i) => {
    if (a.massG > animals[best].massG) best = i;
  });
  return best;
}

type Plan = {
  gc: number;
  gr: number;
  ca: number;
  cb: number;
  cw: number;
  ch: number;
  font: number;
  score: number;
};

/**
 * One big animal in the middle, the rest around it. The poster is cut into equal cells. The center
 * takes a block of cells in the middle. The other animals fill the free cells nearest the center,
 * so they form a tidy cluster that grows outward. Cells never overlap and never leave the free area.
 */
export const centerpieceLayout: LayoutFn = (input) => {
  const { animals, frameAspect, labels, seed } = input;
  const n = animals.length;
  if (n <= 1) return gridLayout(input);

  const frame = computeFrame(frameAspect, labels, n);
  const { area } = frame;
  const centerIdx = pickCenter(animals, input.center);
  const center = animals[centerIdx];
  const others = animals
    .map((a, i) => ({ a, i }))
    .filter(({ i }) => i !== centerIdx);
  const refAspect = median(others.map(({ a }) => a.aspect));

  let best: Plan | null = null;
  for (let gc = 3; gc <= MAX_COLUMNS; gc++) {
    const cw = area.w / gc;
    const font = labelFont(cw);
    const centerFont = clamp(font * 1.5, 1, 2.4);
    for (let ca = gc % 2 === 0 ? 2 : 1; ca <= gc - 2; ca += 2) {
      for (let gr = 3; gr <= MAX_ROWS; gr++) {
        const ch = area.h / gr;
        const ringBox = fitBox(
          refAspect,
          cw * 0.9,
          ch - labelReserve(labels, font) - ART_PAD,
        );
        if (ringBox.w <= 0 || ringBox.h <= 0) continue;
        const wantH =
          ((ca * cw * 0.94) / center.aspect +
            labelReserve(labels, centerFont) +
            ART_PAD) /
          ch;
        // Center rows: nearest to the wanted height, with the same parity as the grid so it sits dead center.
        let cb = clamp(Math.round(wantH), 1, gr);
        if ((gr - cb) % 2 !== 0)
          cb =
            cb + 1 <= gr && Math.abs(cb + 1 - wantH) <= Math.abs(cb - 1 - wantH)
              ? cb + 1
              : cb - 1;
        if (cb < 1 || cb > gr || ca * cb < 3) continue;
        if (gc * gr - ca * cb < n - 1) continue;
        const centerBox = fitBox(
          center.aspect,
          ca * cw * 0.94,
          cb * ch - labelReserve(labels, centerFont) - ART_PAD,
        );
        const ringArea = ringBox.w * ringBox.h;
        if (centerBox.w * centerBox.h < 2.2 * ringArea) continue;
        if (!best || ringArea > best.score + 1e-9)
          best = { gc, gr, ca, cb, cw, ch, font, score: ringArea };
        break; // more rows only make the cells shorter
      }
    }
  }
  if (!best) return gridLayout(input);

  const { gc, gr, ca, cb, cw, ch, font } = best;
  const c0 = (gc - ca) / 2;
  const r0 = (gr - cb) / 2;
  const centerCell: Box = {
    x: area.x + c0 * cw,
    y: area.y + r0 * ch,
    w: ca * cw,
    h: cb * ch,
  };

  const mid = { x: area.x + area.w / 2, y: area.y + area.h / 2 };
  const free: { r: number; c: number; d: number; angle: number }[] = [];
  for (let r = 0; r < gr; r++) {
    for (let c = 0; c < gc; c++) {
      if (c >= c0 && c < c0 + ca && r >= r0 && r < r0 + cb) continue;
      const dx = area.x + (c + 0.5) * cw - mid.x;
      const dy = area.y + (r + 0.5) * ch - mid.y;
      free.push({
        r,
        c,
        d: Math.hypot(dx / (area.w / 2), dy / (area.h / 2)),
        angle: Math.atan2(dy, dx),
      });
    }
  }
  free.sort((p, q) => p.d - q.d || p.angle - q.angle);
  const chosen = free
    .slice(0, others.length)
    .sort((p, q) => p.r - q.r || p.c - q.c);

  const items: Placed[] = new Array(n);
  const centerFont = clamp(font * 1.5, 1, 2.4);
  items[centerIdx] = placeInCell(centerCell, center, centerIdx, {
    mode: labels,
    font: centerFont,
    fill: 0.94,
    jitter: 0,
    seed,
    cap: 1,
    useMass: false,
  });
  others.forEach(({ a, i }, k) => {
    const cell: Box = {
      x: area.x + chosen[k].c * cw,
      y: area.y + chosen[k].r * ch,
      w: cw,
      h: ch,
    };
    items[i] = placeInCell(cell, a, i, {
      mode: labels,
      font,
      fill: 0.9,
      jitter: 0,
      seed,
      cap: 1,
    });
  });
  return { frame, items, nameFont: font };
};
