import { describe, expect, it } from "vitest";
import { FIXTURE } from "@/catalog/fixture";
import type { SpeciesView } from "@/catalog/species-view";
import {
  ALL,
  familyList,
  listActions,
  matches,
  normalize,
  num,
  shownList,
  statusLine,
  trayLabel,
} from "./filter";

const byId = FIXTURE.species;
const list = FIXTURE.list;
const owl = byId.get("tyto-alba")!;
const OWLS = owl.family;
const owls = list.filter((s) => s.family === OWLS);

describe("search", () => {
  it("normalizes case and accents", () => {
    expect(normalize("  KéStrel ")).toBe("kestrel");
  });

  it("finds by common name, scientific name and family", () => {
    const kestrels = shownList(list, ALL, "kestrel");
    expect(kestrels.map((s) => s.id)).toContain("falco-tinnunculus");
    expect(kestrels.every((s) => matches(s, "kestrel"))).toBe(true);
    expect(shownList(list, ALL, "tyto alba").map((s) => s.id)).toEqual([
      "tyto-alba",
    ]);
    const woodpecker = byId.get("dendrocopos-major")!;
    expect(shownList(list, ALL, woodpecker.family)).toEqual(
      expect.arrayContaining(
        list.filter((s) => s.family === woodpecker.family),
      ),
    );
  });

  it("every word must match", () => {
    const r = shownList(list, ALL, "owl barn");
    expect(r.map((s) => s.id)).toContain("tyto-alba");
    expect(r.every((s) => matches(s, "barn") && matches(s, "owl"))).toBe(true);
  });

  it("an empty or blank query matches everything", () => {
    expect(shownList(list, ALL, "")).toHaveLength(list.length);
    expect(shownList(list, ALL, "   ")).toHaveLength(list.length);
  });

  it("finds by a Hebrew name when one is present", () => {
    const he: SpeciesView = {
      ...list[0],
      names: { en: list[0].name, he: "תנשמת לבנה" },
    };
    expect(matches(he, "תנשמת")).toBe(true);
    expect(matches(he, "xyz")).toBe(false);
  });

  it("a family filter shows only that family, and a search overrides it", () => {
    expect(shownList(list, OWLS, "")).toEqual(owls);
    const herons = shownList(list, OWLS, "heron");
    expect(herons.length).toBeGreaterThan(0);
    expect(herons.every((s) => matches(s, "heron"))).toBe(true);
  });

  it("answers in well under 100 ms on a catalog of 1,200 birds", () => {
    const big = Array.from({ length: 1200 }, (_, i) => ({
      ...list[i % list.length],
      id: `${list[i % list.length].id}-${i}`,
    }));
    const queries = ["k", "ke", "kes", "kest", "kestrel", "owl barn", "שלדג"];
    const start = performance.now();
    for (const q of queries) shownList(big, ALL, q);
    const perQuery = (performance.now() - start) / queries.length;
    expect(perQuery).toBeLessThan(100);
  });
});

describe("family chips", () => {
  it("counts birds per family and how many are on the poster, in catalog order", () => {
    const on = owls.slice(0, 2).map((s) => s.id);
    const fams = familyList(list, on);
    const families = new Set(list.map((s) => s.family));
    expect(fams).toHaveLength(families.size);
    expect(fams.find((f) => f.family === OWLS)).toEqual({
      family: OWLS,
      total: owls.length,
      onPoster: on.length,
    });
    expect(fams.filter((f) => f.onPoster > 0)).toHaveLength(1);
    expect(fams[0].family).toBe(list[0].family);
  });
});

describe("list actions", () => {
  const n = owls.length;
  const ids = owls.map((s) => s.id);

  it("add all, then remove these once everything is on", () => {
    expect(listActions(owls, OWLS, "", []).addAllLabel).toBe(`Add all ${n}`);
    const a = listActions(owls, OWLS, "", ids);
    expect(a.addAllLabel).toBe(`Remove these ${n}`);
    expect(a.allOn).toBe(true);
  });

  it("only this family is named, disabled when the poster already is exactly that", () => {
    expect(listActions(owls, OWLS, "", []).onlyLabel).toBe(
      `Only ${OWLS.toLowerCase()}`,
    );
    expect(listActions(owls, OWLS, "", ids).onlyDisabled).toBe(true);
    expect(
      listActions(owls, OWLS, "", [...ids, "falco-peregrinus"]).onlyDisabled,
    ).toBe(false);
  });

  it("a search says only these N, and the whole catalog hides the button", () => {
    const found = shownList(list, ALL, "kestrel");
    expect(listActions(found, ALL, "kestrel", []).onlyLabel).toBe(
      `Only these ${found.length}`,
    );
    expect(listActions(list, ALL, "", []).onlyHidden).toBe(true);
    expect(listActions([], ALL, "zzz", []).onlyHidden).toBe(true);
    expect(listActions([], ALL, "zzz", []).addAllDisabled).toBe(true);
  });
});

describe("status line and tray label", () => {
  it("writes big counts with a thousands separator", () => {
    expect(num(1161)).toBe("1,161");
    expect(num(12)).toBe("12");
  });

  it("describes the list", () => {
    expect(statusLine(list, ALL, "", [])).toBe(`All ${list.length} birds`);
    expect(statusLine(owls, OWLS, "", [owls[0].id])).toBe(
      `${OWLS}, ${owls.length} birds, 1 on poster`,
    );
    expect(statusLine(list.slice(0, 4), ALL, "owl", [])).toBe("4 found");
    expect(statusLine([], ALL, "zzz", [])).toBe("No bird matches that search.");
  });

  it("tray counts birds and families with the right plural", () => {
    expect(trayLabel([], byId)).toBe("empty");
    expect(trayLabel(["tyto-alba"], byId)).toBe("1 bird from 1 family");
    const sameFamily = owls.find((s) => s.id !== "tyto-alba")!.id;
    const mix = ["tyto-alba", sameFamily, "falco-peregrinus"];
    expect(trayLabel(mix, byId)).toBe("3 birds from 2 families");
  });
});

describe("presets", () => {
  it("only list birds that exist, once each", () => {
    expect(FIXTURE.presets.length).toBeGreaterThan(5);
    for (const p of FIXTURE.presets) {
      expect(p.ids.length, p.id).toBeGreaterThan(5);
      expect(new Set(p.ids).size, `${p.id} has duplicates`).toBe(p.ids.length);
      for (const id of p.ids) expect(byId.has(id), `${p.id}: ${id}`).toBe(true);
    }
  });

  it("have unique ids and titles", () => {
    const ps = FIXTURE.presets;
    expect(new Set(ps.map((p) => p.id)).size).toBe(ps.length);
    expect(new Set(ps.map((p) => p.title)).size).toBe(ps.length);
  });
});
