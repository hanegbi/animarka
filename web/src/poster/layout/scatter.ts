import { hash01 } from "@/poster/state/random";
import { labelFont, labelReserve, smallCountCap } from "./cells";
import { computeFrame } from "./frame";
import { massScale } from "./sizing";
import type { LayoutFn, LayoutResult, Placed } from "./types";

/**
 * Scattered, set like a printed wildlife poster: birds stand in rows on a shared baseline, each
 * drawn at a size that follows its weight (an eagle bigger than a finch), with its name on one line
 * under the row. Rows are balanced so none is left short, and spare space is shared evenly across
 * each row and down the poster, so there are no empty bands. Shuffle may add a row and
 * staggers alternate rows a little. Same seed, same poster.
 */

/** Gap between birds and between rows, in layout units. */
const GAP = 1.6;

type Row = { from: number; to: number };

/** Art size of each bird at base size `b`: area follows weight, the shape follows the art. */
function sizes(aspects: number[], scales: number[], b: number) {
  return aspects.map((a, i) => {
    const s = b * scales[i];
    // Equal area for equal weight, but no bird taller than 1.6 or wider than 1.9 of its scale.
    const w = Math.min(s * Math.sqrt(a), s * 1.9);
    const h = Math.min(w / a, s * 1.6);
    return { w: h * a, h };
  });
}

/** Fewest rows that hold the birds, filling each row left to right. */
function greedyRows(widths: number[], max: number, gap: number): number {
  let rows = 1;
  let used = 0;
  for (const w of widths) {
    const next = used ? used + gap + w : w;
    if (next > max && used) {
      rows++;
      used = w;
    } else used = next;
  }
  return rows;
}

/**
 * Cut the birds, in order, into exactly `rows` rows as evenly as possible (dynamic programming over
 * prefix sums). Null when no cut keeps every row within `max`.
 */
function balanced(
  widths: number[],
  rows: number,
  max: number,
  gap: number,
): Row[] | null {
  const n = widths.length;
  if (rows > n) return null;
  const pre = [0];
  for (const w of widths) pre.push(pre[pre.length - 1] + w);
  const rowW = (a: number, b: number) => pre[b] - pre[a] + gap * (b - a - 1);
  const target = (pre[n] + gap * (n - rows)) / rows;
  const cost: number[][] = Array.from({ length: rows + 1 }, () =>
    new Array(n + 1).fill(Infinity),
  );
  const cut: number[][] = Array.from({ length: rows + 1 }, () =>
    new Array(n + 1).fill(0),
  );
  cost[0][0] = 0;
  for (let r = 1; r <= rows; r++) {
    for (let end = r; end <= n - (rows - r); end++) {
      for (let start = end - 1; start >= r - 1; start--) {
        const w = rowW(start, end);
        if (w > max) break;
        const c = cost[r - 1][start] + (w - target) ** 2;
        if (c < cost[r][end]) {
          cost[r][end] = c;
          cut[r][end] = start;
        }
      }
    }
  }
  if (!Number.isFinite(cost[rows][n])) return null;
  const out: Row[] = [];
  let end = n;
  for (let r = rows; r >= 1; r--) {
    const start = cut[r][end];
    out.unshift({ from: start, to: end });
    end = start;
  }
  return out;
}

export const scatterLayout: LayoutFn = (input): LayoutResult => {
  const { animals, frameAspect, labels, seed } = input;
  const n = animals.length;
  const frame = computeFrame(frameAspect, labels, n);
  if (n === 0) return { frame, items: [], nameFont: 0 };
  const { area } = frame;
  const aspects = animals.map((a) => (a.aspect > 0 ? a.aspect : 0.75));
  const scales = animals.map((a) => massScale(a.massG));
  const cap = smallCountCap(n);

  // Shuffle: some seeds use one more row than needed, when it still fits, for another arrangement.
  const extra = hash01(`rows${seed}`) < 0.5 ? 1 : 0;
  // Largest base size where the birds fit in balanced rows, rows stacked inside the height.
  const fit = (b: number) => {
    const dims = sizes(aspects, scales, b);
    const font = labelFont((dims.reduce((s, d) => s + d.w, 0) / n) * 1.2);
    const reserve = labelReserve(labels, font);
    const widths = dims.map((d) => d.w);
    const heightOf = (rs: Row[]) =>
      rs.reduce(
        (h, r) =>
          h + Math.max(...dims.slice(r.from, r.to).map((d) => d.h)) + reserve,
        0,
      ) +
      GAP * (rs.length - 1);
    const need = greedyRows(widths, area.w, GAP);
    for (const rows of extra ? [need + 1, need] : [need]) {
      const rs = balanced(widths, rows, area.w, GAP);
      if (rs && heightOf(rs) <= area.h)
        return { dims, font, reserve, rows: rs, heightOf };
    }
    return null;
  };
  let lo = 0;
  let hi = (Math.min(area.w, area.h) * cap) / Math.max(...scales);
  let best = null as ReturnType<typeof fit>;
  for (let step = 0; step < 18; step++) {
    const mid = (lo + hi) / 2;
    const f = fit(mid);
    if (f) {
      best = f;
      lo = mid;
    } else hi = mid;
  }
  if (!best) best = fit(lo * 0.5 || 0.5);
  if (!best) return { frame, items: [], nameFont: 0 };

  const { dims, font, reserve, rows: pick, heightOf } = best;
  const used = heightOf(pick);
  // Spare height goes evenly above, between and below the rows.
  const vGap = (area.h - used) / (pick.length + 1);
  const items: Placed[] = [];
  let y = area.y + vGap;
  pick.forEach((row, r) => {
    const slice = dims.slice(row.from, row.to);
    const rowH = Math.max(...slice.map((d) => d.h));
    const baseline = y + rowH;
    const total = slice.reduce((s, d) => s + d.w, 0);
    const k = slice.length;
    // Even space around every bird in the row; alternate rows shift a touch, like a hand placed plate.
    const space = (area.w - total) / (k + 1);
    const stagger = (r % 2 ? 1 : -1) * space * 0.25 * hash01(`st${seed}:${r}`);
    let x = area.x + space + stagger;
    slice.forEach((d, j) => {
      const i = row.from + j;
      const left = x - space / 2;
      const slotW = d.w + space;
      const placed: Placed = {
        id: animals[i].id,
        index: i,
        art: { x, y: baseline - d.h, w: d.w, h: d.h },
        font,
      };
      const below = baseline + 0.3 * font;
      if (labels === "names") {
        // The name may use the space around its bird, never a neighbour's.
        const lw = Math.max(d.w, Math.min(slotW - GAP * 0.5, d.w + space));
        placed.label = {
          x: Math.max(
            area.x,
            Math.min(x + d.w / 2 - lw / 2, area.x + area.w - lw),
          ),
          y: below,
          w: Math.min(lw, area.w),
          h: 2.3 * font,
        };
        void left;
      }
      if (labels === "legend") {
        const nw = font * 2.4;
        placed.number = {
          x: x + d.w / 2 - nw / 2,
          y: below,
          w: nw,
          h: 1.5 * font,
        };
      }
      items.push(placed);
      x += d.w + space;
    });
    y = baseline + reserve + vGap + GAP;
  });
  return { frame, items, nameFont: font };
};
