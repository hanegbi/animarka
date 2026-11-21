"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import type { RadioItem } from "./RadioGroup";
import { Segmented } from "./Segmented";

export type Facing = "left" | "right" | "mixed";

const ITEMS: RadioItem<"left" | "right">[] = [
  { value: "left", label: "Face left" },
  { value: "right", label: "Face right" },
];

/**
 * Turn every bird to look the same way in one step. When birds look different ways (after single
 * taps), neither option is checked and the section shows "Mixed".
 */
export function DirectionPicker({
  value,
  onChange,
}: {
  value: Facing;
  onChange: (dir: "left" | "right") => void;
}) {
  return (
    <Segmented
      label="Direction"
      value={value as "left" | "right"}
      items={ITEMS}
      onChange={onChange}
      render={(item) => (
        <span className="inline-flex items-center justify-center gap-1.5">
          {item.value === "left" && (
            <ArrowLeftIcon aria-hidden className="size-4" />
          )}
          {item.label}
          {item.value === "right" && (
            <ArrowRightIcon aria-hidden className="size-4" />
          )}
        </span>
      )}
    />
  );
}
