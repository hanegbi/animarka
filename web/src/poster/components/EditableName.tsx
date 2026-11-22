"use client";

import { PencilIcon } from "lucide-react";
import {
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type SyntheticEvent,
} from "react";
import { createPortal } from "react-dom";
import { MAX_NAME } from "@/poster/state/types";

/**
 * A bird's name on the poster, or in the legend, that you edit in place.
 * At rest: a dotted underline and a small pencil on hover say it is editable.
 * Click: a text box opens right over the name, at least 14 px tall text so it is readable even on a
 * small poster, with a green outline. Enter or clicking away saves, Escape cancels, an empty name goes
 * back to the catalog name. No pop-up. Clicks and keys stay out of the bird, so it does not mirror,
 * drag or move while you type.
 */
export function EditableName({
  name,
  onChange,
}: {
  name: string;
  /** Kept for callers; an empty name already restores the catalog name. */
  original?: string;
  onChange: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const anchor = useRef<HTMLSpanElement>(null);
  const [rect, setRect] = useState<{
    x: number;
    y: number;
    w: number;
    font: number;
  } | null>(null);

  // The box is drawn above the page, exactly over the name, so the poster's own clipping never cuts it.
  useLayoutEffect(() => {
    if (!editing) return;
    const place = () => {
      const el = anchor.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
        w: r.width,
        font: parseFloat(getComputedStyle(el).fontSize) || 14,
      });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [editing]);
  const stop = (e: SyntheticEvent) => e.stopPropagation();

  const done = (save: boolean) => {
    setEditing(false);
    if (save && draft.trim() !== name) onChange(draft);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter") done(true);
    else if (e.key === "Escape") done(false);
  };

  return (
    // Not a separate control: it sits inside the bird's button. Keyboard users press F2 on the bird.
    <span
      ref={anchor}
      className="group/name decoration-primary/60 relative cursor-text underline-offset-[0.25em] hover:underline hover:decoration-dotted"
      title={editing ? undefined : "Click to rename"}
      onPointerDown={stop}
      onClick={(e) => {
        e.stopPropagation();
        if (editing) return;
        setDraft(name);
        setEditing(true);
      }}
      data-name-edit
    >
      {/* The name keeps its place while editing, so nothing on the poster moves. */}
      <span className={`poster-label-text ${editing ? "invisible" : ""}`}>
        {name}
      </span>
      {!editing && (
        <PencilIcon
          aria-hidden
          className="text-primary ms-[0.3em] inline-block size-[0.9em] align-[-0.1em] opacity-0 transition-opacity group-hover/name:opacity-80"
        />
      )}
      {editing &&
        rect &&
        createPortal(
          <input
            autoFocus
            value={draft}
            maxLength={MAX_NAME}
            aria-label="Bird name on the poster"
            onChange={(e) => setDraft(e.target.value)}
            onFocus={(e) => e.currentTarget.select()}
            onBlur={() => done(true)}
            onKeyDown={onKeyDown}
            className="bg-card text-card-foreground fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-md border-0 px-2 py-1 text-center font-sans leading-tight shadow-[0_0_0_2px_var(--primary),0_6px_16px_rgb(0_0_0/0.18)] outline-none"
            style={{
              left: Math.min(Math.max(rect.x, 96), window.innerWidth - 96),
              top: rect.y,
              fontSize: Math.max(rect.font, 14),
              width: Math.max(rect.w + 24, 176),
            }}
          />,
          document.body,
        )}
    </span>
  );
}
