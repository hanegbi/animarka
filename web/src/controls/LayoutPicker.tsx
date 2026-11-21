"use client";

import type { LayoutId } from "@/poster/state/types";
import { RadioGroup, type RadioItem } from "./RadioGroup";

/**
 * L5. Three circle icons, each with its name under it, and a raised highlight that slides to the choice.
 * Each icon is drawn with small circles placed the way that layout places the animals.
 * Adapted from Radio Group by pmalay694.
 */

const DOTS: Record<LayoutId, [number, number, number][]> = {
  scatter: [
    [9, 9, 4],
    [24, 6, 3],
    [37, 12, 4.6],
    [6, 24, 3.4],
    [20, 21, 5],
    [35, 27, 3.4],
    [11, 37, 4.6],
    [25, 36, 3],
    [38, 39, 3.8],
  ],
  grid: [
    [8, 8, 3.6],
    [22, 8, 3.6],
    [36, 8, 3.6],
    [8, 22, 3.6],
    [22, 22, 3.6],
    [36, 22, 3.6],
    [8, 36, 3.6],
    [22, 36, 3.6],
    [36, 36, 3.6],
  ],
  centerpiece: [
    [22, 22, 9],
    [22, 6, 3],
    [38, 22, 3],
    [22, 38, 3],
    [6, 22, 3],
    [34, 10, 2.6],
    [34, 34, 2.6],
    [10, 34, 2.6],
    [10, 10, 2.6],
  ],
};

const ITEMS: RadioItem<LayoutId>[] = [
  { value: "scatter", label: "Scattered" },
  { value: "grid", label: "Grid" },
  { value: "centerpiece", label: "Centerpiece" },
];

export function LayoutIcon({
  layout,
  size = 32,
}: {
  layout: LayoutId;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 44 44"
      width={size}
      height={size}
      aria-hidden
      fill="currentColor"
    >
      {DOTS[layout].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} />
      ))}
    </svg>
  );
}

export function LayoutPicker({
  value,
  onChange,
  compact,
}: {
  value: LayoutId;
  onChange: (v: LayoutId) => void;
  compact?: boolean;
}) {
  const index = Math.max(
    0,
    ITEMS.findIndex((i) => i.value === value),
  );
  return (
    <RadioGroup
      label="Layout"
      value={value}
      items={ITEMS}
      onChange={onChange}
      className={`bg-muted relative grid grid-cols-3 rounded-xl p-1 ${compact ? "min-w-[216px]" : ""}`}
      itemClassName={(checked) =>
        `relative z-10 flex ${compact ? "min-h-[52px] py-1" : "min-h-[64px] py-2"} flex-col items-center justify-center gap-1 rounded-lg text-xs transition-colors ${
          checked
            ? "text-primary font-semibold"
            : "text-muted-foreground hover:text-foreground"
        }`
      }
      renderItem={(item) => (
        <>
          <LayoutIcon layout={item.value} size={compact ? 24 : 32} />
          {item.label}
        </>
      )}
    >
      <span
        aria-hidden
        data-layout-highlight
        className="border-primary bg-card absolute inset-y-1 start-1 rounded-lg border shadow-sm transition-transform duration-200 ease-out motion-reduce:transition-none"
        style={{
          width: "calc((100% - 0.5rem) / 3)",
          transform: `translateX(${index * 100}%)`,
        }}
      />
    </RadioGroup>
  );
}
