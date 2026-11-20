import { describe, expect, it } from "vitest";
import { SPECIES, STARTER_IDS } from "./static-m1";

describe("static M1 catalog", () => {
  it("has 118 species with unique ids", () => {
    expect(SPECIES).toHaveLength(118);
    expect(new Set(SPECIES.map((s) => s.id)).size).toBe(118);
  });

  it("starter birds all exist", () => {
    const ids = new Set(SPECIES.map((s) => s.id));
    expect(STARTER_IDS).toHaveLength(12);
    for (const id of STARTER_IDS) expect(ids.has(id)).toBe(true);
  });
});
