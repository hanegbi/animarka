/** Loads a poster from a share link once per id, as a tiny store for useSyncExternalStore. */

export type SharedState =
  | { status: "loading" }
  | { status: "ready"; state: unknown }
  | { status: "missing" };

const cache = new Map<string, SharedState>();
const listeners = new Set<() => void>();
const LOADING: SharedState = { status: "loading" };

function load(id: string) {
  if (cache.has(id)) return;
  cache.set(id, LOADING);
  fetch(`/api/v1/posters/${encodeURIComponent(id)}`)
    .then((r) =>
      r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
    )
    .then(
      (body: { state: unknown }) =>
        cache.set(id, { status: "ready", state: body.state }),
      () => cache.set(id, { status: "missing" }),
    )
    .finally(() => listeners.forEach((l) => l()));
}

export const sharedPoster = {
  subscribe(id: string) {
    return (listener: () => void) => {
      listeners.add(listener);
      load(id);
      return () => listeners.delete(listener);
    };
  },
  get: (id: string) => () => cache.get(id) ?? LOADING,
  server: () => LOADING,
};

/** The last poster saved from this tab, so an unchanged poster keeps its link (B2). */
let lastSaved: { key: string; url: string } | null = null;

/** Save the poster and return its share URL. While the poster is unchanged, reuse the saved one. */
export async function sharePoster(state: unknown): Promise<string> {
  const key = JSON.stringify(state);
  if (lastSaved?.key === key) return lastSaved.url;
  const res = await fetch("/api/v1/posters", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state }),
  });
  if (!res.ok) throw new Error(`share failed: ${res.status}`);
  const { url } = (await res.json()) as { url: string };
  const full = new URL(url, window.location.origin).toString();
  lastSaved = { key, url: full };
  return full;
}

/** Copy text, but give up after `ms`: some browsers leave the clipboard promise hanging (B2). */
export async function copyWithin(text: string, ms = 1500): Promise<boolean> {
  if (!navigator.clipboard?.writeText) return false;
  let timer = 0;
  const timeout = new Promise<boolean>((resolve) => {
    timer = window.setTimeout(() => resolve(false), ms);
  });
  const copy = navigator.clipboard.writeText(text).then(
    () => true,
    () => false,
  );
  try {
    return await Promise.race([copy, timeout]);
  } finally {
    window.clearTimeout(timer);
  }
}
