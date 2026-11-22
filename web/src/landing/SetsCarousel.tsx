/* eslint-disable @next/next/no-img-element */
"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useRef } from "react";

export type LandingSet = { id: string; title: string; n: number; img: string };

/**
 * G2. Set cards in a row that scrolls sideways, snapping to each card, with Previous and Next
 * buttons for mouse users. Every card opens the builder with that set.
 */
export function SetsCarousel({ sets }: { sets: LandingSet[] }) {
  const row = useRef<HTMLUListElement>(null);
  const page = (dir: 1 | -1) => {
    const el = row.current;
    if (!el) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollBy({
      left: dir * el.clientWidth * 0.8,
      behavior: reduce ? "auto" : "smooth",
    });
  };
  const arrow =
    "bg-card hover:bg-muted grid size-10 place-items-center rounded-full border transition-colors";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end gap-2 max-sm:hidden">
        <button
          type="button"
          className={arrow}
          onClick={() => page(-1)}
          aria-label="Previous sets"
        >
          <ChevronLeftIcon aria-hidden className="size-5" />
        </button>
        <button
          type="button"
          className={arrow}
          onClick={() => page(1)}
          aria-label="Next sets"
        >
          <ChevronRightIcon aria-hidden className="size-5" />
        </button>
      </div>
      <ul
        ref={row}
        aria-label="Ready sets"
        className="-mx-4 flex snap-x snap-mandatory [scrollbar-width:thin] gap-5 overflow-x-auto px-4 pb-3 sm:-mx-0 sm:px-0"
      >
        {sets.map((s) => (
          <li key={s.id} className="w-[240px] shrink-0 snap-start sm:w-[260px]">
            <a
              href={`/make?set=${s.id}`}
              className="bg-card hover:border-primary focus-visible:ring-ring/50 flex h-full flex-col rounded-[14px] border p-4 transition-colors outline-none focus-visible:ring-3"
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={`/landing/${s.img}-sm.webp`}
                  alt={`${s.title} poster`}
                  width={600}
                  height={800}
                  loading="lazy"
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <span className="font-heading mt-3 text-lg font-semibold">
                {s.title}
              </span>
              <span className="text-muted-foreground text-sm">{s.n} birds</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
