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

/** Save the poster and return its share URL. */
export async function sharePoster(state: unknown): Promise<string> {
  const res = await fetch("/api/v1/posters", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state }),
  });
  if (!res.ok) throw new Error(`share failed: ${res.status}`);
  const { url } = (await res.json()) as { url: string };
  return new URL(url, window.location.origin).toString();
}
