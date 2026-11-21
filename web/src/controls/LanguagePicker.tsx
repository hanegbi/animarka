"use client";

import type { Lang } from "@/poster/state/types";
import { RadioGroup, type RadioItem } from "./RadioGroup";

/**
 * Which language the bird names use, on the poster and in the picker. Built on the R4 radio group, so
 * it needs no design round. Birds without a Hebrew name keep their English one.
 */
const ITEMS: RadioItem<Lang>[] = [
  { value: "en", label: "English" },
  { value: "he", label: "עברית" },
];

export function LanguagePicker({
  value,
  onChange,
}: {
  value: Lang;
  onChange: (lang: Lang) => void;
}) {
  return (
    <RadioGroup
      label="Bird names"
      value={value}
      items={ITEMS}
      onChange={onChange}
      className="bg-muted inline-flex gap-1 rounded-lg p-1"
      itemClassName={(checked) =>
        `min-h-11 min-w-20 rounded-md px-3 text-sm font-medium transition-colors ${
          checked
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`
      }
      renderItem={(item) => (
        <span lang={item.value} dir={item.value === "he" ? "rtl" : "ltr"}>
          {item.label}
        </span>
      )}
    />
  );
}
