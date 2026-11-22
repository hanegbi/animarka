"use client";

import { useCatalog, usePosterState } from "@/poster/state/provider";
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
  const { species } = useCatalog();
  const { order } = usePosterState();
  // Most birds have field guide art only; they keep it on a woodblock poster.
  const noWb = order.filter(
    (id) => species.get(id) && !species.get(id)!.art.wb,
  ).length;
  return (
    <div className="flex flex-col gap-2">
      <Segmented
        label="Design"
        value={value}
        items={STYLES}
        onChange={onChange}
      />
      {noWb > 0 && (
        <p
          className="text-muted-foreground text-[13px] leading-snug"
          data-style-note
        >
          {noWb === 1
            ? "1 bird has field guide art only and stays that way in woodblock."
            : `${noWb} birds have field guide art only and stay that way in woodblock.`}
        </p>
      )}
    </div>
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
