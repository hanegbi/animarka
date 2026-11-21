/**
 * Loads the catalog from the API once per page. The browser's HTTP cache handles ETag revalidation.
 * The last good copy is also kept in localStorage, so a failed request (offline, API down) still
 * shows the birds, marked stale. Only when there is no copy at all does the page show an error.
 */

import {
  PRESETS_URL,
  SPECIES_URL,
  type ApiPreset,
  type ApiSpeciesList,
} from "./api";
import type { Preset } from "./presets";
import { toView, type SpeciesView } from "./species-view";

export type CatalogData = {
  species: Map<string, SpeciesView>;
  /** Species in catalog (taxonomic) order. */
  list: SpeciesView[];
  presets: Preset[];
};

export type CatalogState =
  | { status: "loading" }
  | { status: "ready"; data: CatalogData; stale: boolean }
  | { status: "error" };

export type CatalogRaw = { species: ApiSpeciesList; presets: ApiPreset[] };
type Raw = CatalogRaw;

export const CACHE_KEY = "animarka:catalog:v1";

export function buildCatalog(raw: Raw): CatalogData {
  const species = new Map(raw.species.species.map((s) => [s.id, toView(s)]));
  const presets = raw.presets
    .map((p) => ({ ...p, ids: p.ids.filter((id) => species.has(id)) }))
    .filter((p) => p.ids.length > 1);
  return { species, list: [...species.values()], presets };
}

async function getJson<T>(fetchFn: typeof fetch, url: string): Promise<T> {
  // No custom headers, so the request matches the <link rel="preload"> in the page head.
  const res = await fetchFn(url);
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  return (await res.json()) as T;
}

function readCache(storage: Storage | undefined): Raw | null {
  try {
    const text = storage?.getItem(CACHE_KEY);
    return text ? (JSON.parse(text) as Raw) : null;
  } catch {
    return null;
  }
}

function writeCache(storage: Storage | undefined, raw: Raw): void {
  try {
    storage?.setItem(CACHE_KEY, JSON.stringify(raw));
  } catch {
    // Full or blocked storage only costs the offline copy.
  }
}

export async function fetchCatalog(
  fetchFn: typeof fetch,
  storage: Storage | undefined,
  defer: (fn: () => void) => void = (fn) => fn(),
): Promise<{ data: CatalogData; stale: boolean }> {
  try {
    const [species, presets] = await Promise.all([
      getJson<ApiSpeciesList>(fetchFn, SPECIES_URL),
      getJson<ApiPreset[]>(fetchFn, PRESETS_URL),
    ]);
    const raw = { species, presets };
    defer(() => writeCache(storage, raw));
    return { data: buildCatalog(raw), stale: false };
  } catch (err) {
    const cached = readCache(storage);
    if (cached) return { data: buildCatalog(cached), stale: true };
    throw err;
  }
}

/* A tiny store for useSyncExternalStore. Loading starts on the first subscriber, in the browser. */

let state: CatalogState = { status: "loading" };
let started = false;
const listeners = new Set<() => void>();
const SERVER_STATE: CatalogState = { status: "loading" };

function set(next: CatalogState) {
  state = next;
  for (const l of listeners) l();
}

function browserStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function idle(fn: () => void) {
  if ("requestIdleCallback" in window)
    window.requestIdleCallback(fn, { timeout: 5000 });
  else setTimeout(fn, 1000);
}

function start() {
  if (started) return;
  started = true;
  fetchCatalog(window.fetch.bind(window), browserStorage(), idle).then(
    ({ data, stale }) => set({ status: "ready", data, stale }),
    () => {
      started = false;
      set({ status: "error" });
    },
  );
}

export const catalogStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    start();
    return () => listeners.delete(listener);
  },
  get: () => state,
  server: () => SERVER_STATE,
  retry() {
    set({ status: "loading" });
    start();
  },
};
