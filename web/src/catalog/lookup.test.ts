import { describe, expect, it } from "vitest";
import { BACKGROUND_IDS, STYLE_IDS, staticLookup } from "./lookup";
import { STARTER_IDS } from "./static-m1";
import { effectiveMirror } from "@/poster/state/mirror";
import { initialState } from "@/poster/state/reducer";

const catalog = staticLookup();
const ctx = { catalog, styles: STYLE_IDS, backgrounds: BACKGROUND_IDS };

describe("static lookup", () => {
  it("knows 118 birds and all families have a name", () => {
    expect(catalog.ids()).toHaveLength(118);
    for (const id of catalog.ids()) expect(catalog.family(id)).toBeTruthy();
  });

  it("woodblock faces: 29 birds face right, field guide birds all face left", () => {
    const right = catalog
      .ids()
      .filter((id) => catalog.faces(id, "wb") === "right");
    expect(right).toHaveLength(29);
    expect(
      catalog.ids().every((id) => catalog.faces(id, "fg") === "left"),
    ).toBe(true);
  });

  it("a right facing woodblock bird is mirrored to match the field guide", () => {
    const id = "falco-peregrinus";
    expect(effectiveMirror({ flip: {}, style: "fg" }, id, catalog)).toBe(false);
    expect(effectiveMirror({ flip: {}, style: "wb" }, id, catalog)).toBe(true);
  });

  it("the starter poster is a mix, so the title is Birds", () => {
    const s = initialState(ctx, STARTER_IDS);
    expect(s.order).toHaveLength(12);
    expect(s.title).toBe("Birds");
  });
});
