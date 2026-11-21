"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

/** S1. Inline search field. The list below filters as you type, and a status line says how many were found. */
export function SearchField({
  value,
  onChange,
  status,
  label = "Search birds",
}: {
  value: string;
  onChange: (value: string) => void;
  /** Read aloud when it changes. */
  status: string;
  label?: string;
}) {
  return (
    <div>
      <div className="relative">
        <SearchIcon
          aria-hidden
          className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2"
        />
        <Input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search all birds, try kestrel or heron"
          aria-label={label}
          autoComplete="off"
          className="h-11 ps-9 pe-9"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute end-0 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-md outline-none focus-visible:ring-3"
          >
            <XIcon aria-hidden className="size-4" />
          </button>
        )}
      </div>
      <p
        className="text-muted-foreground mt-1.5 text-xs"
        aria-live="polite"
        role="status"
      >
        {status}
      </p>
    </div>
  );
}
