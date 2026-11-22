/* eslint-disable @next/next/no-img-element */
"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

export type LandingSet = { id: string; title: string; n: number; img: string };

/**
 * Set cards in a row that runs to the edge of the page and snaps to each card. Swipe on touch,
 * Previous and Next buttons with the mouse, and the arrow keys move from card to card. No visible
 * scrollbar; every card is the same height, titles clamp to two lines. Each card opens the
 * builder with that set.
 */
export function SetsCarousel({ sets }: { sets: LandingSet[] }) {
  const row = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const read = () =>
      setEdge({
        start: el.scrollLeft < 8,
        end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8,
      });
    read();
    el.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      el.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, []);

  const smooth = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
  const page = (dir: 1 | -1) => {
    const el = row.current;
    if (el)
      el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: smooth() });
  };
  const onKey = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const links = [...(row.current?.querySelectorAll("a") ?? [])];
    const i = links.indexOf(document.activeElement as HTMLAnchorElement);
    const next = links[i + (e.key === "ArrowRight" ? 1 : -1)];
    if (next) {
      e.preventDefault();
      next.focus({ preventScroll: true });
      next.scrollIntoView({
        behavior: smooth(),
        inline: "nearest",
        block: "nearest",
      });
    }
  };
  const arrow =
    "grid size-11 place-items-center rounded-full border border-[rgb(var(--lp-shadow)/0.2)] bg-[var(--lp-paper)] text-[var(--lp-forest)] transition-[background-color,opacity] duration-200 hover:bg-[var(--lp-paper-2)] disabled:opacity-35";

  return (
    <div className="flex flex-col gap-6">
      <ul
        ref={row}
        aria-label="Ready sets"
        onKeyDown={onKey}
        className="lp-gutter flex snap-x snap-mandatory [scrollbar-width:none] gap-5 overflow-x-auto pt-2 pb-6 [&::-webkit-scrollbar]:hidden"
      >
        {sets.map((s) => (
          <li
            key={s.id}
            className="flex w-[232px] shrink-0 snap-start sm:w-[264px]"
          >
            <a
              href={`/make?set=${s.id}`}
              className="lp-card group flex w-full flex-col gap-4 rounded-[6px] bg-[var(--lp-paper)] p-3 pb-4"
            >
              <div className="aspect-[3/4] overflow-hidden rounded-[3px] bg-[var(--lp-paper-2)]">
                <img
                  src={`/landing/${s.img}-sm.webp`}
                  alt={`${s.title} poster`}
                  width={600}
                  height={800}
                  loading="lazy"
                  className="h-full w-full object-cover object-top transition-transform duration-[260ms] ease-out group-hover:scale-[1.02]"
                />
              </div>
              <div className="flex flex-col gap-1 px-1">
                <span className="line-clamp-2 min-h-[2lh] font-[family-name:var(--font-display)] text-xl leading-tight font-medium">
                  {s.title}
                </span>
                <span className="text-sm text-[var(--lp-forest-muted)]">
                  {s.n} birds
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>
      <div className="lp-wrap flex justify-center gap-3">
        <button
          type="button"
          className={arrow}
          onClick={() => page(-1)}
          disabled={edge.start}
          aria-label="Previous sets"
        >
          <ChevronLeftIcon aria-hidden className="size-5" />
        </button>
        <button
          type="button"
          className={arrow}
          onClick={() => page(1)}
          disabled={edge.end}
          aria-label="Next sets"
        >
          <ChevronRightIcon aria-hidden className="size-5" />
        </button>
      </div>
    </div>
  );
}
