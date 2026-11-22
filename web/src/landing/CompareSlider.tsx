/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState } from "react";

/**
 * The same poster in both styles under one line you drag (S1). The range input underneath makes it
 * work from the keyboard and for screen readers too.
 */
export function CompareSlider() {
  const [x, setX] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const move = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setX(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <div className="flex w-full max-w-[440px] flex-col gap-3">
      <div
        ref={box}
        className="relative aspect-[3/4] w-full cursor-ew-resize touch-none overflow-hidden shadow-[0_24px_50px_-18px_rgb(30_27_22/0.4)] select-none"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          move(e.clientX);
        }}
        onPointerMove={(e) => e.buttons && move(e.clientX)}
        data-compare
      >
        <img
          src="/landing/starter-wb-sm.webp"
          alt="Twelve birds in the woodblock style"
          width={600}
          height={800}
          loading="lazy"
          className="absolute inset-0 h-full w-full"
        />
        <img
          src="/landing/starter-fg-sm.webp"
          alt="The same twelve birds in the field guide style"
          width={600}
          height={800}
          loading="lazy"
          className="absolute inset-0 h-full w-full"
          style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }}
        />
        <div
          aria-hidden
          className="bg-card absolute inset-y-0 w-[3px] -translate-x-1/2"
          style={{ left: `${x}%` }}
        >
          <span className="bg-card absolute top-1/2 left-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border shadow">
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
        <span className="bg-card/90 absolute top-3 left-3 rounded-md px-2 py-1 text-xs font-medium">
          Field guide
        </span>
        <span className="bg-card/90 absolute top-3 right-3 rounded-md px-2 py-1 text-xs font-medium">
          Woodblock
        </span>
      </div>
      <label className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground shrink-0">Field guide</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(x)}
          onChange={(e) => setX(Number(e.target.value))}
          aria-label="Compare the two styles"
          className="accent-primary w-full"
        />
        <span className="text-muted-foreground shrink-0">Woodblock</span>
      </label>
    </div>
  );
}
