import { describe, expect, it } from "vitest";
import { boxInside, boxesOverlap, clampInto, unionBox } from "./clamp";
import { computeFrame } from "./frame";
import { legendColumnRange, planLegend } from "./legend";
import {
  fitBox,
  fitFactor,
  frameAspect,
  massRel,
  massScale,
  median,
} from "./sizing";

describe("massScale", () => {
  it("matches the prototype rule: 0.72 + 0.2 * (log10(mass) - 1), clamped", () => {
    expect(massScale(100)).toBeCloseTo(0.92, 6);
    expect(massScale(1000)).toBeCloseTo(1.12, 6);
    expect(massScale(10)).toBeCloseTo(0.72, 6);
  });

  it("clamps tiny and huge birds", () => {
    expect(massScale(1)).toBe(0.72);
    expect(massScale(1_000_000)).toBe(1.35);
  });

  it("an eagle is bigger than a finch", () => {
    expect(massScale(4500)).toBeGreaterThan(massScale(15));
  });

  it("falls back to 100 g for missing mass", () => {
    expect(massScale(0)).toBe(massScale(100));
    expect(massScale(Number.NaN)).toBe(massScale(100));
  });

  it("relative size and fit factor run from smallest to largest", () => {
    expect(massRel(1)).toBe(0);
    expect(massRel(1_000_000)).toBe(1);
    expect(fitFactor(1)).toBeCloseTo(0.7, 6);
    expect(fitFactor(1_000_000)).toBeCloseTo(1, 6);
  });
});

describe("frame aspect", () => {
  it("covers the four shapes in both orientations", () => {
    expect(frameAspect("3:4", "portrait")).toBeCloseTo(0.75, 6);
    expect(frameAspect("2:3", "portrait")).toBeCloseTo(2 / 3, 6);
    expect(frameAspect("4:5", "portrait")).toBeCloseTo(0.8, 6);
    expect(frameAspect("3:4", "landscape")).toBeCloseTo(4 / 3, 6);
  });
});

describe("fitBox and median", () => {
  it("fits by width or by height, whichever is tighter", () => {
    expect(fitBox(0.5, 10, 100)).toEqual({ w: 10, h: 20 });
    const f = fitBox(0.5, 100, 10);
    expect(f.h).toBeCloseTo(10, 6);
    expect(f.w).toBeCloseTo(5, 6);
  });

  it("median of odd, even and empty lists", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(median([])).toBe(0.75);
  });
});

describe("boxes", () => {
  const a = { x: 0, y: 0, w: 10, h: 10 };
  it("detects overlap but not touching edges", () => {
    expect(boxesOverlap(a, { x: 5, y: 5, w: 10, h: 10 })).toBe(true);
    expect(boxesOverlap(a, { x: 10, y: 0, w: 5, h: 5 })).toBe(false);
  });

  it("checks containment", () => {
    expect(boxInside({ x: 1, y: 1, w: 2, h: 2 }, a)).toBe(true);
    expect(boxInside({ x: 9, y: 1, w: 2, h: 2 }, a)).toBe(false);
  });

  it("clampInto slides the smallest distance", () => {
    expect(clampInto({ x: -3, y: 8, w: 4, h: 4 }, a)).toEqual({
      x: 0,
      y: 6,
      w: 4,
      h: 4,
    });
  });

  it("clampInto centers a box that is too big", () => {
    expect(clampInto({ x: 0, y: 0, w: 20, h: 4 }, a)).toEqual({
      x: -5,
      y: 0,
      w: 20,
      h: 4,
    });
  });

  it("unionBox spans every box", () => {
    expect(unionBox(a, { x: 5, y: 8, w: 10, h: 10 }, undefined)).toEqual({
      x: 0,
      y: 0,
      w: 15,
      h: 18,
    });
  });
});

describe("legend plan", () => {
  it("uses 3 to 5 columns on portrait and may use more on wide posters", () => {
    expect(legendColumnRange(0.75)).toEqual([3, 4, 5]);
    expect(Math.max(...legendColumnRange(1.33))).toBeGreaterThan(5);
  });

  it("grows columns and shrinks type as the count grows", () => {
    const h = 100 / 0.75;
    const small = planLegend(12, 100, h, 0.75, 4);
    const big = planLegend(150, 100, h, 0.75, 4);
    expect(big.cols).toBeGreaterThanOrEqual(small.cols);
    expect(big.font).toBeLessThan(small.font);
  });

  it("never takes more than 30% of the height and sits above the bottom margin", () => {
    for (const n of [1, 12, 36, 75, 150]) {
      for (const aspect of [0.6, 0.75, 1.33]) {
        const h = 100 / aspect;
        const p = planLegend(n, 100, h, aspect, 4);
        expect(p.box.h).toBeLessThanOrEqual(h * 0.3 + 1e-6);
        expect(p.box.y + p.box.h).toBeCloseTo(h - 4, 6);
        expect(p.rows * p.cols).toBeGreaterThanOrEqual(n);
      }
    }
  });
});

describe("frame", () => {
  it("portrait 3:4 is 100 by 133.33", () => {
    const f = computeFrame(0.75, "names", 12);
    expect(f.w).toBe(100);
    expect(f.h).toBeCloseTo(133.333, 2);
  });

  it("the animal area is inside the safe frame and clear of the title", () => {
    for (const mode of ["names", "legend", "none"] as const) {
      const f = computeFrame(0.75, mode, 30);
      expect(boxInside(f.area, f.safe)).toBe(true);
      expect(boxesOverlap(f.area, f.title)).toBe(false);
    }
  });

  it("with a legend the area is clear of it too, and smaller", () => {
    const withLegend = computeFrame(0.75, "legend", 30);
    const without = computeFrame(0.75, "names", 30);
    expect(withLegend.legend).toBeDefined();
    expect(boxesOverlap(withLegend.area, withLegend.legend!.box)).toBe(false);
    expect(withLegend.area.h).toBeLessThan(without.area.h);
  });

  it("an empty poster has no legend", () => {
    expect(computeFrame(0.75, "legend", 0).legend).toBeUndefined();
  });
});
