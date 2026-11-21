/* eslint-disable @next/next/no-img-element */
"use client";

import { artSrc } from "@/catalog/species-view";
import { useCatalog } from "@/poster/state/provider";
import type { LabelMode } from "@/poster/state/types";
import { RadioGroup, type RadioItem } from "./RadioGroup";

/** G5. Cards with a preview. Adapted from Radio Card by mahmoudilyan. */

const SAMPLE = "falco-peregrinus";

/** The sample bird's art in a style, or the first bird's when the sample is not in the catalog. */
function useSample(): (style: string) => string {
  const { species, list } = useCatalog();
  const bird = species.get(SAMPLE) ?? list[0];
  return (style) => (bird ? artSrc(bird, style, "thumb") : "");
}

const card = (checked: boolean, compact?: boolean) =>
  `flex min-h-[44px] flex-1 flex-col items-center gap-1 rounded-lg border ${compact ? "min-w-[84px] px-2 py-1.5" : "p-2"} text-xs transition-colors ${
    checked
      ? "border-primary bg-accent ring-primary ring-1"
      : "bg-card hover:bg-muted"
  }`;

const STYLES: RadioItem<string>[] = [
  { value: "fg", label: "Field guide" },
  { value: "wb", label: "Woodblock" },
];

export function StyleCards({
  value,
  onChange,
  compact,
}: {
  value: string;
  onChange: (v: string) => void;
  compact?: boolean;
}) {
  const sample = useSample();
  return (
    <RadioGroup
      label="Design"
      value={value}
      items={STYLES}
      onChange={onChange}
      className="flex gap-2"
      itemClassName={(checked) => card(checked, compact)}
      renderItem={(item) => (
        <>
          <img
            src={sample(item.value)}
            alt=""
            width={64}
            height={56}
            className={
              compact
                ? "h-9 w-full object-contain"
                : "h-14 w-full object-contain"
            }
          />
          <span className="font-medium">{item.label}</span>
        </>
      )}
    />
  );
}

const LABELS: RadioItem<LabelMode>[] = [
  { value: "names", label: "Names" },
  { value: "legend", label: "Numbers and legend" },
  { value: "none", label: "No text" },
];

const SAMPLE_TEXT: Record<LabelMode, string> = {
  names: "Peregrine",
  legend: "1",
  none: "",
};

export function LabelCards({
  value,
  onChange,
  compact,
}: {
  value: LabelMode;
  onChange: (v: LabelMode) => void;
  compact?: boolean;
}) {
  const sample = useSample();
  return (
    <RadioGroup
      label="Labels"
      value={value}
      items={LABELS}
      onChange={onChange}
      className="flex gap-2"
      itemClassName={(checked) => card(checked, compact)}
      renderItem={(item) => (
        <>
          <img
            src={sample("fg")}
            alt=""
            width={40}
            height={36}
            className="h-9 object-contain"
          />
          <span
            className="text-muted-foreground h-3 text-[9px] leading-3"
            aria-hidden
          >
            {SAMPLE_TEXT[item.value]}
          </span>
          <span className="text-center leading-tight font-medium">
            {item.label}
          </span>
        </>
      )}
    />
  );
}
