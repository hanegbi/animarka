import { describe, expect, it } from "vitest";
import { FIXTURE } from "@/catalog/fixture";
import { STYLE_IDS, BACKGROUND_IDS, viewLookup } from "@/catalog/lookup";
import { STARTER_IDS } from "@/catalog/starter";
import { initialState, reduce } from "@/poster/state/reducer";
import { layoutForState, layoutInputFor } from "./for-state";
import { problems } from "./harness";

const catalog = viewLookup(FIXTURE.species);
const ctx = { catalog, styles: STYLE_IDS, backgrounds: BACKGROUND_IDS };
const species = FIXTURE.species;

describe("layout for a saved poster", () => {
  it("builds one animal per bird in poster order", () => {
    const state = initialState(ctx, STARTER_IDS);
    const input = layoutInputFor(state, species);
    expect(input.animals.map((a) => a.id)).toEqual(STARTER_IDS);
    expect(input.frameAspect).toBeCloseTo(0.75, 6);
  });

  it("follows size and orientation", () => {
    let state = initialState(ctx, STARTER_IDS);
    state = reduce(
      state,
      { type: "setOrientation", orientation: "landscape" },
      ctx,
    );
    state = reduce(state, { type: "setSize", size: "2:3" }, ctx);
    expect(layoutInputFor(state, species).frameAspect).toBeCloseTo(1.5, 6);
  });

  it("every layout, every label mode, passes the rules for the starter poster", () => {
    for (const layout of ["scatter", "grid", "centerpiece"] as const) {
      for (const labels of ["names", "legend", "none"] as const) {
        let state = initialState(ctx, STARTER_IDS);
        state = reduce(state, { type: "setLayout", layout }, ctx);
        state = reduce(state, { type: "setLabels", labels }, ctx);
        const input = layoutInputFor(state, species);
        expect(
          problems(layoutForState(state, species), input),
          `${layout} ${labels}`,
        ).toEqual([]);
      }
    }
  });

  it("all 118 birds fit on every layout", () => {
    const state = initialState(ctx, catalog.ids());
    for (const layout of ["scatter", "grid", "centerpiece"] as const) {
      const s = reduce(state, { type: "setLayout", layout }, ctx);
      const input = layoutInputFor(s, species);
      expect(problems(layoutForState(s, species), input), layout).toEqual([]);
    }
  });

  it("style switch keeps every animal in the same box", () => {
    const a = initialState(ctx, STARTER_IDS);
    const b = reduce(a, { type: "setStyle", style: "wb" }, ctx);
    expect(layoutForState(b, species)).toEqual(layoutForState(a, species));
  });
});
