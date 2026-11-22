"use client";

import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { MAX_NAME } from "@/poster/state/types";

/**
 * A bird's name on the poster that turns into a text box when clicked. Enter or leaving the box saves,
 * Escape cancels, an empty name goes back to the catalog name. Clicks and keys stay inside, so the
 * bird does not mirror, drag or move while you type.
 */
export function EditableName({
  name,
  onChange,
}: {
  name: string;
  onChange: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const stop = (e: PointerEvent | React.MouseEvent) => e.stopPropagation();

  if (!editing)
    return (
      // Not a separate control: it sits inside the bird's button. Keyboard users press F2 on the bird.
      <span
        className="poster-label-text cursor-text rounded-[0.4cqw] hover:bg-black/5"
        title="Click to rename"
        onPointerDown={stop}
        onClick={(e) => {
          e.stopPropagation();
          setDraft(name);
          setEditing(true);
        }}
        data-name-edit
      >
        {name}
      </span>
    );

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
    <input
      autoFocus
      value={draft}
      maxLength={MAX_NAME}
      aria-label="Bird name on the poster"
      onChange={(e) => setDraft(e.target.value)}
      onFocus={(e) => e.currentTarget.select()}
      onBlur={() => done(true)}
      onKeyDown={onKeyDown}
      onPointerDown={stop}
      onClick={stop}
      className="w-full rounded-[0.4cqw] border-0 bg-white/80 p-0 text-center outline-1 outline-[var(--primary)]"
      style={{ font: "inherit", color: "inherit" }}
    />
  );
}
