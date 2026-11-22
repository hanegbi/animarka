"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { preload } from "react-dom";
import { useStore, type StoreApi } from "zustand";
import { PRESETS_URL, SPECIES_URL } from "@/catalog/api";
import { catalogStore, type CatalogData } from "@/catalog/client";
import { BACKGROUND_IDS, STYLE_IDS, liveLookup } from "@/catalog/lookup";
import type { Preset } from "@/catalog/presets";
import type { SpeciesView } from "@/catalog/species-view";
import { STARTER_IDS } from "@/catalog/starter";
import { Button } from "@/components/ui/button";
import { createPosterStore, type PosterStore } from "./store";
import type { PosterContext } from "./types";

type Ctx = {
  store: StoreApi<PosterStore>;
  /** False while only the poster's birds are loaded. */
  complete: boolean;
  poster: PosterContext;
  species: Map<string, SpeciesView>;
  list: SpeciesView[];
  presets: Preset[];
};

const PosterReactContext = createContext<Ctx | null>(null);

/**
 * Loads the catalog in the browser, then creates the poster store from it. Until then it shows the
 * fallback. The server and the hydration pass both see "loading", so the saved poster never causes a
 * server and client mismatch. Pass `catalog` to skip loading (design pages and tests).
 */
export function PosterProvider({
  children,
  fallback,
  catalog: given,
  shared,
}: {
  children: ReactNode;
  fallback: ReactNode;
  catalog?: CatalogData;
  /** A poster state from a share link. */
  shared?: unknown;
}) {
  // Start both requests from the document head, before the scripts run.
  if (!given) {
    const order = (shared as { order?: unknown } | undefined)?.order;
    if (Array.isArray(order))
      catalogStore.want(order.filter((x) => typeof x === "string"));
    preload(SPECIES_URL, { as: "fetch", crossOrigin: "anonymous" });
    preload(PRESETS_URL, { as: "fetch", crossOrigin: "anonymous" });
  }
  const loaded = useSyncExternalStore(
    catalogStore.subscribe,
    catalogStore.get,
    catalogStore.server,
  );
  if (given)
    return (
      <Ready data={given} shared={shared}>
        {children}
      </Ready>
    );
  if (loaded.status === "loading") return <>{fallback}</>;
  if (loaded.status === "error") return <CatalogError />;
  return (
    <Ready
      data={loaded.data}
      stale={loaded.stale}
      complete={loaded.complete}
      shared={shared}
    >
      {children}
    </Ready>
  );
}

function Ready({
  data,
  shared,
  complete = true,
  children,
}: {
  data: CatalogData;
  /** True when the catalog came from this device's saved copy. Shown nowhere for now. */
  stale?: boolean;
  complete?: boolean;
  shared?: unknown;
  children: ReactNode;
}) {
  // The poster store is made once. When the full catalog replaces the first, partial one, the
  // store keeps its poster and its undo history and simply sees the new birds through `live`.
  const [live] = useState(() => liveLookup(data.species));
  useLayoutEffect(() => live.set(data.species), [live, data.species]);
  const made = useMemo(() => {
    const poster: PosterContext = {
      catalog: live.lookup,
      styles: STYLE_IDS,
      backgrounds: BACKGROUND_IDS,
    };
    let storage: Storage | undefined;
    try {
      storage = window.localStorage;
    } catch {
      storage = undefined;
    }
    const starter = STARTER_IDS.filter((id) => data.species.has(id));
    return {
      store: createPosterStore(poster, { starter, storage, initial: shared }),
      poster,
    };
    // Made once per poster source; new catalog data flows in through `live`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, shared]);
  const value = useMemo(
    () => ({
      ...made,
      complete,
      species: data.species,
      list: data.list,
      presets: data.presets,
    }),
    [made, complete, data],
  );

  return (
    <PosterReactContext.Provider value={value}>
      {children}
    </PosterReactContext.Provider>
  );
}

function CatalogError() {
  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <div
        role="alert"
        className="bg-card text-card-foreground flex max-w-sm flex-col items-center gap-3 rounded-xl border p-6 text-center shadow-sm"
      >
        <h1 className="font-heading text-xl font-semibold">
          We could not load the birds
        </h1>
        <p className="text-muted-foreground text-sm">
          Check your connection and try again.
        </p>
        <Button onClick={() => catalogStore.retry()}>Try again</Button>
      </div>
    </main>
  );
}

function useCtx(): Ctx {
  const c = useContext(PosterReactContext);
  if (!c) throw new Error("usePoster must be used inside PosterProvider");
  return c;
}

export function usePosterState() {
  const { store } = useCtx();
  return useStore(store, (s) => s.history.present);
}

export function usePosterActions() {
  const { store } = useCtx();
  return useMemo(
    () => ({
      dispatch: store.getState().dispatch,
      undo: store.getState().undo,
      redo: store.getState().redo,
    }),
    [store],
  );
}

export function useHistoryFlags() {
  const { store } = useCtx();
  return {
    canUndo: useStore(store, (s) => s.history.past.length > 0),
    canRedo: useStore(store, (s) => s.history.future.length > 0),
  };
}

export function useCatalog() {
  const { species, list, presets, poster, complete } = useCtx();
  return { species, list, presets, ctx: poster, complete };
}
