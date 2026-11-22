"use client";

import { DESKTOP_QUERY, useMediaQuery } from "@/lib/use-media-query";
import { DesktopShell } from "./shell/DesktopShell";
import { PhoneShell } from "./shell/PhoneShell";

/** Picks the shell for the window: desktop (R2 S2) at 1100 px and wider, phone (R2 P3) below that. */
export function Builder() {
  const desktop = useMediaQuery(DESKTOP_QUERY);
  return <>{desktop ? <DesktopShell /> : <PhoneShell />}</>;
}

const pulse = "animate-pulse motion-reduce:animate-none bg-muted";

/** L2. The shape of the page while the saved poster loads, so nothing jumps when it arrives. */
export function BuilderFallback() {
  return (
    <div
      className="flex h-dvh flex-col min-[1100px]:grid min-[1100px]:grid-cols-[380px_1fr] min-[1100px]:grid-rows-[auto_1fr]"
      role="status"
      aria-busy="true"
      aria-label="Loading your poster"
    >
      <div className="bg-card h-14 shrink-0 border-b min-[1100px]:col-span-2" />
      <div className="bg-card hidden space-y-3 border-e p-3 min-[1100px]:block">
        <div className={`${pulse} h-11 rounded-lg`} />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={`${pulse} h-11 w-24 rounded-full`} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className={`${pulse} h-[124px] rounded-lg`} />
          ))}
        </div>
      </div>
      <div className="grid min-h-0 flex-1 place-items-center p-4">
        <div className={`${pulse} aspect-[3/4] h-full max-h-full rounded-sm`} />
      </div>
      <span className="sr-only">Loading your poster</span>
    </div>
  );
}
