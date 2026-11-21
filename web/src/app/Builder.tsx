"use client";

import { Picker } from "@/picker/Picker";
import { Poster } from "@/poster/components/Poster";
import { frameAspect } from "@/poster/layout/sizing";
import {
  useCatalog,
  usePosterActions,
  usePosterState,
} from "@/poster/state/provider";

/** Interim page. The final shell, with the toolbar and the phone tab bar, is built in M1.12. */
export function Builder() {
  const state = usePosterState();
  const { dispatch } = usePosterActions();
  const { species, ctx } = useCatalog();
  const aspect = frameAspect(state.size, state.orientation);

  return (
    <div className="grid h-dvh min-h-0 grid-cols-1 lg:grid-cols-[380px_1fr]">
      <aside
        className="bg-card min-h-0 overflow-y-auto border-e p-3"
        aria-label="Pick birds"
      >
        <Picker />
      </aside>
      <main className="flex min-h-0 items-center justify-center overflow-auto p-4">
        <div
          className="w-full"
          style={{ maxWidth: `calc((100dvh - 2rem) * ${aspect})` }}
        >
          <Poster
            state={state}
            species={species}
            catalog={ctx.catalog}
            className="shadow-md"
            onTitleChange={(title) => dispatch({ type: "setTitle", title })}
          />
        </div>
      </main>
    </div>
  );
}

export function BuilderFallback() {
  return (
    <div className="grid h-dvh place-items-center" aria-busy="true">
      <p className="text-muted-foreground">Loading your poster</p>
    </div>
  );
}
