"use client";

import { Redo2Icon, ShuffleIcon, Undo2Icon } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  useHistoryFlags,
  usePosterActions,
  usePosterState,
} from "@/poster/state/provider";

/** Ctrl Z and Ctrl Shift Z work anywhere except while typing in a field. Mount this once. */
export function useUndoShortcuts() {
  const { undo, redo } = usePosterActions();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "z") return;
      const el = e.target as HTMLElement | null;
      if (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable)
      )
        return;
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [undo, redo]);
}

/** Undo and redo, with or without text. */
export function UndoRedo({ iconOnly }: { iconOnly?: boolean }) {
  const { undo, redo } = usePosterActions();
  const { canUndo, canRedo } = useHistoryFlags();
  const size = iconOnly ? "icon" : "lg";
  const cls = iconOnly ? "size-11" : "";
  return (
    <>
      <Button
        variant="outline"
        size={size}
        className={cls}
        disabled={!canUndo}
        onClick={undo}
        aria-label="Undo"
        aria-keyshortcuts="Control+Z"
      >
        <Undo2Icon aria-hidden />
        {!iconOnly && "Undo"}
      </Button>
      <Button
        variant="outline"
        size={size}
        className={cls}
        disabled={!canRedo}
        onClick={redo}
        aria-label="Redo"
        aria-keyshortcuts="Control+Shift+Z"
      >
        <Redo2Icon aria-hidden />
        {!iconOnly && "Redo"}
      </Button>
    </>
  );
}

export function ShuffleButton() {
  const state = usePosterState();
  const { dispatch } = usePosterActions();
  return (
    <Button
      variant="outline"
      className="w-full"
      disabled={state.order.length < 2}
      onClick={() =>
        dispatch({ type: "shuffle", seed: Math.floor(Math.random() * 1e6) })
      }
    >
      <ShuffleIcon aria-hidden /> Shuffle layout
    </Button>
  );
}

/** Undo, redo and shuffle in one toolbar. */
export function HistoryBar() {
  useUndoShortcuts();
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="toolbar"
      aria-label="Poster actions"
    >
      <UndoRedo />
      <ShuffleButton />
    </div>
  );
}
