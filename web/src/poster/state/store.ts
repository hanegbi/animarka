import { createStore, type StoreApi } from "zustand/vanilla";
import { apply, createHistory, redo, undo, type History } from "./history";
import { initialState } from "./reducer";
import { loadState, saveState } from "./storage";
import type { PosterAction, PosterContext, PosterState } from "./types";

export type PosterStore = {
  history: History;
  /** Returns true when the action changed the poster, so callers can offer Undo only when there is something to undo. */
  dispatch: (action: PosterAction) => boolean;
  undo: () => void;
  redo: () => void;
  /** Replace the poster, for example from a share link. Clears undo. */
  replace: (state: PosterState) => void;
};

export function createPosterStore(
  ctx: PosterContext,
  options: {
    starter?: string[];
    storage?: Pick<Storage, "getItem" | "setItem">;
  } = {},
): StoreApi<PosterStore> {
  const saved = loadState(options.storage, ctx);
  const start = saved ?? initialState(ctx, options.starter ?? []);

  const store = createStore<PosterStore>((set, get) => ({
    history: createHistory(start),
    dispatch: (action) => {
      const before = get().history;
      const after = apply(before, action, ctx);
      if (after === before) return false;
      set({ history: after });
      return true;
    },
    undo: () => set((s) => ({ history: undo(s.history) })),
    redo: () => set((s) => ({ history: redo(s.history) })),
    replace: (state) => set(() => ({ history: createHistory(state) })),
  }));

  if (options.storage) {
    store.subscribe((s, prev) => {
      if (s.history.present !== prev.history.present)
        saveState(options.storage, s.history.present);
    });
  }
  return store;
}

export const selectPoster = (s: PosterStore) => s.history.present;
export const selectCanUndo = (s: PosterStore) => s.history.past.length > 0;
export const selectCanRedo = (s: PosterStore) => s.history.future.length > 0;
