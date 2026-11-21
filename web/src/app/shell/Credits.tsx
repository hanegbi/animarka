"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Art credits, behind a small header button (owner asked for the always-on paragraph to go).
 * Credit has to stay reachable: CC BY 4.0 requires attribution, and MIT asks for its notice.
 */
export function Credits() {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={box} className="relative">
      <Button
        variant="ghost"
        size="sm"
        aria-expanded={open}
        aria-controls="art-credits"
        onClick={() => setOpen((o) => !o)}
      >
        Credits
      </Button>
      {open && (
        <div
          id="art-credits"
          role="note"
          className="bg-popover text-popover-foreground absolute end-0 top-full z-50 mt-2 w-72 rounded-[10px] border p-3 text-[13px] leading-snug shadow-lg"
        >
          Field guide art by Huashu, from{" "}
          <a
            className="underline"
            href="https://github.com/alchaincyf/huashu-bird-sticker"
          >
            huashu-bird-sticker
          </a>
          , CC BY 4.0. Woodblock art by Adam Oberley, Teddy Warner and
          contributors, from{" "}
          <a
            className="underline"
            href="https://github.com/adamoberley/HABirdDashboard"
          >
            HABirdDashboard
          </a>
          , MIT. Both sets are AI generated and may contain errors.
        </div>
      )}
    </div>
  );
}
