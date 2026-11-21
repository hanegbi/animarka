"use client";

import { useSyncExternalStore } from "react";

/** True while the media query matches. False on the server. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", notify);
      return () => mq.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * At 1100 px and wider the toolbar fits on one or two rows beside the picker, which is the desktop shell (R2, S2).
 * Narrower than that uses the phone pattern: poster on top, bottom tab bar, short sheet (R2, P3).
 */
export const DESKTOP_QUERY = "(min-width: 1100px)";
