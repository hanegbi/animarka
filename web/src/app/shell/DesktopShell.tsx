"use client";

import { UndoRedo, useUndoShortcuts } from "@/controls/HistoryBar";
import { Inspector } from "@/controls/Inspector";
import { Picker } from "@/picker/Picker";
import { Credits } from "./Credits";
import { PosterStage } from "./PosterStage";

/** Desktop shell, R8 A2: birds on the left, the poster in the middle, style on the right. */
export function DesktopShell() {
  useUndoShortcuts();
  return (
    <div className="grid h-dvh grid-cols-[360px_minmax(0,1fr)_280px] grid-rows-[auto_minmax(0,1fr)]">
      <header className="bg-card col-span-3 flex h-14 items-center justify-between border-b px-4">
        <span className="font-heading text-2xl font-bold">animarka</span>
        <div
          className="flex items-center gap-2"
          role="toolbar"
          aria-label="Poster actions"
        >
          <Credits />
          <UndoRedo />
        </div>
      </header>
      <aside
        className="bg-card flex min-h-0 flex-col border-e"
        aria-label="Pick birds"
      >
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-3">
          <Picker />
        </div>
      </aside>
      <main className="min-h-0 p-6">
        <PosterStage />
      </main>
      <Inspector />
    </div>
  );
}
