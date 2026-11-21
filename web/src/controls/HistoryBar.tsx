"use client";

import { Redo2Icon, ShuffleIcon, Undo2Icon } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  useHistoryFlags,
  usePosterActions,
  usePosterState,
} from "@/poster/state/provider";

/** Undo, redo and shuffle. Ctrl Z and Ctrl Shift Z work anywhere except while typing in a field. */
export function HistoryBar() {
  const state = usePosterState();
  const { dispatch, undo, redo } = usePosterActions();
  const { canUndo, canRedo } = useHistoryFlags();

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

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="toolbar"
      aria-label="Poster actions"
    >
      <Button
        variant="outline"
        size="lg"
        disabled={!canUndo}
        onClick={undo}
        aria-keyshortcuts="Control+Z"
      >
        <Undo2Icon aria-hidden /> Undo
      </Button>
      <Button
        variant="outline"
        size="lg"
        disabled={!canRedo}
        onClick={redo}
        aria-keyshortcuts="Control+Shift+Z"
      >
        <Redo2Icon aria-hidden /> Redo
      </Button>
      <Button
        variant="outline"
        size="lg"
        disabled={state.order.length < 2}
        onClick={() =>
          dispatch({ type: "shuffle", seed: Math.floor(Math.random() * 1e6) })
        }
      >
        <ShuffleIcon aria-hidden /> Shuffle layout
      </Button>
    </div>
  );
}
