import fs from "node:fs";
import type { ApiSpeciesList } from "../src/catalog/api";
import { encodeCompact } from "../src/catalog/compact";
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
        // Share links and renders, kept per test like a tiny backend.
        const posters = new Map<string, unknown>();
        let jobPolls = 0;
        await context.route("**/api/v1/**", (route) => {
          const req = route.request();
          const { pathname } = new URL(req.url());
          if (pathname === "/api/v1/posters" && req.method() === "POST") {
            const id = `t${String(posters.size + 1).padStart(7, "0")}`;
            posters.set(id, (req.postDataJSON() as { state: unknown }).state);
            return route.fulfill({ json: { id, url: `/p/${id}` } });
          }
          const poster = pathname.match(/^\/api\/v1\/posters\/([^/]+)$/);
          if (poster)
            return posters.has(poster[1])
              ? route.fulfill({
                  json: { id: poster[1], state: posters.get(poster[1]) },
                })
              : route.fulfill({
                  status: 404,
                  json: { detail: "No such poster" },
                });
          if (pathname === "/api/v1/renders")
            return route.fulfill({
              status: 202,
              json: { job_id: "job1", status: "queued" },
            });
          if (pathname === "/api/v1/jobs/job1") {
            jobPolls += 1;
            const done = jobPolls > 1;
            return route.fulfill({
              json: {
                id: "job1",
                type: "render",
                status: done ? "done" : "running",
                progress: done ? 1 : 0.4,
                result: done ? { png: "/api/v1/files/renders/job1.png" } : null,
                error: null,
              },
            });
          }
          if (pathname.endsWith("/species"))
            return route.fulfill({
              json:
                new URL(req.url()).searchParams.get("format") === "compact"
                  ? encodeCompact(raw.species as unknown as ApiSpeciesList)
                  : raw.species,
            });
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
