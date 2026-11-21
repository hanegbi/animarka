"use client";

import { ControlsPanel } from "@/controls/ControlsPanel";
import { HistoryBar } from "@/controls/HistoryBar";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PRESETS } from "@/catalog/presets";
import { Picker } from "@/picker/Picker";
import { InteractivePoster } from "@/poster/components/InteractivePoster";
import { frameAspect } from "@/poster/layout/sizing";
import {
  useCatalog,
  usePosterActions,
  usePosterState,
} from "@/poster/state/provider";

/** E1. Shown on the poster while it has no birds: what to do, and two ways to start. */
function EmptyPoster() {
  const { dispatch } = usePosterActions();
  const preset = PRESETS[0];
  return (
    <div
      className="absolute inset-0 grid place-items-center p-4"
      data-empty-poster
    >
      <div className="bg-card/95 text-card-foreground flex max-w-xs flex-col items-center gap-2 rounded-xl border p-5 text-center shadow-sm">
        <h2 className="font-heading text-xl font-semibold">
          Your poster is empty
        </h2>
        <p className="text-muted-foreground text-sm">
          Pick birds on the left, or start with a mix.
        </p>
        <div className="mt-1 flex flex-wrap justify-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              dispatch({
                type: "surprise",
                seed: Math.floor(Math.random() * 1e6),
              })
            }
          >
            Surprise mix
          </Button>
          <Button
            variant="outline"
            onClick={() => dispatch({ type: "replaceWith", ids: preset.ids })}
          >
            {preset.title}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Interim page. The final shell, with the toolbar and the phone tab bar, is built in M1.12. */
export function Builder() {
  const state = usePosterState();
  const { dispatch } = usePosterActions();
  const { species, ctx } = useCatalog();
  const aspect = frameAspect(state.size, state.orientation);

  return (
    <TooltipProvider delay={400}>
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
              <InteractivePoster
                state={state}
                species={species}
                catalog={ctx.catalog}
                className="shadow-md"
                onTitleChange={(title) => dispatch({ type: "setTitle", title })}
                onMirror={(id) => dispatch({ type: "mirror", id })}
                onSwap={(a, b) => dispatch({ type: "swap", a, b })}
                onMove={(id, delta) => dispatch({ type: "move", id, delta })}
                overlay={state.order.length === 0 ? <EmptyPoster /> : undefined}
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
      <Toaster />
    </TooltipProvider>
  );
}

const pulse = "animate-pulse motion-reduce:animate-none bg-muted";

/** L2. The shape of the page while the saved poster loads, so nothing jumps when it arrives. */
export function BuilderFallback() {
  return (
    <div
      className="flex flex-col lg:grid lg:h-dvh lg:grid-cols-[380px_1fr_340px]"
      role="status"
      aria-busy="true"
      aria-label="Loading your poster"
    >
      <div className="bg-card order-2 hidden space-y-3 border-e p-3 lg:order-none lg:block">
        <div className={`${pulse} h-11 rounded-lg`} />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={`${pulse} h-11 w-24 rounded-full`} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className={`${pulse} h-[124px] rounded-lg`} />
          ))}
        </div>
      </div>
      <div className="order-1 grid place-items-center p-4 lg:order-none">
        <div
          className={`${pulse} aspect-[3/4] w-full max-w-[560px] rounded-sm`}
          style={{ maxHeight: "calc(100dvh - 2rem)" }}
        />
      </div>
      <div className="bg-card order-3 hidden space-y-3 border-s p-3 lg:block">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={`${pulse} h-24 rounded-lg`} />
        ))}
      </div>
      <span className="sr-only">Loading your poster</span>
    </div>
  );
}
