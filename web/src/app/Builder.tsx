"use client";

import { ControlsPanel } from "@/controls/ControlsPanel";
import { HistoryBar } from "@/controls/HistoryBar";
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
    <div className="flex flex-col lg:grid lg:h-dvh lg:min-h-0 lg:grid-cols-[380px_1fr_340px]">
      <aside
        className="bg-card order-2 border-t p-3 lg:order-none lg:min-h-0 lg:overflow-y-auto lg:border-e lg:border-t-0"
        aria-label="Pick birds"
      >
        <Picker />
      </aside>
      <main className="order-1 flex flex-col items-center gap-3 p-4 lg:order-none lg:min-h-0 lg:overflow-auto">
        <HistoryBar />
        <div className="flex min-h-0 w-full flex-1 items-center justify-center">
          <div
            className="w-full"
            style={{ maxWidth: `calc((100dvh - 8rem) * ${aspect})` }}
          >
            <Poster
              state={state}
              species={species}
              catalog={ctx.catalog}
              className="shadow-md"
              onTitleChange={(title) => dispatch({ type: "setTitle", title })}
            />
          </div>
        </div>
      </main>
      <aside
        className="bg-card order-3 border-t p-3 lg:order-none lg:min-h-0 lg:overflow-y-auto lg:border-s lg:border-t-0"
        aria-label="Poster style"
      >
        <ControlsPanel />
      </aside>
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
