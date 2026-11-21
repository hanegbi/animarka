/* eslint-disable @next/next/no-img-element */
"use client";

import { XIcon } from "lucide-react";
import { useState } from "react";
import { artSrc, displayName, type SpeciesView } from "@/catalog/species-view";
import type { Lang } from "@/poster/state/types";

/** How many pictures show before a "+N" button: two rows in the picker panel. */
const COLLAPSED = 14;

/**
 * R8 C1. The birds on the poster, as round pictures pinned under the search. One click takes a bird
 * off. The bird sits inside the circle with padding, so it never touches the ring.
 * A plain dark label shows the name on hover and keyboard focus, drawn with CSS (no tooltip library).
 * The name is also the button's accessible name, so the label is only a visual aid.
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
  const [expanded, setExpanded] = useState(false);
  if (!order.length) {
    return (
      <p className="text-muted-foreground text-sm">
        Nothing yet. Tap birds below, or try Surprise mix.
      </p>
    );
  }
  const visible = expanded ? order : order.slice(0, COLLAPSED);
  const hidden = order.length - visible.length;
  return (
    <ul aria-label="Birds on your poster" className="flex flex-wrap gap-1.5">
      {visible.map((id) => {
        const s = species.get(id);
        if (!s) return null;
        const name = displayName(s, lang);
        return (
          <li key={id}>
            <button
              type="button"
              onClick={() => onRemove(id, name)}
              aria-label={`Remove ${name} from poster`}
              className="group/thumb bg-card hover:border-primary focus-visible:ring-ring/50 relative grid size-10 place-items-center rounded-full border outline-none focus-visible:ring-3 max-[1099px]:size-11"
            >
              <img
                src={artSrc(s, style, "thumb")}
                alt=""
                width={26}
                height={26}
                loading="lazy"
                // A 26 px box in a 40 px circle: even its corners stay inside the ring.
                className="size-[26px] object-contain max-[1099px]:size-7"
              />
              <span
                aria-hidden
                className="bg-foreground text-background absolute -end-1 -top-1 grid size-4 place-items-center rounded-full opacity-0 transition-opacity group-hover/thumb:opacity-100 group-focus-visible/thumb:opacity-100 motion-reduce:transition-none"
              >
                <XIcon className="size-2.5" strokeWidth={3} />
              </span>
              <span
                aria-hidden
                data-tray-label
                className="bg-foreground text-background pointer-events-none absolute start-1/2 top-full z-10 mt-1.5 max-w-48 -translate-x-1/2 truncate rounded-md px-2.5 py-1 text-xs whitespace-nowrap opacity-0 transition-opacity group-hover/thumb:opacity-100 group-hover/thumb:delay-300 group-focus-visible/thumb:opacity-100 motion-reduce:transition-none"
              >
                {name}
              </span>
            </button>
          </li>
        );
      })}
      {(hidden > 0 || expanded) && (
        <li>
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            className="bg-muted text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 h-10 rounded-full px-3 text-[13px] font-medium outline-none focus-visible:ring-3 max-[1099px]:h-11"
          >
            {expanded ? "Show less" : `+${hidden}`}
          </button>
        </li>
      )}
    </ul>
  );
}
