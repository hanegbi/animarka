"use client";

import type { ReactNode } from "react";
import { usePosterActions, usePosterState } from "@/poster/state/provider";
import { facing } from "@/poster/state/mirror";
import { BackgroundPicker, backgroundName } from "./BackgroundPicker";
import { DirectionPicker } from "./DirectionPicker";
import { ShuffleButton } from "./HistoryBar";
import { LanguagePicker } from "./LanguagePicker";
import { LayoutPicker } from "./LayoutPicker";
import { SizePicker } from "./SizePicker";
import { LabelCards, StyleCards } from "./StyleCards";

/** A titled group of one control. The phone tabs use it too, so both shells look the same. */
export function ControlSection({
  title,
  value,
  children,
}: {
  title: string;
  /** The current choice, shown after the title when the control itself does not name it. */
  value?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-2">
      <h3 className="text-muted-foreground flex justify-between font-sans text-[12px] font-semibold tracking-wide uppercase">
        <span>{title}</span>
        {value && (
          <span
            className="text-foreground tracking-normal normal-case"
            data-section-value
          >
            {value}
          </span>
        )}
      </h3>
      {children}
    </section>
  );
}

/**
 * R8 A2. Every style control in one column on the right of the poster, names first. The poster is
 * limited by height, so this column costs it nothing.
 */
export function Inspector() {
  const state = usePosterState();
  const { dispatch } = usePosterActions();
  const dir = facing(state);
  return (
    <aside
      aria-label="Poster style"
      className="bg-card flex min-h-0 flex-col gap-5 overflow-y-auto border-s p-4"
    >
      <ControlSection title="Names">
        <LanguagePicker
          value={state.lang}
          onChange={(lang) => dispatch({ type: "setLang", lang })}
        />
      </ControlSection>
      <ControlSection title="Design">
        <StyleCards
          value={state.style}
          onChange={(style) => dispatch({ type: "setStyle", style })}
        />
      </ControlSection>
      <ControlSection title="Labels">
        <LabelCards
          value={state.labels}
          onChange={(labels) => dispatch({ type: "setLabels", labels })}
        />
      </ControlSection>
      <ControlSection title="Layout">
        <LayoutPicker
          value={state.layout}
          onChange={(layout) => dispatch({ type: "setLayout", layout })}
        />
        <ShuffleButton />
      </ControlSection>
      <ControlSection
        title="Direction"
        value={dir === "mixed" ? "Mixed" : undefined}
      >
        <DirectionPicker
          value={dir}
          onChange={(d) => dispatch({ type: "faceAll", dir: d })}
        />
      </ControlSection>
      <ControlSection title="Background" value={backgroundName(state.bg)}>
        <BackgroundPicker
          value={state.bg}
          onChange={(bg) => dispatch({ type: "setBg", bg })}
        />
      </ControlSection>
      <ControlSection title="Size">
        <SizePicker
          value={state.size}
          onChange={(size) => dispatch({ type: "setSize", size })}
        />
      </ControlSection>
    </aside>
  );
}
