import { describe, expect, it } from "vitest";
import { PRESETS } from "@/catalog/presets";
import { staticSpeciesViews, type SpeciesView } from "@/catalog/species-view";
import {
  ALL,
  familyList,
  listActions,
  matches,
  normalize,
  shownList,
  statusLine,
  trayLabel,
} from "./filter";

const byId = staticSpeciesViews();
const list = [...byId.values()];

describe("search", () => {
  it("normalizes case and accents", () => {
    expect(normalize("  KéStrel ")).toBe("kestrel");
  });

  it("finds by common name, scientific name and family", () => {
    expect(shownList(list, ALL, "kestrel").map((s) => s.name)).toEqual(
      expect.arrayContaining([
        "Common Kestrel",
        "Lesser Kestrel",
        "American Kestrel",
      ]),
    );
    expect(shownList(list, ALL, "tyto alba").map((s) => s.id)).toEqual([
      "tyto-alba",
    ]);
    expect(shownList(list, ALL, "woodpeckers")).toHaveLength(12);
  });

  it("every word must match", () => {
    const r = shownList(list, ALL, "owl barn");
    expect(r.map((s) => s.name)).toContain("Western Barn Owl");
    expect(r.every((s) => /barn/i.test(s.name))).toBe(true);
  });

  it("an empty or blank query matches everything", () => {
    expect(shownList(list, ALL, "")).toHaveLength(118);
    expect(shownList(list, ALL, "   ")).toHaveLength(118);
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
    expect(shownList(list, "Owls", "")).toHaveLength(12);
    expect(
      shownList(list, "Owls", "heron").every(
        (s) => s.family === "Herons and egrets",
      ),
    ).toBe(true);
  });
});

describe("family chips", () => {
  it("counts birds per family and how many are on the poster, in catalog order", () => {
    const owls = list
      .filter((s) => s.family === "Owls")
      .slice(0, 3)
      .map((s) => s.id);
    const fams = familyList(list, owls);
    expect(fams[0]).toEqual({ family: "Owls", total: 12, onPoster: 3 });
    expect(fams).toHaveLength(10);
    expect(fams.slice(1).every((f) => f.onPoster === 0)).toBe(true);
  });
});

describe("list actions", () => {
  const owls = list.filter((s) => s.family === "Owls");

  it("add all, then remove these once everything is on", () => {
    expect(listActions(owls, "Owls", "", []).addAllLabel).toBe("Add all 12");
    const ids = owls.map((s) => s.id);
    const a = listActions(owls, "Owls", "", ids);
    expect(a.addAllLabel).toBe("Remove these 12");
    expect(a.allOn).toBe(true);
  });

  it("only this family is named, disabled when the poster already is exactly that", () => {
    const ids = owls.map((s) => s.id);
    expect(listActions(owls, "Owls", "", []).onlyLabel).toBe("Only owls");
    expect(listActions(owls, "Owls", "", ids).onlyDisabled).toBe(true);
    expect(
      listActions(owls, "Owls", "", [...ids, "falco-peregrinus"]).onlyDisabled,
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
  it("describes the list", () => {
    expect(statusLine(list, ALL, "", [])).toBe("All 118 birds");
    expect(statusLine(list.slice(0, 12), "Owls", "", [list[0].id])).toBe(
      "Owls, 12 birds, 1 on poster",
    );
    expect(statusLine(list.slice(0, 4), ALL, "owl", [])).toBe("4 found");
    expect(statusLine([], ALL, "zzz", [])).toBe("No bird matches that search.");
  });

  it("tray counts birds and families with the right plural", () => {
    expect(trayLabel([], byId)).toBe("empty");
    expect(trayLabel(["tyto-alba"], byId)).toBe("1 bird from 1 family");
    const mix = ["tyto-alba", "asio-otus", "falco-peregrinus"];
    expect(trayLabel(mix, byId)).toBe("3 birds from 2 families");
  });
});

describe("presets", () => {
  it("only list birds that exist, once each", () => {
    for (const p of PRESETS) {
      expect(p.ids.length, p.id).toBeGreaterThan(5);
      expect(new Set(p.ids).size, `${p.id} has duplicates`).toBe(p.ids.length);
      for (const id of p.ids) expect(byId.has(id), `${p.id}: ${id}`).toBe(true);
    }
  });

  it("have unique ids and titles", () => {
    expect(new Set(PRESETS.map((p) => p.id)).size).toBe(PRESETS.length);
    expect(new Set(PRESETS.map((p) => p.title)).size).toBe(PRESETS.length);
  });
});
