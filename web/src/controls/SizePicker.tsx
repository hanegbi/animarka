"use client";

import { SIZES, type SizeId } from "@/poster/state/types";
import { RadioGroup, type RadioItem } from "./RadioGroup";

/** Z3. Text buttons for the poster shape. No landscape. Adapted from Aspect Ratio Switcher by shadcnspace. */

const LABEL: Record<SizeId, string> = {
  "3:4": "3:4",
  "2:3": "2:3",
  "4:5": "4:5",
  a: "A series",
};
const ITEMS: RadioItem<SizeId>[] = SIZES.map((s) => ({
  value: s,
  label: LABEL[s],
}));

export function SizePicker({
  value,
  onChange,
}: {
  value: SizeId;
  onChange: (v: SizeId) => void;
}) {
  return (
    <RadioGroup
      label="Poster size"
      value={value}
      items={ITEMS}
      onChange={onChange}
      className="inline-flex overflow-hidden rounded-lg border"
      itemClassName={(checked) =>
        `min-h-11 min-w-12 px-3 text-sm not-first:border-s ${
          checked
            ? "bg-primary text-primary-foreground font-medium"
            : "bg-card hover:bg-muted"
        }`
      }
      renderItem={(item) => item.label}
    />
  );
}
