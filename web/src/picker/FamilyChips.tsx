"use client";

import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { ALL, normalize, num, type FamilyInfo } from "./filter";

/**
 * The family filter. One full-width button names the family on show; it opens a vertical list with a
 * quick find, each family's bird count and how many of its birds are on the poster. Nothing scrolls
 * sideways. Picking a family only filters the list and never changes the poster.
 * (Replaces the F1 chip row, which had to scroll sideways through 134 families.)
 */
export const FamilyChips = memo(function FamilyChips({
  families,
  view,
  onView,
  totalOnPoster,
  totalBirds,
}: {
  families: FamilyInfo[];
  view: string;
  onView: (view: string) => void;
  totalOnPoster: number;
  totalBirds: number;
}) {
  const [open, setOpen] = useState(false);
  const [find, setFind] = useState("");

  const rows = useMemo(() => {
    const all = [
      {
        key: ALL,
        label: "All families",
        total: totalBirds,
        onPoster: totalOnPoster,
      },
      ...families.map((f) => ({
        key: f.family,
        label: f.family,
        total: f.total,
        onPoster: f.onPoster,
      })),
    ];
    const q = normalize(find);
    return q
      ? all.filter((r) => r.key !== ALL && normalize(r.label).includes(q))
      : all;
  }, [families, find, totalBirds, totalOnPoster]);

  const current = rows.find((r) => r.key === view) ?? {
    label: view === ALL ? "All families" : view,
    total:
      view === ALL
        ? totalBirds
        : (families.find((f) => f.family === view)?.total ?? 0),
  };

  const choose = (key: string) => {
    onView(key);
    setOpen(false);
    setFind("");
  };

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="family-list"
        onClick={() => setOpen((o) => !o)}
        className="bg-card hover:bg-muted focus-visible:ring-ring/50 flex h-10 w-full min-w-0 items-center gap-2 rounded-[10px] border px-3 text-start text-sm outline-none focus-visible:ring-3 max-[1099px]:h-11"
      >
        <span className="text-muted-foreground shrink-0 text-[13px]">
          Family
        </span>
        <span className="min-w-0 flex-1 truncate font-medium">
          {current.label}
        </span>
        <span className="text-muted-foreground shrink-0 text-[13px] tabular-nums">
          {num(current.total)}
        </span>
        <ChevronDownIcon
          aria-hidden
          className={`text-muted-foreground size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          id="family-list"
          className="bg-card flex min-w-0 flex-col gap-2 rounded-[10px] border p-2"
        >
          <label className="relative block">
            <span className="sr-only">Find a family</span>
            <SearchIcon
              aria-hidden
              className="text-muted-foreground pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2"
            />
            <input
              type="text"
              value={find}
              onChange={(e) => setFind(e.target.value)}
              placeholder="Find a family, try owls"
              className="placeholder:text-muted-foreground focus-visible:ring-ring/50 h-8 w-full rounded-[8px] border bg-transparent ps-8 pe-2 text-[13px] outline-none focus-visible:ring-3 max-[1099px]:h-10"
            />
          </label>
          <div
            role="group"
            aria-label="Show a family"
            className="flex max-h-72 min-w-0 flex-col overflow-y-auto overscroll-contain"
          >
            {rows.length === 0 && (
              <p className="text-muted-foreground px-2 py-3 text-[13px]">
                No family matches that.
              </p>
            )}
            {rows.map((r) => {
              const pressed = r.key === view;
              return (
                <button
                  key={r.key}
                  type="button"
                  aria-pressed={pressed}
                  aria-label={`${r.key === ALL ? ALL : r.label}${r.onPoster ? `, ${r.onPoster} on poster` : ""}`}
                  onClick={() => choose(r.key)}
                  className={`focus-visible:ring-ring/50 flex min-h-9 w-full min-w-0 shrink-0 items-center gap-2 rounded-[8px] px-2 text-start text-[13px] outline-none focus-visible:ring-3 max-[1099px]:min-h-11 ${
                    pressed ? "bg-accent font-medium" : "hover:bg-muted"
                  }`}
                >
                  <CheckIcon
                    aria-hidden
                    className={`text-primary size-4 shrink-0 ${pressed ? "" : "invisible"}`}
                  />
                  <span className="min-w-0 flex-1 truncate">{r.label}</span>
                  {r.onPoster > 0 && (
                    <span className="bg-primary text-primary-foreground shrink-0 rounded-full px-1.5 text-[12px] leading-5 font-medium tabular-nums">
                      {r.onPoster}
                    </span>
                  )}
                  <span className="text-muted-foreground w-10 shrink-0 text-end tabular-nums">
                    {num(r.total)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});
