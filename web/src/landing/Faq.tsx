"use client";

import { useState } from "react";

/** Q3. An accordion, one answer open at a time. Each question is a real button with aria-expanded. */
export function Faq({
  items,
}: {
  items: readonly (readonly [string, string])[];
}) {
  const [open, setOpen] = useState(0);
  return (
    <div className="border-t">
      {items.map(([q, a], i) => {
        const on = open === i;
        return (
          <div key={q} className="border-b">
            <h3>
              <button
                type="button"
                aria-expanded={on}
                aria-controls={`faq-${i}`}
                onClick={() => setOpen(on ? -1 : i)}
                className="focus-visible:ring-ring/50 flex w-full items-center justify-between gap-4 rounded-md py-5 text-start text-lg font-medium outline-none focus-visible:ring-3"
              >
                {q}
                <span
                  aria-hidden
                  className={`text-primary text-2xl leading-none transition-transform motion-reduce:transition-none ${on ? "rotate-45" : ""}`}
                >
                  +
                </span>
              </button>
            </h3>
            <div id={`faq-${i}`} hidden={!on}>
              <p className="text-muted-foreground max-w-[64ch] pb-5 leading-relaxed">
                {a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
