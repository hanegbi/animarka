"use client";

import { PRESETS } from "@/catalog/presets";
import { Button } from "@/components/ui/button";
import { InteractivePoster } from "@/poster/components/InteractivePoster";
import { frameAspect } from "@/poster/layout/sizing";
import {
  useCatalog,
  usePosterActions,
  usePosterState,
} from "@/poster/state/provider";

/** E1. Shown on the poster while it has no birds: what to do, and two ways to start. */
function EmptyPoster({ phone }: { phone?: boolean }) {
  const { dispatch } = usePosterActions();
  const preset = PRESETS[0];
  return (
    <div
      className="absolute inset-0 grid place-items-center p-3"
      data-empty-poster
    >
      <div className="bg-card/95 text-card-foreground flex max-w-xs flex-col items-center gap-2 rounded-xl border p-4 text-center shadow-sm">
        <h2 className="font-heading text-lg font-semibold">
          Your poster is empty
        </h2>
        <p className="text-muted-foreground text-sm">
          {phone
            ? "Pick birds below, or start with a mix."
            : "Pick birds on the left, or start with a mix."}
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

/**
 * The poster, as large as fits in the space it is given, both in width and in height.
 * The parent decides the space. The poster never scrolls and is never covered by controls.
 */
export function PosterStage({ phone }: { phone?: boolean }) {
  const state = usePosterState();
  const { dispatch } = usePosterActions();
  const { species, ctx } = useCatalog();
  const aspect = frameAspect(state.size, state.orientation);

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 items-center justify-center">
      <div
        className="flex max-h-full max-w-full items-center"
        style={{ aspectRatio: String(aspect), height: "100%" }}
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
          overlay={
            state.order.length === 0 ? <EmptyPoster phone={phone} /> : undefined
          }
        />
      </div>
    </div>
  );
}
