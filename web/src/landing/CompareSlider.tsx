/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";

/**
 * The same 12 bird grid in both styles under one line. A native range input covers the whole
 * picture, so dragging, touch, keyboard and screen readers all use one control. On release the
 * line settles into the nearest gap between columns, so it never rests on a bird or a name; the
 * arrow keys step from gap to gap. The style labels fade when the line comes near them.
 */
const STOPS = [0, 34, 66.5, 100];

export function CompareSlider() {
  const [x, setX] = useState(66.5);
  const [drag, setDrag] = useState(false);
  const settle = () => {
    setDrag(false);
    setX((v) =>
      STOPS.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a)),
    );
  };
  const step = (dir: 1 | -1) =>
    setX((v) => {
      const next =
        dir > 0
          ? STOPS.find((s) => s > v + 0.1)
          : [...STOPS].reverse().find((s) => s < v - 0.1);
      return next ?? v;
    });
  const ease = drag
    ? "none"
    : "clip-path 220ms var(--lp-ease), left 220ms var(--lp-ease)";

  return (
    <div
      className="relative aspect-[3/4] w-full max-w-[520px] overflow-hidden rounded-[3px] select-none"
      style={{ boxShadow: "var(--lp-shadow-print)" }}
      data-compare
    >
      <img
        src="/landing/r9/grid-wb.webp"
        alt="Twelve birds in the woodblock style"
        width={800}
        height={1067}
        loading="lazy"
        className="absolute inset-0 h-full w-full"
      />
      <img
        src="/landing/r9/grid-fg.webp"
        alt="The same twelve birds in the field guide style"
        width={800}
        height={1067}
        loading="lazy"
        className="absolute inset-0 h-full w-full"
        style={{ clipPath: `inset(0 ${100 - x}% 0 0)`, transition: ease }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-[2px] -translate-x-1/2 bg-[var(--lp-paper)] shadow-[0_0_0_1px_rgb(var(--lp-shadow)/0.12)]"
        style={{ left: `${x}%`, transition: ease }}
      >
        <span className="absolute top-[5.5%] left-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[var(--lp-paper)] text-[var(--lp-vermilion)] shadow-[0_2px_8px_rgb(var(--lp-shadow)/0.3)]">
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m8 7-5 5 5 5M16 7l5 5-5 5" />
          </svg>
        </span>
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-3 left-3 rounded-[4px] bg-[var(--lp-paper)] px-2 py-1 text-xs font-medium text-[var(--lp-forest)] transition-opacity duration-200"
        style={{ opacity: x < 24 ? 0 : 1 }}
      >
        Field guide
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute right-3 bottom-3 rounded-[4px] bg-[var(--lp-paper)] px-2 py-1 text-xs font-medium text-[var(--lp-forest)] transition-opacity duration-200"
        style={{ opacity: x > 76 ? 0 : 1 }}
      >
        Woodblock
      </span>
      <input
        type="range"
        min={0}
        max={100}
        step={0.5}
        value={x}
        aria-label="Compare the two styles"
        aria-valuetext={`${Math.round(x)}% field guide`}
        onChange={(e) => {
          setDrag(true);
          setX(Number(e.target.value));
        }}
        onPointerUp={settle}
        onTouchEnd={settle}
        onKeyDown={(e) => {
          const k = e.key;
          if (k === "ArrowRight" || k === "ArrowUp") step(1);
          else if (k === "ArrowLeft" || k === "ArrowDown") step(-1);
          else if (k === "Home") setX(0);
          else if (k === "End") setX(100);
          else return;
          e.preventDefault();
          setDrag(false);
        }}
        className="lp-range absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
