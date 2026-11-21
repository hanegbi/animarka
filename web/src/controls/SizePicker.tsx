"use client";

import { SIZES, type SizeId } from "@/poster/state/types";
import type { RadioItem } from "./RadioGroup";
import { Segmented } from "./Segmented";

/** The poster shape. R8 removed the A series. */
const ITEMS: RadioItem<SizeId>[] = SIZES.map((s) => ({ value: s, label: s }));

export function SizePicker({
  value,
  onChange,
}: {
  value: SizeId;
  onChange: (v: SizeId) => void;
}) {
  return (
    <Segmented
      label="Poster size"
      value={value}
      items={ITEMS}
      onChange={onChange}
    />
  );
}
