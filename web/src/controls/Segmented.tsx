"use client";

import type { ReactNode } from "react";
import { RadioGroup, type RadioItem } from "./RadioGroup";

/**
 * R8 B1. The one choice control: equal columns that always fill the width they are given, 40 px tall
 * (44 px on a phone), 10 px corners, 13 px medium text. The chosen option is a raised white segment.
 */
export function Segmented<T extends string>({
  label,
  value,
  items,
  onChange,
  render,
}: {
  label: string;
  value: T;
  items: RadioItem<T>[];
  onChange: (value: T) => void;
  /** Custom content for an option. The label is the accessible name either way. */
  render?: (item: RadioItem<T>, checked: boolean) => ReactNode;
}) {
  return (
    <RadioGroup
      label={label}
      value={value}
      items={items}
      onChange={onChange}
      className="bg-muted grid h-10 w-full gap-0.5 rounded-[10px] border p-[3px] max-[1099px]:h-11"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      itemClassName={(checked) =>
        `min-w-0 truncate rounded-[7px] px-2 text-[13px] font-medium transition-colors ${
          checked
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`
      }
      renderItem={(item, checked) =>
        render ? render(item, checked) : item.label
      }
    />
  );
}
