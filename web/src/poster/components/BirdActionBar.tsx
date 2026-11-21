"use client";

import { FlipHorizontal2Icon, Trash2Icon } from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

type Pos = { left: number; top: number };

const GAP = 8;
const MARGIN = 8;

/**
 * The two buttons that appear when you tap a bird: Mirror and Remove. The bar floats just above the bird, or just
 * below it when there is no room, and stays inside the window. It sits outside the poster so the poster's edge
 * never clips it, and it follows the bird if the poster moves or resizes.
 */
export function BirdActionBar({
  id,
  name,
  focusFirst,
  onMirror,
  onRemove,
  onClose,
}: {
  id: string;
  name: string;
  /** Move keyboard focus to the first button, when the bird was selected with the keyboard. */
  focusFirst: boolean;
  onMirror: () => void;
  onRemove: () => void;
  onClose: (refocusBird: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Pos | null>(null);

  // Follow the bird. A frame loop is cheap here, since one small bar is on screen and it only sets state on change.
  useLayoutEffect(() => {
    let frame = 0;
    let last = "";
    const tick = () => {
      const art = document.querySelector<HTMLElement>(
        `[data-animal="${CSS.escape(id)}"] [data-art]`,
      );
      const bar = ref.current;
      if (art && bar) {
        const r = art.getBoundingClientRect();
        const bw = bar.offsetWidth;
        const bh = bar.offsetHeight;
        const left = Math.min(
          Math.max(r.left + r.width / 2 - bw / 2, MARGIN),
          window.innerWidth - bw - MARGIN,
        );
        let top = r.top - bh - GAP;
        // Not above the bird when that would cover the poster title or leave the window.
        const title = document
          .querySelector<HTMLElement>("[data-poster-title]")
          ?.getBoundingClientRect();
        const coversTitle =
          !!title && top < title.bottom && top + bh > title.top;
        if (top < MARGIN || coversTitle) top = r.bottom + GAP;
        top = Math.max(MARGIN, Math.min(top, window.innerHeight - bh - MARGIN));
        const key = `${Math.round(left)}:${Math.round(top)}`;
        if (key !== last) {
          last = key;
          setPos({ left, top });
        }
      }
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [id]);

  // Focus goes to the first button once, as soon as the bar is visible. A hidden element cannot take focus.
  const focused = useRef(false);
  const placed = pos !== null;
  useEffect(() => {
    if (!focusFirst || !placed || focused.current) return;
    focused.current = true;
    // The browser sometimes refuses focus for the first frame or two after an element appears, so try until it takes.
    let frame = 0;
    let tries = 0;
    const attempt = () => {
      const button = ref.current?.querySelector<HTMLElement>("button");
      button?.focus();
      if (button && document.activeElement !== button && tries++ < 30)
        frame = requestAnimationFrame(attempt);
    };
    frame = requestAnimationFrame(attempt);
    return () => cancelAnimationFrame(frame);
  }, [focusFirst, placed]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose(true);
    }
  };

  return createPortal(
    <div
      ref={ref}
      role="toolbar"
      aria-label={`Actions for ${name}`}
      data-bird-bar
      onKeyDown={onKeyDown}
      className="bg-card text-card-foreground fixed z-50 flex gap-1 rounded-xl border p-1 shadow-md"
      style={{
        left: pos?.left ?? 0,
        top: pos?.top ?? 0,
        visibility: pos ? "visible" : "hidden",
      }}
    >
      <Button variant="ghost" onClick={onMirror}>
        <FlipHorizontal2Icon aria-hidden /> Mirror
      </Button>
      <Button variant="ghost" onClick={onRemove}>
        <Trash2Icon aria-hidden /> Remove
      </Button>
    </div>,
    document.body,
  );
}
