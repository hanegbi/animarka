"use client";

import type { ReactNode } from "react";
import { usePosterActions, usePosterState } from "@/poster/state/provider";
import { BackgroundPicker } from "./BackgroundPicker";
import { LayoutPicker } from "./LayoutPicker";
import { SizePicker } from "./SizePicker";
import { LabelCards, StyleCards } from "./StyleCards";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="text-muted-foreground font-sans text-[11px] font-semibold tracking-wide uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

/** Design, labels, layout, background and size. Every change is one undo step and shows on the poster at once. */
export function ControlsPanel() {
  const state = usePosterState();
  const { dispatch } = usePosterActions();
  return (
    <div className="flex flex-col gap-4">
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
      <Section title="Layout">
        <LayoutPicker
          value={state.layout}
          onChange={(layout) => dispatch({ type: "setLayout", layout })}
        />
      </Section>
      <Section title="Background">
        <BackgroundPicker
          value={state.bg}
          onChange={(bg) => dispatch({ type: "setBg", bg })}
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
