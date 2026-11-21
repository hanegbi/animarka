/* eslint-disable @next/next/no-img-element */
"use client";

import { XIcon } from "lucide-react";
import { artSrc, displayName, type SpeciesView } from "@/catalog/species-view";
import type { Lang } from "@/poster/state/types";

/**
 * T2. Thumbnail strip. Round pictures with a remove cross.
 * P1. A plain dark label shows the name on hover and on keyboard focus. It is drawn with CSS, because the
 * shadcn tooltip pulls in about 34 KB of floating-position code, more than the whole picker, for a one-word label.
 * The name is also the accessible name of the button, so the label is only a visual aid.
 * Adapted from Removable Badges by bundui.
 */
export function Tray({
  order,
  species,
  style,
  lang,
  onRemove,
}: {
  order: string[];
  species: Map<string, SpeciesView>;
  style: string;
  lang: Lang;
  onRemove: (id: string, name: string) => void;
}) {
  if (!order.length) {
    return (
      <p className="text-muted-foreground text-sm">
        Empty. Pick birds above, or try Surprise mix.
      </p>
    );
  }
  return (
    // The top padding is room for the label above the first row, since this box scrolls and would clip it.
    <ul
      aria-label="Birds on your poster"
      className="flex max-h-48 flex-wrap gap-2 overflow-y-auto p-1 pt-9"
    >
      {order.map((id) => {
        const s = species.get(id);
        if (!s) return null;
        const name = displayName(s, lang);
        return (
          <li key={id}>
            <button
              type="button"
              onClick={() => onRemove(id, name)}
              aria-label={`Remove ${name} from poster`}
              className="group/thumb focus-visible:ring-ring/50 relative block size-11 rounded-full outline-none focus-visible:ring-3"
            >
              <img
                src={artSrc(s, style, "thumb")}
                alt=""
                width={44}
                height={44}
                loading="lazy"
                className="bg-card size-11 rounded-full border object-contain"
              />
              <span
                aria-hidden
                className="bg-card text-foreground group-hover/thumb:bg-primary group-hover/thumb:text-primary-foreground absolute -end-1 -top-1 grid size-5 place-items-center rounded-full border shadow-sm"
              >
                <XIcon className="size-3" />
              </span>
              <span
                aria-hidden
                data-tray-label
                className="bg-foreground text-background pointer-events-none absolute start-1/2 bottom-full z-10 mb-1 max-w-48 -translate-x-1/2 truncate rounded-md px-3 py-1.5 text-xs whitespace-nowrap opacity-0 transition-opacity group-hover/thumb:opacity-100 group-hover/thumb:delay-300 group-focus-visible/thumb:opacity-100 motion-reduce:transition-none"
              >
                {name}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
