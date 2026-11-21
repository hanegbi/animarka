"use client";

import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { ALL, type FamilyInfo } from "./filter";

/**
 * F1. Wrapping pills. One family is shown at a time. A chip only filters the list and never resets the poster.
 * The badge counts birds of that family on the poster. Adapted from Role Filter Chips by cnippet-dev.
 */
/**
 * Memoized: typing in the search re-renders the picker, and with over a hundred chips this row was
 * most of the cost. It only changes when the counts, the view or the poster size change.
 */
export const FamilyChips = memo(function FamilyChips({
  families,
  view,
  onView,
  totalOnPoster,
}: {
  families: FamilyInfo[];
  view: string;
  onView: (view: string) => void;
  totalOnPoster: number;
}) {
  const chips: {
    key: string;
    label: string;
    onPoster: number;
    total?: number;
  }[] = [
    { key: ALL, label: ALL, onPoster: totalOnPoster },
    ...families.map((f) => ({
      key: f.family,
      label: f.family,
      onPoster: f.onPoster,
      total: f.total,
    })),
  ];
  return (
    <div
      role="group"
      aria-label="Show a family"
      // The chips scroll sideways in one row at every width. The full catalog has over a hundred
      // families, so wrapping would push the birds off the first screen.
      className="-mx-1 flex [scrollbar-width:thin] gap-1.5 overflow-x-auto px-1 pb-1.5"
    >
      {chips.map((c) => {
        const pressed = c.key === view;
        return (
          <Toggle
            key={c.key}
            pressed={pressed}
            onPressedChange={() => onView(c.key)}
            variant="outline"
            aria-label={`${c.label}${c.onPoster ? `, ${c.onPoster} on poster` : ""}`}
            className="data-[pressed]:border-primary data-[pressed]:bg-primary data-[pressed]:text-primary-foreground h-11 shrink-0 gap-1.5 rounded-full px-3.5"
          >
            {c.label}
            {c.onPoster > 0 && (
              <Badge
                variant={pressed ? "default" : "outline"}
                className={
                  pressed
                    ? "bg-primary-foreground text-primary"
                    : "text-foreground"
                }
              >
                {c.onPoster}
              </Badge>
            )}
          </Toggle>
        );
      })}
    </div>
  );
});
