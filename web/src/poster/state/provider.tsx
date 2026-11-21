"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { preload } from "react-dom";
import { useStore, type StoreApi } from "zustand";
import { PRESETS_URL, SPECIES_URL } from "@/catalog/api";
import { catalogStore, type CatalogData } from "@/catalog/client";
import { BACKGROUND_IDS, STYLE_IDS, viewLookup } from "@/catalog/lookup";
import type { Preset } from "@/catalog/presets";
import type { SpeciesView } from "@/catalog/species-view";
import { STARTER_IDS } from "@/catalog/starter";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/notify";
import { createPosterStore, type PosterStore } from "./store";
import type { PosterContext } from "./types";

type Ctx = {
  store: StoreApi<PosterStore>;
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
}: {
  children: ReactNode;
  fallback: ReactNode;
  catalog?: CatalogData;
}) {
  // Start both requests from the document head, before the scripts run.
  if (!given) {
    preload(SPECIES_URL, { as: "fetch", crossOrigin: "anonymous" });
    preload(PRESETS_URL, { as: "fetch", crossOrigin: "anonymous" });
  }
  const loaded = useSyncExternalStore(
    catalogStore.subscribe,
    catalogStore.get,
    catalogStore.server,
  );
  if (given) return <Ready data={given}>{children}</Ready>;
  if (loaded.status === "loading") return <>{fallback}</>;
  if (loaded.status === "error") return <CatalogError />;
  return (
    <Ready data={loaded.data} stale={loaded.stale}>
      {children}
    </Ready>
  );
}

function Ready({
  data,
  stale,
  children,
}: {
  data: CatalogData;
  stale?: boolean;
  children: ReactNode;
}) {
  const value = useMemo(() => {
    const poster: PosterContext = {
      catalog: viewLookup(data.species),
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
      store: createPosterStore(poster, { starter, storage }),
      poster,
      species: data.species,
      list: data.list,
      presets: data.presets,
    };
  }, [data]);

  useEffect(() => {
    if (stale)
      notify(
        "Showing the birds saved on this device. We could not reach the server.",
      );
  }, [stale]);

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
  const { species, list, presets, poster } = useCtx();
  return { species, list, presets, ctx: poster };
}
