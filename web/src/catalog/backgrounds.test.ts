import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BACKGROUNDS, backgroundOf } from "./backgrounds";
import { contrastRatio } from "@/design/contrast";

describe("backgrounds", () => {
  it("ships five paper colors and the three launch images", () => {
    expect(
      BACKGROUNDS.filter((b) => b.kind === "color").map((b) => b.id),
    ).toEqual(["cream", "white", "sage", "blush", "night"]);
    expect(
      BACKGROUNDS.filter((b) => b.kind === "image").map((b) => b.name),
    ).toEqual(["Aged paper", "Morning sky", "Forest"]);
  });

  it("ids are unique and every image file exists", () => {
    expect(new Set(BACKGROUNDS.map((b) => b.id)).size).toBe(BACKGROUNDS.length);
    for (const b of BACKGROUNDS.filter((x) => x.kind === "image")) {
      expect(existsSync(join(process.cwd(), "public", b.image!)), b.image).toBe(
        true,
      );
      expect(
        existsSync(join(process.cwd(), "public", b.imageFull!)),
        b.imageFull,
      ).toBe(true);
    }
  });

  it("title and label ink passes AA on every background color", () => {
    for (const b of BACKGROUNDS) {
      expect(contrastRatio(b.ink, b.color), b.id).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("dark flag matches the actual color, so ink switches the right way", () => {
    for (const b of BACKGROUNDS) {
      const inkIsLight =
        contrastRatio(b.ink, "#000000") > contrastRatio(b.ink, "#ffffff");
      expect(inkIsLight, b.id).toBe(b.isDark);
    }
  });

  it("an unknown id falls back to the first background", () => {
    expect(backgroundOf("nope").id).toBe("cream");
  });
});
