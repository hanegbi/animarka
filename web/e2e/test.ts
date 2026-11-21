import fs from "node:fs";
import path from "node:path";
import { test as base, expect } from "@playwright/test";

/**
 * Every spec imports `test` from here. Unless E2E_LIVE_API=1, the catalog API is answered from the
 * committed fixture (a slice of the real API, see scripts/make_web_fixture.py) and every art file is
 * one small placeholder, so the suite runs without the backend. With E2E_LIVE_API=1 the requests go
 * through the Next.js proxy to the real API from docker compose.
 *
 * Specs get the same catalog the page sees as the `catalog` fixture, so expected counts are computed,
 * never hard coded.
 */

export const LIVE = process.env.E2E_LIVE_API === "1";
const API = process.env.API_ORIGIN ?? "http://localhost:8000";

type Species = {
  id: string;
  sci: string;
  family: string;
  names: { en?: string; he?: string };
};
type Preset = { id: string; title: string; ids: string[] };
type Raw = { species: { species: Species[] }; presets: Preset[] };

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

export class Catalog {
  readonly list: Species[];
  readonly presets: Preset[];
  private byId: Map<string, Species>;

  constructor(raw: Raw) {
    this.list = raw.species.species;
    this.presets = raw.presets;
    this.byId = new Map(this.list.map((s) => [s.id, s]));
  }

  get(id: string): Species {
    const s = this.byId.get(id);
    if (!s) throw new Error(`${id} is not in the catalog`);
    return s;
  }

  name(id: string): string {
    return this.get(id).names.en ?? this.get(id).sci;
  }

  family(name: string): Species[] {
    return this.list.filter((s) => s.family === name);
  }

  familiesOf(ids: string[]): Set<string> {
    return new Set(ids.map((id) => this.get(id).family));
  }

  preset(id: string): Preset {
    const p = this.presets.find((x) => x.id === id);
    if (!p) throw new Error(`no preset ${id}`);
    return p;
  }

  /** The same rule as the picker: every word must appear in a name, the scientific name or the family. */
  search(query: string): Species[] {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    return this.list.filter((s) => {
      const text = normalize(
        [s.names.en, s.names.he, s.sci, s.family].filter(Boolean).join(" | "),
      );
      return words.every((w) => text.includes(w));
    });
  }
}

const ART = fs.readFileSync(path.resolve("e2e/fixtures/art.webp"));

async function loadRaw(): Promise<Raw> {
  if (!LIVE)
    return JSON.parse(
      fs.readFileSync(path.resolve("src/catalog/fixture/catalog.json"), "utf8"),
    );
  const get = async (p: string) => (await fetch(`${API}${p}`)).json();
  return {
    species: await get("/api/v1/catalogs/birds/species?lang=en,he"),
    presets: await get("/api/v1/catalogs/birds/presets"),
  };
}

export const test = base.extend<
  { mockApi: void },
  { raw: Raw; catalog: Catalog }
>({
  raw: [async ({}, use) => use(await loadRaw()), { scope: "worker" }],
  catalog: [async ({ raw }, use) => use(new Catalog(raw)), { scope: "worker" }],
  mockApi: [
    async ({ context, raw }, use) => {
      if (!LIVE) {
        await context.route("**/api/v1/**", (route) => {
          const { pathname } = new URL(route.request().url());
          if (pathname.endsWith("/species"))
            return route.fulfill({ json: raw.species });
          if (pathname.endsWith("/presets"))
            return route.fulfill({ json: raw.presets });
          if (pathname.startsWith("/api/v1/files/"))
            return route.fulfill({
              body: ART,
              contentType: "image/webp",
              headers: {
                "cache-control": "public, max-age=31536000, immutable",
              },
            });
          return route.fulfill({ status: 404, json: { detail: "Not found" } });
        });
      }
      await use();
    },
    { auto: true },
  ],
});

export { expect };
