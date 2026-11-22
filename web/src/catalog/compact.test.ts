import { describe, expect, it } from "vitest";
import type { ApiSpeciesList } from "./api";
import { decodeCompact, encodeCompact, sciOf } from "./compact";
import raw from "./fixture/catalog.json";

const full = (raw as unknown as { species: ApiSpeciesList }).species;

describe("compact catalog form", () => {
  it("round trips every bird: names, family, weight and art", () => {
    const back = decodeCompact(encodeCompact(full));
    expect(back.species.map((s) => s.id)).toEqual(
      full.species.map((s) => s.id),
    );
    for (const [i, s] of full.species.entries()) {
      const b = back.species[i];
      expect(b.names).toEqual(s.names);
      expect([b.family, b.familySci]).toEqual([s.family, s.familySci]);
      expect(b.massG).toBe(s.massG);
      expect(b.art).toEqual(s.art);
    }
  });

  it("keeps a bird with one style to that style", () => {
    const one: ApiSpeciesList = {
      ...full,
      species: [{ ...full.species[0], art: { fg: full.species[0].art.fg } }],
    };
    expect(
      Object.keys(decodeCompact(encodeCompact(one)).species[0].art),
    ).toEqual(["fg"]);
  });

  it("builds the scientific name from the id", () => {
    expect(sciOf("tyto-alba")).toBe("Tyto alba");
    expect(sciOf("schoeniclus-schoeniclus")).toBe("Schoeniclus schoeniclus");
  });

  it("is much smaller than the full form", () => {
    const small = JSON.stringify(encodeCompact(full)).length;
    expect(small).toBeLessThan(JSON.stringify(full).length * 0.4);
  });
});
