/* eslint-disable @next/next/no-img-element */
"use client";

import { XIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { artSrc, displayName, type SpeciesView } from "@/catalog/species-view";
import type { Lang } from "@/poster/state/types";

/**
 * T2. Thumbnail strip. Round pictures with a remove cross. P1: a plain tooltip shows the name on hover and focus,
 * and the name is also in the accessible name. Adapted from Removable Badges by bundui.
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
    <ul
      aria-label="Birds on your poster"
      className="flex max-h-40 flex-wrap gap-2 overflow-y-auto p-1"
    >
      {order.map((id) => {
        const s = species.get(id);
        if (!s) return null;
        const name = displayName(s, lang);
        return (
          <li key={id}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={() => onRemove(id, name)}
                    aria-label={`Remove ${name} from poster`}
                    className="group/thumb focus-visible:ring-ring/50 relative block size-11 rounded-full outline-none focus-visible:ring-3"
                  />
                }
              >
                <img
                  src={artSrc(style, id)}
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
              </TooltipTrigger>
              <TooltipContent>{name}</TooltipContent>
            </Tooltip>
          </li>
        );
      })}
    </ul>
  );
}
