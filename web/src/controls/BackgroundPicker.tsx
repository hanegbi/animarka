"use client";

import { BACKGROUNDS, type Background } from "@/catalog/backgrounds";
import { RadioGroup, type RadioItem } from "./RadioGroup";

/** B1. Round swatches. Adapted from Animated Color Selector by starc007. */

const ITEMS: RadioItem<string>[] = BACKGROUNDS.map((b) => ({
  value: b.id,
  label: b.name,
}));
const BY_ID = new Map(BACKGROUNDS.map((b) => [b.id, b]));

function swatchStyle(b: Background) {
  return b.kind === "image"
    ? { background: `url(${b.image}) center / cover, ${b.color}` }
    : { background: b.color };
}

/** R8: a swatch grid that fills its section, four across. The chosen name shows in the section title. */
export function BackgroundPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <RadioGroup
      label="Background"
      value={value}
      items={ITEMS}
      onChange={onChange}
      className="grid w-full grid-cols-4 gap-1 max-[1099px]:grid-cols-8"
      itemClassName="group/sw grid h-10 place-items-center rounded-[10px] max-[1099px]:h-11"
      renderItem={(item, checked) => (
        <span
          aria-hidden
          className={`block size-8 rounded-full border transition-shadow ${
            checked
              ? "ring-primary ring-offset-card ring-2 ring-offset-2"
              : "group-hover/sw:ring-border group-hover/sw:ring-2"
          }`}
          style={swatchStyle(BY_ID.get(item.value)!)}
          title={item.label}
        />
      )}
    />
  );
}

export function backgroundName(id: string): string {
  return BY_ID.get(id)?.name ?? "";
}
