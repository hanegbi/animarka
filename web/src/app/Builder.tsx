"use client";

import { useEffect, useRef } from "react";
import { DESKTOP_QUERY, useMediaQuery } from "@/lib/use-media-query";
import { useCatalog, usePosterActions } from "@/poster/state/provider";
import { DesktopShell } from "./shell/DesktopShell";
import { PhoneShell } from "./shell/PhoneShell";

/** Picks the shell for the window: desktop (R2 S2) at 1100 px and wider, phone (R2 P3) below that. */
export function Builder() {
  const desktop = useMediaQuery(DESKTOP_QUERY);
  useSetFromUrl();
  return <>{desktop ? <DesktopShell /> : <PhoneShell />}</>;
}

/**
 * /make?set=owls-of-the-world opens the builder with that set, named after it (the landing page's
 * set cards link here). The parameter is then dropped from the address, so a reload keeps your edits.
 */
function useSetFromUrl() {
  const { presets } = useCatalog();
  const { dispatch } = usePosterActions();
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const url = new URL(window.location.href);
    const id = url.searchParams.get("set");
    if (!id) return;
    const preset = presets.find((p) => p.id === id);
    if (preset)
      dispatch({ type: "replaceWith", ids: preset.ids, title: preset.title });
    url.searchParams.delete("set");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }, [presets, dispatch]);
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
