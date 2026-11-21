"use client";

import type { Lang } from "@/poster/state/types";
import type { RadioItem } from "./RadioGroup";
import { Segmented } from "./Segmented";

/**
 * Which language the bird names use, on the poster and in the picker. Built on the R8 segmented control, so
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
    <Segmented
      label="Bird names"
      value={value}
      items={ITEMS}
      onChange={onChange}
      render={(item) => (
        <span
          lang={item.value}
          dir={item.value === "he" ? "rtl" : "ltr"}
          // The system font has Hebrew on every platform. Heebo's Hebrew file (12 KB) then loads
          // only for people who switch, not for every visitor because of this one word.
          style={
            item.value === "he"
              ? { fontFamily: "system-ui, sans-serif" }
              : undefined
          }
        >
          {item.label}
        </span>
      )}
    />
  );
}
