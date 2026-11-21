import { describe, expect, it } from "vitest";
import { FIXTURE } from "./fixture";
import { BACKGROUND_IDS, STYLE_IDS, viewLookup } from "./lookup";
import { STARTER_IDS } from "./starter";
import { effectiveMirror } from "@/poster/state/mirror";
import { initialState } from "@/poster/state/reducer";

const catalog = viewLookup(FIXTURE.species);
const ctx = { catalog, styles: STYLE_IDS, backgrounds: BACKGROUND_IDS };

describe("catalog lookup", () => {
  it("knows every fixture bird, in catalog order, each with a family", () => {
    expect(catalog.ids()).toEqual(FIXTURE.list.map((s) => s.id));
    for (const id of catalog.ids()) expect(catalog.family(id)).toBeTruthy();
    expect(catalog.has("nope")).toBe(false);
  });

  it("keeps the hand checked woodblock directions from M1", () => {
    const right = catalog
      .ids()
      .filter((id) => catalog.faces(id, "wb") === "right");
    expect(right.length).toBeGreaterThanOrEqual(29);
    expect(catalog.faces("falco-peregrinus", "fg")).toBe("left");
    expect(catalog.faces("nope", "fg")).toBe("left");
  });

  it("a right facing woodblock bird is mirrored to match the field guide", () => {
    const id = "falco-peregrinus";
    expect(effectiveMirror({ flip: {}, style: "fg" }, id, catalog)).toBe(false);
    expect(effectiveMirror({ flip: {}, style: "wb" }, id, catalog)).toBe(true);
  });

  it("every starter bird is in the catalog, and the mix is titled Birds", () => {
    for (const id of STARTER_IDS) expect(catalog.has(id), id).toBe(true);
    const s = initialState(ctx, STARTER_IDS);
    expect(s.order).toHaveLength(12);
    expect(s.title).toBe("Birds");
  });
});
