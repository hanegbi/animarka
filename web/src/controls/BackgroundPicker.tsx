"use client";

import { BACKGROUNDS, type Background } from "@/catalog/backgrounds";
import { RadioGroup, type RadioItem } from "./RadioGroup";

/** B1. Round swatches in one row. The name of the chosen one shows below. Adapted from Animated Color Selector by starc007. */

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

export function BackgroundPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <RadioGroup
        label="Background"
        value={value}
        items={ITEMS}
        onChange={onChange}
        className="flex flex-wrap gap-1"
        // The button is 44 px for touch. The visible swatch is 32 px inside it.
        itemClassName="group/sw grid size-11 place-items-center rounded-full"
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
      <p className="mt-1 text-sm font-medium" data-background-name>
        {BY_ID.get(value)?.name ?? ""}
      </p>
    </div>
  );
}
