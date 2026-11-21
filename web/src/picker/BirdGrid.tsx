/* eslint-disable @next/next/no-img-element */
"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { CheckIcon } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { artSrc, displayName, type SpeciesView } from "@/catalog/species-view";
import type { Lang } from "@/poster/state/types";

const MIN_CARD = 104;
const GAP = 8;
const ROW_HEIGHT = 132;

/** The nearest ancestor that scrolls vertically: the picker panel on desktop, the sheet on a phone. */
function scrollParent(el: HTMLElement): HTMLElement {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const { overflowY } = getComputedStyle(p);
    if (overflowY === "auto" || overflowY === "scroll") return p;
  }
  return document.scrollingElement as HTMLElement;
}

/**
 * C2. Picture cards in a virtualized multi select listbox. Only the visible rows are in the page, so
 * 1,161 birds stay fast. Arrow keys move, Space or Enter toggles, so a keyboard user does not tab through every card.
 *
 * The list does not scroll by itself. It is virtualized against the panel that already scrolls, with
 * the space above the list as the scroll margin, so the panel keeps one scroll bar.
 */
export function BirdGrid({
  items,
  selected,
  onToggle,
  style,
  lang,
  label = "Birds",
}: {
  items: SpeciesView[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  style: string;
  lang: Lang;
  label?: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [scroller, setScroller] = useState<HTMLElement | null>(null);
  const [margin, setMargin] = useState(0);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const sc = scrollParent(el);
    setScroller(sc);
    const measure = () => {
      setWidth(el.clientWidth);
      setMargin(
        Math.round(
          el.getBoundingClientRect().top -
            sc.getBoundingClientRect().top +
            sc.scrollTop,
        ),
      );
    };
    measure();
    // The space above the list changes with the chips, the status line and the buttons.
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(sc);
    if (el.parentElement) ro.observe(el.parentElement);
    return () => ro.disconnect();
  }, []);

  const cols = Math.max(2, Math.floor((width + GAP) / (MIN_CARD + GAP)));
  const rows = Math.ceil(items.length / cols);

  // TanStack Virtual returns functions the React Compiler cannot memoize. Nothing here depends on that.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtual = useVirtualizer({
    count: rows,
    getScrollElement: () => scroller,
    estimateSize: () => ROW_HEIGHT,
    overscan: 4,
    scrollMargin: margin,
  });

  // A new list starts at the top with the first card as the tab stop.
  const firstId = items[0]?.id;
  const lastCount = items.length;
  useEffect(() => {
    setActive(0);
    // Bring the top of the new list into view, only when it was scrolled past.
    if (scroller && scroller.scrollTop > margin)
      scroller.scrollTo({ top: margin });
    // Only a new list should scroll, not a change of margin.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstId, lastCount]);

  const focusIndex = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(items.length - 1, index));
      setActive(next);
      virtual.scrollToIndex(Math.floor(next / cols), { align: "auto" });
      requestAnimationFrame(() => {
        listRef.current
          ?.querySelector<HTMLElement>(`[data-index="${next}"]`)
          ?.focus();
      });
    },
    [cols, items.length, virtual],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>(
      "[data-index]",
    );
    if (!target) return;
    const i = Number(target.dataset.index);
    const page =
      Math.max(
        1,
        Math.floor((scroller?.clientHeight ?? ROW_HEIGHT) / ROW_HEIGHT),
      ) * cols;
    const moves: Record<string, number> = {
      ArrowRight: i + 1,
      ArrowLeft: i - 1,
      ArrowDown: i + cols,
      ArrowUp: i - cols,
      PageDown: i + page,
      PageUp: i - page,
      Home: 0,
      End: items.length - 1,
    };
    if (e.key in moves) {
      e.preventDefault();
      focusIndex(moves[e.key]);
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onToggle(items[i].id);
    }
  };

  return (
    <div
      ref={listRef}
      role="listbox"
      aria-multiselectable="true"
      aria-label={label}
      onKeyDown={onKeyDown}
      data-bird-grid
    >
      <div style={{ height: virtual.getTotalSize(), position: "relative" }}>
        {virtual.getVirtualItems().map((row) => (
          <div
            key={row.key}
            role="presentation"
            className="absolute start-0 grid w-full"
            style={{
              top: 0,
              transform: `translateY(${row.start - virtual.options.scrollMargin}px)`,
              height: ROW_HEIGHT - GAP,
              gap: GAP,
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: cols }, (_, c) => {
              const index = row.index * cols + c;
              const s = items[index];
              if (!s) return null;
              const on = selected.has(s.id);
              const name = displayName(s, lang);
              return (
                <div
                  key={s.id}
                  role="option"
                  aria-selected={on}
                  aria-label={name}
                  data-index={index}
                  data-id={s.id}
                  tabIndex={index === active ? 0 : -1}
                  title={`${on ? "Remove from poster" : "Add to poster"}: ${s.sci}, ${s.family}`}
                  onClick={() => {
                    setActive(index);
                    onToggle(s.id);
                  }}
                  onFocus={() => setActive(index)}
                  className={`bg-card focus-visible:ring-ring/50 relative flex cursor-pointer flex-col items-center gap-1 rounded-lg border p-1.5 text-center outline-none select-none focus-visible:ring-3 ${
                    on ? "border-primary ring-primary ring-1" : "hover:bg-muted"
                  }`}
                >
                  <img
                    src={artSrc(s, style, "thumb")}
                    alt=""
                    width={96}
                    height={72}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="h-[72px] w-full object-contain"
                  />
                  <span
                    className="line-clamp-2 text-[11px] leading-tight"
                    aria-hidden
                  >
                    {name}
                  </span>
                  {on && (
                    <span
                      aria-hidden
                      className="bg-primary text-primary-foreground absolute end-1 top-1 grid size-5 place-items-center rounded-full"
                    >
                      <CheckIcon className="size-3.5" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
