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
    <div className="border-t border-[rgb(var(--lp-shadow)/0.18)]">
      {items.map(([q, a], i) => {
        const on = open === i;
        return (
          <div key={q} className="border-b border-[rgb(var(--lp-shadow)/0.18)]">
            <h3>
              <button
                type="button"
                aria-expanded={on}
                aria-controls={`faq-${i}`}
                onClick={() => setOpen(on ? -1 : i)}
                className="flex w-full items-center justify-between gap-4 py-6 text-start text-xl leading-snug font-medium transition-colors duration-200 hover:text-[var(--lp-muted)]"
              >
                {q}
                <span
                  aria-hidden
                  className={`text-2xl leading-none text-[var(--lp-cobalt)] transition-transform duration-200 ease-out motion-reduce:transition-none ${on ? "rotate-45" : ""}`}
                >
                  +
                </span>
              </button>
            </h3>
            <div id={`faq-${i}`} hidden={!on}>
              <p className="max-w-[64ch] pb-6 text-lg leading-relaxed text-[var(--lp-muted)]">
                {a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
