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

/**
 * R8: three equal tiles that fill their section, each with the layout's dot picture and its name.
 * The chosen tile is raised and outlined.
 */
export function LayoutPicker({
  value,
  onChange,
}: {
  value: LayoutId;
  onChange: (v: LayoutId) => void;
}) {
  return (
    <RadioGroup
      label="Layout"
      value={value}
      items={ITEMS}
      onChange={onChange}
      className="bg-muted grid w-full grid-cols-3 gap-0.5 rounded-[10px] border p-[3px]"
      itemClassName={(checked) =>
        `flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-[7px] py-2.5 text-[12px] font-medium transition-colors ${
          checked
            ? "bg-card text-primary shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`
      }
      renderItem={(item) => (
        <>
          <LayoutIcon layout={item.value} size={30} />
          <span className="max-w-full truncate">{item.label}</span>
        </>
      )}
    />
  );
}
