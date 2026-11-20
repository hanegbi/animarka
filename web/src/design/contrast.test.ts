import { describe, expect, it } from "vitest";
import { contrastRatio, grade } from "./contrast";
import { THEMES } from "./themes";

describe("contrast", () => {
  it("black on white is 21", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 0);
  });

  it("grades ratios", () => {
    expect(grade(2.9)).toBe("fail");
    expect(grade(3.4)).toBe("AA large");
    expect(grade(4.6)).toBe("AA");
    expect(grade(8)).toBe("AAA");
  });

  it("every theme passes AA for its text roles", () => {
    for (const t of THEMES) {
      expect(
        contrastRatio(t.text, t.bg),
        `${t.id} text`,
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(t.muted, t.bg),
        `${t.id} muted`,
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(t.muted, t.surface),
        `${t.id} muted on surface`,
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(t.accentStrong, t.bg),
        `${t.id} accent text`,
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(t.onAccent, t.accentStrong),
        `${t.id} button label`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});
