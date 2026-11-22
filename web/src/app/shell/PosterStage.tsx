"use client";

import { pickCenter } from "@/poster/layout/centerpiece";
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
  const preset = useCatalog().presets[0];
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
          {preset && (
            <Button
              variant="outline"
              onClick={() => dispatch({ type: "replaceWith", ids: preset.ids })}
            >
              {preset.title}
            </Button>
          )}
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

  /**
   * In the centerpiece layout the big bird is the chosen centre, or else the heaviest. A swap with
   * that bird hands the centre to the other one, so the dropped bird really takes the big spot.
   */
  const centerAfterSwap = (a: string, b: string): string | undefined => {
    if (state.layout !== "centerpiece") return undefined;
    const animals = state.order.map((id) => ({
      id,
      massG: species.get(id)?.massG ?? 0,
    }));
    const current = animals[pickCenter(animals, state.center)]?.id;
    if (current === a) return b;
    if (current === b) return a;
    return undefined;
  };

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
          onNameChange={(id, name) => dispatch({ type: "setName", id, name })}
          onMirror={(id) => dispatch({ type: "mirror", id })}
          // No message on remove (owner call, R8). Undo in the header brings a bird back.
          onRemove={(id) => dispatch({ type: "toggle", id })}
          onSwap={(a, b) =>
            dispatch({ type: "swap", a, b, center: centerAfterSwap(a, b) })
          }
          onMove={(id, delta) => dispatch({ type: "move", id, delta })}
          overlay={
            state.order.length === 0 ? <EmptyPoster phone={phone} /> : undefined
          }
        />
      </div>
    </div>
  );
}
