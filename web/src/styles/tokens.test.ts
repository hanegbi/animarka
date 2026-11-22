import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/design/contrast";

const SRC = join(process.cwd(), "src");
const css = readFileSync(join(SRC, "styles", "tokens.css"), "utf8");

/** Read the palette variables from one block of tokens.css. */
function palette(block: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of block.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6})/g))
    out[m[1]] = m[2];
  return out;
}

const light = palette(
  css.slice(css.indexOf(":root {"), css.indexOf(".dark {")),
);
const dark = palette(css.slice(css.indexOf(".dark {"), css.indexOf("@media")));

describe("token contrast", () => {
  for (const [name, p] of [
    ["light", light],
    ["dark", dark],
  ] as const) {
    it(`${name}: text roles pass AA`, () => {
      expect(
        contrastRatio(p.ink, p.paper),
        "ink on paper",
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(p["ink-muted"], p.paper),
        "muted on paper",
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(p["ink-muted"], p["card-paper"]),
        "muted on card",
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(p.forest, p.paper),
        "accent as text",
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(p["on-forest"], p.forest),
        "button label",
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(p.danger, p.paper),
        "danger as text",
      ).toBeGreaterThanOrEqual(4.5);
    });
  }
});

describe("no raw colors outside the token file", () => {
  // Design sample pages are dev only. Poster paper colors are data, not tokens.
  const ALLOWED = [
    "styles/tokens.css",
    "styles/landing-tokens.css",
    "catalog/backgrounds.ts",
    "design/",
    "app/design/",
  ];
  const HEX = /#[0-9a-fA-F]{3,8}\b/;

  function walk(dir: string): string[] {
    return readdirSync(dir).flatMap((f) => {
      const full = join(dir, f);
      return statSync(full).isDirectory() ? walk(full) : [full];
    });
  }

  it("finds none", () => {
    const offenders = walk(SRC)
      .filter((f) => /\.(tsx?|css)$/.test(f))
      .map((f) => relative(SRC, f).split(sep).join("/"))
      .filter(
        (rel) =>
          !rel.endsWith(".test.ts") &&
          !ALLOWED.some((a) => rel.startsWith(a) || rel === a),
      )
      .filter((rel) => HEX.test(readFileSync(join(SRC, rel), "utf8")));
    expect(offenders).toEqual([]);
  });
});
