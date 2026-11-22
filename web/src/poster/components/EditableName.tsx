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
import { Button } from "@/components/ui/button";
import { MAX_NAME } from "@/poster/state/types";

const CARD_W = 280;
const MARGIN = 8;

/**
 * A bird's name on the poster, or in the legend, that you can click to rename.
 * At rest: a dotted underline and a small pencil on hover say it is editable.
 * Click: a small rename card opens under the name, at normal UI size (the poster text can be tiny),
 * with Save, Cancel and, when renamed, "Use original name". Enter saves, Escape cancels.
 * Clicks and keys stay out of the bird, so it does not mirror, drag or move while you type.
 */
export function EditableName({
  name,
  original,
  onChange,
}: {
  name: string;
  /** The catalog name, offered back when the bird was renamed. */
  original?: string;
  onChange: (name: string) => void;
}) {
  const anchor = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(name);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const stop = (e: SyntheticEvent) => e.stopPropagation();

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const r = anchor.current?.getBoundingClientRect();
      if (!r) return;
      const left = Math.min(
        Math.max(MARGIN, r.left + r.width / 2 - CARD_W / 2),
        window.innerWidth - CARD_W - MARGIN,
      );
      const below = r.bottom + MARGIN;
      const top =
        below + 170 > window.innerHeight
          ? Math.max(MARGIN, r.top - 170 - MARGIN)
          : below;
      setPos({ left, top });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  const close = (save: boolean, value = draft) => {
    setOpen(false);
    if (save && value.trim() !== name) onChange(value);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter") close(true);
    else if (e.key === "Escape") close(false);
  };
  const renamed = original !== undefined && name !== original;

  return (
    <>
      {/* Not a separate control: it sits inside the bird's button. Keyboard users press F2 on the bird. */}
      <span
        ref={anchor}
        className={`group/name decoration-primary/60 cursor-text underline-offset-[0.25em] hover:underline hover:decoration-dotted ${
          open ? "underline decoration-solid" : ""
        }`}
        title="Click to rename"
        onPointerDown={stop}
        onClick={(e) => {
          e.stopPropagation();
          setDraft(name);
          setOpen(true);
        }}
        data-name-edit
      >
        <span className="poster-label-text">{name}</span>
        <PencilIcon
          aria-hidden
          className="text-primary ms-[0.3em] inline-block size-[0.9em] align-[-0.1em] opacity-0 transition-opacity group-hover/name:opacity-80"
        />
      </span>
      {open &&
        pos &&
        createPortal(
          <>
            {/* A click outside cancels. */}
            <div
              className="fixed inset-0 z-40"
              onPointerDown={() => close(false)}
              aria-hidden
            />
            <div
              role="dialog"
              aria-label="Rename this bird"
              className="bg-popover text-popover-foreground fixed z-50 flex flex-col gap-3 rounded-xl border p-3 font-sans shadow-xl"
              style={{ left: pos.left, top: pos.top, width: CARD_W }}
              onPointerDown={stop}
              onClick={stop}
            >
              <label className="flex flex-col gap-1.5">
                <span className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                  Name on the poster
                </span>
                <input
                  autoFocus
                  value={draft}
                  maxLength={MAX_NAME}
                  aria-label="Bird name on the poster"
                  aria-describedby="rename-hint"
                  onChange={(e) => setDraft(e.target.value)}
                  onFocus={(e) => e.currentTarget.select()}
                  onKeyDown={onKeyDown}
                  className="focus-visible:ring-ring/50 h-10 w-full rounded-[10px] border bg-transparent px-3 text-sm outline-none focus-visible:ring-3"
                />
              </label>
              <p id="rename-hint" className="text-muted-foreground text-[12px]">
                Enter to save, Esc to cancel
              </p>
              <div className="flex items-center justify-between gap-2">
                {renamed ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => close(true, original)}
                  >
                    Use original name
                  </Button>
                ) : (
                  <span />
                )}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => close(false)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={() => close(true)}>
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
