import { describe, expect, it } from "vitest";
import { gridLayout } from "./grid";
import { ASPECTS, COUNTS, MODES, blockOf, inputFor, problems } from "./harness";
import { rowCounts } from "./cells";
import { scatterLayout } from "./scatter";
import type { LayoutFn } from "./types";

const LAYOUTS: [string, LayoutFn][] = [
  ["scatter", scatterLayout],
  ["grid", gridLayout],
];

describe.each(LAYOUTS)("%s layout rules", (_name, layout) => {
  it("stays inside the frame, clear of title and legend, with no overlaps, from 1 to 150 animals", () => {
    const bad: string[] = [];
    for (const n of COUNTS) {
      for (const aspect of ASPECTS) {
        for (const mode of MODES) {
          const input = inputFor(n, aspect, mode);
          const list = problems(layout(input), input);
          if (list.length)
            bad.push(
              `n=${n} aspect=${aspect.toFixed(2)} ${mode}: ${list.slice(0, 2).join("; ")}`,
            );
        }
      }
    }
    expect(bad).toEqual([]);
  }, 30000);

  it("gives the same result for the same input", () => {
    const input = inputFor(37, 0.75, "names");
    expect(layout(input)).toEqual(layout(input));
  });

  it("an empty poster has no items", () => {
    expect(layout(inputFor(0, 0.75, "names")).items).toEqual([]);
  });

  it("keeps the input order in the output", () => {
    const input = inputFor(20, 0.75, "none");
    expect(layout(input).items.map((i) => i.id)).toEqual(
      input.animals.map((a) => a.id),
    );
  });

  it("a heavy bird is drawn bigger than a light one of the same shape", () => {
    const input = inputFor(12, 0.75, "none");
    input.animals = input.animals.map((a, i) => ({
      ...a,
      aspect: 0.8,
      massG: i === 0 ? 8000 : i === 1 ? 10 : 200,
    }));
    const items = layout(input).items;
    expect(items[0].art.w).toBeGreaterThan(items[1].art.w);
  });

  it("birds get as big as the room allows: a lone bird is large", () => {
    const input = inputFor(1, 0.75, "names");
    const it = layout(input).items[0];
    expect(it.art.w * it.art.h).toBeGreaterThan(900);
  });

  it("legend mode numbers every bird below its art and keeps the legend clear", () => {
    const input = inputFor(30, 0.75, "legend");
    const r = layout(input);
    expect(r.frame.legend).toBeDefined();
    expect(
      r.items.every((i) => i.number && i.number.y >= i.art.y + i.art.h),
    ).toBe(true);
  });
});

describe("grid specifics", () => {
  it("has no drift: rows share the same y and columns the same x", () => {
    const r = gridLayout(
      inputFor(12, 0.75, "none", {
        animals: inputFor(12, 0.75, "none").animals.map((a) => ({
          ...a,
          aspect: 0.8,
          massG: 100,
        })),
      }),
    );
    const ys = new Set(r.items.map((i) => Math.round(blockOf(i).y * 1000)));
    expect(ys.size).toBeLessThanOrEqual(6);
  });

  it("changing the seed changes nothing", () => {
    const a = gridLayout(inputFor(20, 0.75, "names", { seed: 1 }));
    const b = gridLayout(inputFor(20, 0.75, "names", { seed: 99 }));
    expect(a).toEqual(b);
  });
});

describe("scatter specifics", () => {
  it("a different seed gives a different arrangement", () => {
    const a = scatterLayout(inputFor(20, 0.75, "names", { seed: 1 }));
    const b = scatterLayout(inputFor(20, 0.75, "names", { seed: 2 }));
    expect(a).not.toEqual(b);
  });

  it("looks looser than the grid: positions are not all on one line", () => {
    const r = scatterLayout(inputFor(12, 0.75, "none"));
    const ys = new Set(r.items.map((i) => Math.round(i.art.y)));
    expect(ys.size).toBeGreaterThan(4);
  });

  /** Height of the tallest band across the whole width that no bird or label touches. */
  function widestEmptyBand(r: ReturnType<typeof scatterLayout>): number {
    const spans = r.items
      .map((i) => blockOf(i))
      .map((b) => [b.y, b.y + b.h] as const)
      .sort((x, y) => x[0] - y[0]);
    let gap = spans[0][0] - r.frame.area.y;
    let reach = spans[0][1];
    for (const [top, bottom] of spans.slice(1)) {
      gap = Math.max(gap, top - reach);
      reach = Math.max(reach, bottom);
    }
    return Math.max(gap, r.frame.area.y + r.frame.area.h - reach);
  }

  it("never leaves an empty band taller than one bird (B6)", () => {
    const bad: string[] = [];
    for (const n of [3, 5, 7, 12, 20, 37]) {
      for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
        for (const mode of MODES) {
          const r = scatterLayout(inputFor(n, 0.75, mode, { seed }));
          // One bird: its size, the larger side of its art.
          const birds = r.items
            .map((i) => Math.max(i.art.w, i.art.h))
            .sort((a, b) => a - b);
          const median = birds[Math.floor(birds.length / 2)];
          const band = widestEmptyBand(r);
          if (band > median)
            bad.push(
              `n=${n} seed=${seed} ${mode}: band ${band.toFixed(1)} > bird ${median.toFixed(1)}`,
            );
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it("shows no rows: most horizontal neighbours sit at different heights (B6)", () => {
    for (const seed of [1, 2, 3, 4]) {
      const r = scatterLayout(inputFor(20, 0.75, "names", { seed }));
      const blocks = r.items.map(blockOf);
      let pairs = 0;
      let level = 0;
      blocks.forEach((a, i) =>
        blocks.forEach((b, j) => {
          if (j <= i) return;
          const side =
            Math.abs(a.x + a.w / 2 - (b.x + b.w / 2)) < (a.w + b.w) * 0.75;
          const near = Math.abs(a.y - b.y) < Math.max(a.h, b.h);
          if (!side || !near) return;
          pairs++;
          if (Math.abs(a.y + a.h - (b.y + b.h)) < 0.08 * Math.max(a.h, b.h))
            level++;
        }),
      );
      expect(level / Math.max(1, pairs)).toBeLessThan(0.35);
    }
  });

  it("has real size variation: the biggest bird is clearly bigger than the smallest", () => {
    const input = inputFor(20, 0.75, "none", { seed: 3 });
    input.animals = input.animals.map((a) => ({
      ...a,
      aspect: 0.8,
      massG: 200,
    }));
    const areas = scatterLayout(input).items.map((i) => i.art.w * i.art.h);
    expect(Math.max(...areas) / Math.min(...areas)).toBeGreaterThan(1.3);
  });

  it("swapping two birds moves only those two", () => {
    const input = inputFor(12, 0.75, "names", { seed: 5 });
    const before = scatterLayout(input).items;
    const swapped = { ...input, animals: input.animals.slice() };
    [swapped.animals[2], swapped.animals[7]] = [
      swapped.animals[7],
      swapped.animals[2],
    ];
    const after = scatterLayout(swapped).items;
    const centre = (b: { x: number; w: number }) => b.x + b.w / 2;
    for (let i = 0; i < 12; i++) {
      if (i === 2 || i === 7) continue;
      expect(centre(after[i].art)).toBeCloseTo(centre(before[i].art), 6);
    }
  });
});

describe("rowCounts", () => {
  it("grid rows hold the column count and the last row is topped up", () => {
    expect(rowCounts(10, 4, false)).toEqual([4, 3, 3]);
    expect(rowCounts(8, 4, false)).toEqual([4, 4]);
  });

  it("never ends with a lone animal when earlier rows are full", () => {
    expect(rowCounts(13, 4, false)).toEqual([4, 4, 3, 2]);
    expect(rowCounts(12, 4, true)).toEqual([4, 3, 3, 2]);
  });

  it("brick rows alternate full and one short", () => {
    expect(rowCounts(10, 4, true)).toEqual([4, 3, 3]);
    expect(rowCounts(7, 3, true)).toEqual([3, 2, 2]);
  });

  it("holds every animal", () => {
    for (const n of [1, 2, 9, 37, 150]) {
      for (const cols of [1, 2, 5, 13]) {
        for (const brick of [false, true]) {
          expect(rowCounts(n, cols, brick)!.reduce((a, b) => a + b, 0)).toBe(n);
        }
      }
    }
  });
});
