import { describe, expect, it } from "vitest";
import { gridLayout } from "./grid";
import { inputFor, problems } from "./harness";
import type { LayoutResult } from "./types";

/** The harness must catch real mistakes, or the property tests prove nothing. */
describe("layout harness", () => {
  const input = inputFor(12, 0.75, "names");
  const good = () => structuredClone(gridLayout(input)) as LayoutResult;

  it("passes a good layout", () => {
    expect(problems(good(), input)).toEqual([]);
  });

  it("flags art that leaves the frame", () => {
    const r = good();
    r.items[0].art.x = -5;
    expect(problems(r, input).join()).toMatch(/leaves the safe frame/);
  });

  it("flags art on the title", () => {
    const r = good();
    r.items[0].art.y = r.frame.title.y;
    expect(problems(r, input).join()).toMatch(
      /touches the title|leaves the animal area/,
    );
  });

  it("flags two animals on top of each other", () => {
    const r = good();
    r.items[1].art = { ...r.items[0].art };
    r.items[1].label = r.items[0].label ? { ...r.items[0].label } : undefined;
    expect(problems(r, input).join()).toMatch(/overlaps/);
  });

  it("flags a missing animal and a stretched one", () => {
    const r = good();
    r.items.pop();
    expect(problems(r, input).join()).toMatch(/expected 12 items/);
    const s = good();
    s.items[0].art.w *= 1.5;
    expect(problems(s, input).join()).toMatch(/aspect changed/);
  });

  it("flags art on the legend", () => {
    const legendInput = inputFor(30, 0.75, "legend");
    const r = structuredClone(gridLayout(legendInput)) as LayoutResult;
    r.items[0].art.y = r.frame.legend!.box.y;
    expect(problems(r, legendInput).join()).toMatch(
      /touches the legend|leaves the animal area/,
    );
  });
});
