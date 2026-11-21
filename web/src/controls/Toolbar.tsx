"use client";

import type { ReactNode } from "react";
import { usePosterActions, usePosterState } from "@/poster/state/provider";
import { BackgroundPicker } from "./BackgroundPicker";
import { LayoutPicker } from "./LayoutPicker";
import { SizePicker } from "./SizePicker";
import { LabelCards, StyleCards } from "./StyleCards";

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-muted-foreground font-sans text-[10px] font-semibold tracking-wide uppercase">
        {title}
      </h3>
      {children}
    </div>
  );
}

/**
 * R2 S2. Every style control in one toolbar above the poster. It wraps onto a second row when the window is
 * narrow, and below 1100 px the phone pattern takes over instead.
 */
export function Toolbar() {
  const state = usePosterState();
  const { dispatch } = usePosterActions();
  return (
    <div
      role="toolbar"
      aria-label="Poster style"
      className="bg-card flex flex-wrap items-start gap-x-6 gap-y-3 border-b px-4 py-3"
    >
      <Group title="Design">
        <StyleCards
          compact
          value={state.style}
          onChange={(style) => dispatch({ type: "setStyle", style })}
        />
      </Group>
      <Group title="Labels">
        <LabelCards
          compact
          value={state.labels}
          onChange={(labels) => dispatch({ type: "setLabels", labels })}
        />
      </Group>
      <Group title="Layout">
        <LayoutPicker
          compact
          value={state.layout}
          onChange={(layout) => dispatch({ type: "setLayout", layout })}
        />
      </Group>
      <Group title="Background">
        <BackgroundPicker
          value={state.bg}
          onChange={(bg) => dispatch({ type: "setBg", bg })}
        />
      </Group>
      <Group title="Size">
        <SizePicker
          value={state.size}
          onChange={(size) => dispatch({ type: "setSize", size })}
        />
      </Group>
    </div>
  );
}
