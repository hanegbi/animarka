"use client";

import {
  ShuffleButton,
  UndoRedo,
  useUndoShortcuts,
} from "@/controls/HistoryBar";
import { Toolbar } from "@/controls/Toolbar";
import { Picker } from "@/picker/Picker";
import { Credits } from "./Credits";
import { PosterStage } from "./PosterStage";

/** Desktop shell, R2 S2: picker on the left, every style control in a toolbar above the poster. */
export function DesktopShell() {
  useUndoShortcuts();
  return (
    <div className="grid h-dvh grid-cols-[380px_1fr] grid-rows-[auto_1fr]">
      <header className="bg-card col-span-2 flex items-center justify-between border-b px-4 py-2">
        <span className="font-heading text-2xl font-bold">animarka</span>
        <div
          className="flex items-center gap-2"
          role="toolbar"
          aria-label="Poster actions"
        >
          <UndoRedo />
          <ShuffleButton />
        </div>
      </header>
      <aside
        className="bg-card flex min-h-0 flex-col border-e"
        aria-label="Pick birds"
      >
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <Picker />
        </div>
        <Credits className="border-t p-3" />
      </aside>
      <div className="flex min-h-0 flex-col">
        <Toolbar />
        <main className="min-h-0 flex-1 p-4">
          <PosterStage />
        </main>
      </div>
    </div>
  );
}
