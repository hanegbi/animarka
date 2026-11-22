"use client";

import {
  LayersIcon,
  PaletteIcon,
  SearchIcon,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BackgroundPicker, backgroundName } from "@/controls/BackgroundPicker";
import { ControlSection } from "@/controls/Inspector";
import {
  ShuffleButton,
  UndoRedo,
  useUndoShortcuts,
} from "@/controls/HistoryBar";
import { DirectionPicker } from "@/controls/DirectionPicker";
import { ExportButton } from "@/export/ExportButton";
import { LayoutPicker } from "@/controls/LayoutPicker";
import { facing } from "@/poster/state/mirror";
import { SizePicker } from "@/controls/SizePicker";
import { LanguagePicker } from "@/controls/LanguagePicker";
import { LabelCards, StyleCards } from "@/controls/StyleCards";
import { Picker } from "@/picker/Picker";
import { usePosterActions, usePosterState } from "@/poster/state/provider";
import { PosterStage } from "./PosterStage";

type TabId = "birds" | "layout" | "style";

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "birds", label: "Birds", icon: SearchIcon },
  { id: "layout", label: "Layout", icon: LayersIcon },
  { id: "style", label: "Style", icon: PaletteIcon },
];

const Section = ControlSection;

function LayoutPanel() {
  const state = usePosterState();
  const { dispatch } = usePosterActions();
  const dir = facing(state);
  return (
    <div className="flex flex-col gap-5">
      <Section title="Layout">
        <LayoutPicker
          value={state.layout}
          onChange={(layout) => dispatch({ type: "setLayout", layout })}
        />
        <ShuffleButton />
      </Section>
      <Section title="Direction" value={dir === "mixed" ? "Mixed" : undefined}>
        <DirectionPicker
          value={dir}
          onChange={(d) => dispatch({ type: "faceAll", dir: d })}
        />
      </Section>
      <Section title="Size">
        <SizePicker
          value={state.size}
          onChange={(size) => dispatch({ type: "setSize", size })}
        />
      </Section>
    </div>
  );
}

function StylePanel() {
  const state = usePosterState();
  const { dispatch } = usePosterActions();
  return (
    <div className="flex flex-col gap-5">
      <Section title="Names">
        <LanguagePicker
          value={state.lang}
          onChange={(lang) => dispatch({ type: "setLang", lang })}
        />
      </Section>
      <Section title="Design">
        <StyleCards
          value={state.style}
          onChange={(style) => dispatch({ type: "setStyle", style })}
        />
      </Section>
      <Section title="Labels">
        <LabelCards
          value={state.labels}
          onChange={(labels) => dispatch({ type: "setLabels", labels })}
        />
      </Section>
      <Section title="Background" value={backgroundName(state.bg)}>
        <BackgroundPicker
          value={state.bg}
          onChange={(bg) => dispatch({ type: "setBg", bg })}
        />
      </Section>
    </div>
  );
}

/**
 * Phone shell, R2 P3. The poster fills the top and is always in view. Three tabs at the thumb open a short sheet
 * that sits below the poster, so the poster shrinks a little and is never covered. Tap the open tab, or press
 * Escape, to close the sheet. The sheet starts on Birds, because picking birds is the first thing to do.
 * The fourth tab, Export, is added in M4 with the export dialog.
 */
export function PhoneShell() {
  useUndoShortcuts();
  const [open, setOpen] = useState<TabId | null>("birds");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-dvh flex-col">
      <header className="bg-card flex h-14 shrink-0 items-center justify-between border-b ps-4 pe-1">
        <span className="font-heading text-xl font-bold">animarka</span>
        <div
          className="flex items-center"
          role="toolbar"
          aria-label="Poster actions"
        >
          <UndoRedo iconOnly />
          <ExportButton iconOnly />
        </div>
      </header>

      <main className="min-h-0 flex-1 p-2">
        <PosterStage phone />
      </main>

      <section
        id="sheet"
        aria-label={open ? TABS.find((t) => t.id === open)!.label : "Tools"}
        hidden={!open}
        className="bg-card shrink-0 overflow-x-hidden overflow-y-auto overscroll-contain border-t p-3"
        style={{ height: open === "birds" ? "48dvh" : open ? "40dvh" : 0 }}
        data-sheet={open ?? "closed"}
      >
        {open === "birds" && (
          <>
            <Picker />
          </>
        )}
        {open === "layout" && <LayoutPanel />}
        {open === "style" && <StylePanel />}
      </section>

      <nav
        aria-label="Poster tools"
        className="bg-card grid h-14 shrink-0 grid-cols-3 border-t"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const on = open === id;
          return (
            <button
              key={id}
              type="button"
              aria-expanded={on}
              aria-controls="sheet"
              onClick={() => setOpen(on ? null : id)}
              className={`focus-visible:ring-ring/50 flex min-h-11 flex-col items-center justify-center gap-0.5 text-xs outline-none focus-visible:ring-3 ${
                on ? "text-primary font-semibold" : "text-muted-foreground"
              }`}
            >
              <Icon aria-hidden className="size-5" />
              {label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
