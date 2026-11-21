"use client";

import type { LabelMode } from "@/poster/state/types";
import type { RadioItem } from "./RadioGroup";
import { Segmented } from "./Segmented";

/** R8: plain text choices, the same 40 px as every other control. No sample pictures. */

const STYLES: RadioItem<string>[] = [
  { value: "fg", label: "Field guide" },
  { value: "wb", label: "Woodblock" },
];

export function StyleCards({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Segmented
      label="Design"
      value={value}
      items={STYLES}
      onChange={onChange}
    />
  );
}

const LABELS: RadioItem<LabelMode>[] = [
  { value: "names", label: "Names" },
  { value: "legend", label: "Numbers" },
  { value: "none", label: "No text" },
];

export function LabelCards({
  value,
  onChange,
}: {
  value: LabelMode;
  onChange: (v: LabelMode) => void;
}) {
  return (
    <Segmented
      label="Labels"
      value={value}
      items={LABELS}
      onChange={onChange}
    />
  );
}
