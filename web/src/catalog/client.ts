/**
 * Loads the catalog from the API once per page. The browser's HTTP cache handles ETag revalidation.
 * The last good copy is also kept in localStorage, so a failed request (offline, API down) still
 * shows the birds, marked stale. Only when there is no copy at all does the page show an error.
 *
 * With 11,000 birds the full list is about 320 KB, so the first poster does not wait for it: a
 * saved copy shows at once, or else a tiny request brings just the poster's birds, and the full
 * list replaces either when it arrives (`complete`).
 */

import { PRESETS_URL, SPECIES_URL, type ApiPreset } from "./api";
import { decodeCompact, type ApiCompact } from "./compact";
import { STARTER_IDS } from "./starter";
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
  | {
      status: "ready";
      data: CatalogData;
      stale: boolean;
      /** False while only the poster's birds are loaded; the picker waits for the rest. */
      complete: boolean;
    }
  | { status: "error" };

/** As it came over the wire: the compact species form and the presets. Also the saved copy. */
export type CatalogRaw = { species: ApiCompact; presets: ApiPreset[] };
type Raw = CatalogRaw;

// v2: the compact form, about a fifth of the full one, so 11,000 birds fit in localStorage.
export const CACHE_KEY = "animarka:catalog:v2";

export function buildCatalog(raw: Raw): CatalogData {
  const species = new Map(
    decodeCompact(raw.species).species.map((s) => [s.id, toView(s)]),
  );
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
      getJson<ApiCompact>(fetchFn, SPECIES_URL),
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

/** Birds the first poster needs: a shared poster's, else the saved poster's, else the starter. */
let wanted: string[] | null = null;
const POSTER_KEY = "animarka-poster-v1"; // poster/state/storage.ts STORAGE_KEY

function firstIds(storage: Storage | undefined): string[] {
  if (wanted) return wanted;
  try {
    const order = JSON.parse(storage?.getItem(POSTER_KEY) ?? "null")?.order;
    if (Array.isArray(order) && order.length)
      return order.filter((x): x is string => typeof x === "string");
  } catch {
    // Unreadable: the starter poster it is.
  }
  return STARTER_IDS;
}

function start() {
  if (started) return;
  started = true;
  const fetchFn = window.fetch.bind(window);
  const storage = browserStorage();
  const full = fetchCatalog(fetchFn, storage, idle);
  const cached = readCache(storage);
  if (cached)
    set({
      status: "ready",
      data: buildCatalog(cached),
      stale: true,
      complete: true,
    });
  else {
    const ids = encodeURIComponent(firstIds(storage).join(","));
    Promise.all([
      getJson<ApiCompact>(fetchFn, `${SPECIES_URL}&ids=${ids}`),
      getJson<ApiPreset[]>(fetchFn, PRESETS_URL),
    ]).then(
      ([species, presets]) => {
        if (state.status !== "ready")
          set({
            status: "ready",
            data: buildCatalog({ species, presets }),
            stale: false,
            complete: false,
          });
      },
      () => {},
    );
  }
  full.then(
    ({ data, stale }) => set({ status: "ready", data, stale, complete: true }),
    () => {
      started = false;
      if (state.status !== "ready") set({ status: "error" });
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
  /** A shared poster's birds, so the first request brings them. Call before subscribing. */
  want(ids: string[]) {
    wanted = ids;
  },
  server: () => SERVER_STATE,
  retry() {
    set({ status: "loading" });
    start();
  },
};
