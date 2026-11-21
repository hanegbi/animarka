import { describe, expect, it } from "vitest";
import { centerpieceLayout, pickCenter } from "./centerpiece";
import {
  ASPECTS,
  COUNTS,
  MODES,
  inputFor,
  makeAnimals,
  problems,
} from "./harness";
import { LAYOUT_FUNCTIONS } from "./index";

describe("centerpiece layout rules", () => {
  it("stays inside the frame, clear of title and legend, with no overlaps, from 1 to 150 animals", () => {
    const bad: string[] = [];
    for (const n of COUNTS) {
      for (const aspect of ASPECTS) {
        for (const mode of MODES) {
          const input = inputFor(n, aspect, mode);
          const list = problems(centerpieceLayout(input), input);
          if (list.length)
            bad.push(
              `n=${n} aspect=${aspect.toFixed(2)} ${mode}: ${list.slice(0, 2).join("; ")}`,
            );
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it("gives the same result for the same input", () => {
    const input = inputFor(37, 0.75, "names");
    expect(centerpieceLayout(input)).toEqual(centerpieceLayout(input));
  });

  it("keeps the input order in the output", () => {
    const input = inputFor(20, 0.75, "none");
    expect(centerpieceLayout(input).items.map((i) => i.id)).toEqual(
      input.animals.map((a) => a.id),
    );
  });
});

describe("the center animal", () => {
  it("is the heaviest by default", () => {
    const animals = makeAnimals(12);
    const heaviest = animals.reduce((m, a) => (a.massG > m.massG ? a : m));
    expect(animals[pickCenter(animals)].id).toBe(heaviest.id);
  });

  it("can be chosen, and a missing choice falls back to the heaviest", () => {
    const animals = makeAnimals(12);
    expect(animals[pickCenter(animals, "bird-3")].id).toBe("bird-3");
    expect(pickCenter(animals, "nope")).toBe(pickCenter(animals));
  });

  it("is the biggest animal on the poster and sits in the middle", () => {
    for (const n of [2, 5, 12, 36, 75]) {
      const input = inputFor(n, 0.75, "names");
      const r = centerpieceLayout(input);
      const cIdx = pickCenter(input.animals);
      const area = (i: number) => r.items[i].art.w * r.items[i].art.h;
      for (let i = 0; i < n; i++)
        if (i !== cIdx) expect(area(cIdx)).toBeGreaterThan(area(i));
      const a = r.frame.area;
      const c = r.items[cIdx].art;
      expect(Math.abs(c.x + c.w / 2 - (a.x + a.w / 2))).toBeLessThan(
        a.w * 0.08,
      );
      expect(Math.abs(c.y + c.h / 2 - (a.y + a.h / 2))).toBeLessThan(a.h * 0.2);
    }
  });

  it("a light bird chosen by the user still gets the big center spot", () => {
    const input = inputFor(12, 0.75, "none", { center: "bird-0" });
    input.animals[0] = { ...input.animals[0], massG: 8 };
    const r = centerpieceLayout(input);
    const areas = r.items.map((i) => i.art.w * i.art.h);
    expect(areas[0]).toBe(Math.max(...areas));
  });

  it("changing the center keeps the same birds and order", () => {
    const input = inputFor(12, 0.75, "names");
    const a = centerpieceLayout(input);
    const b = centerpieceLayout({ ...input, center: "bird-5" });
    expect(b.items.map((i) => i.id)).toEqual(a.items.map((i) => i.id));
    expect(b).not.toEqual(a);
  });
});

describe("small counts", () => {
  it("one animal fills the poster like the grid does", () => {
    const input = inputFor(1, 0.75, "names");
    expect(centerpieceLayout(input).items).toHaveLength(1);
  });

  it("two animals: one big in the middle, one beside it", () => {
    const input = inputFor(2, 0.75, "names");
    const r = centerpieceLayout(input);
    expect(r.items).toHaveLength(2);
    expect(problems(r, input)).toEqual([]);
  });
});

describe("position snapshots", () => {
  const round = (n: number) => Math.round(n * 100) / 100;
  for (const n of [1, 2, 12, 60, 150]) {
    it(`n=${n}`, () => {
      const r = centerpieceLayout(inputFor(n, 0.75, "names"));
      expect(
        r.items.map((i) => [
          i.id,
          round(i.art.x),
          round(i.art.y),
          round(i.art.w),
          round(i.art.h),
        ]),
      ).toMatchSnapshot();
    });
  }
});

describe("registry", () => {
  it("has the three layouts behind one interface", () => {
    expect(Object.keys(LAYOUT_FUNCTIONS).sort()).toEqual([
      "centerpiece",
      "grid",
      "scatter",
    ]);
  });
});
