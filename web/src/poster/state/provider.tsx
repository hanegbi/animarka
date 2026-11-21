"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useStore, type StoreApi } from "zustand";
import { BACKGROUND_IDS, STYLE_IDS, staticLookup } from "@/catalog/lookup";
import { staticSpeciesViews, type SpeciesView } from "@/catalog/species-view";
import { STARTER_IDS } from "@/catalog/static-m1";
import { createPosterStore, type PosterStore } from "./store";
import type { PosterContext } from "./types";

type Ctx = {
  store: StoreApi<PosterStore>;
  poster: PosterContext;
  species: Map<string, SpeciesView>;
};

const subscribeNever = () => () => {};

const PosterReactContext = createContext<Ctx | null>(null);

/**
 * Creates the poster store in the browser, after mount, so the saved poster never causes a server
 * and client mismatch. Until then it shows the fallback.
 */
export function PosterProvider({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback: ReactNode;
}) {
  const base = useMemo(() => {
    const catalog = staticLookup();
    return {
      poster: {
        catalog,
        styles: STYLE_IDS,
        backgrounds: BACKGROUND_IDS,
      } satisfies PosterContext,
      species: staticSpeciesViews(),
    };
  }, []);

  // False on the server and during hydration, true in the browser afterwards.
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const store = useMemo(() => {
    if (!mounted) return null;
    let storage: Storage | undefined;
    try {
      storage = window.localStorage;
    } catch {
      storage = undefined;
    }
    return createPosterStore(base.poster, { starter: STARTER_IDS, storage });
  }, [mounted, base]);

  if (!store) return <>{fallback}</>;
  return (
    <PosterReactContext.Provider value={{ store, ...base }}>
      {children}
    </PosterReactContext.Provider>
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
  const { species, poster } = useCtx();
  return {
    species,
    list: useMemo(() => [...species.values()], [species]),
    ctx: poster,
  };
}
