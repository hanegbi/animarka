import type { LabelMode } from "@/poster/state/types";
import { planLegend } from "./legend";
import type { Frame } from "./types";

export const WIDTH = 100;
/**
 * Edge margin in poster units (% of the width). 6 puts the title's letters about 8% from the top, the
 * same as the space beside and below the birds (B4). Units, so the print file matches the screen.
 */
export const MARGIN = 6;
export const TITLE_HEIGHT = 8;
export const GAP = 2;

/** Poster regions in layout units. The animal area excludes the title and the legend. */
export function computeFrame(
  frameAspect: number,
  labels: LabelMode,
  count: number,
): Frame {
  const w = WIDTH;
  const h = WIDTH / frameAspect;
  const safe = { x: MARGIN, y: MARGIN, w: w - 2 * MARGIN, h: h - 2 * MARGIN };
  const title = { x: MARGIN, y: MARGIN, w: w - 2 * MARGIN, h: TITLE_HEIGHT };
  const legend =
    labels === "legend" && count > 0
      ? planLegend(count, w, h, frameAspect, MARGIN)
      : undefined;
  const top = title.y + title.h + GAP;
  const bottom = legend ? legend.box.y - GAP : h - MARGIN;
  return {
    w,
    h,
    safe,
    title,
    legend,
    area: {
      x: MARGIN,
      y: top,
      w: w - 2 * MARGIN,
      h: Math.max(0, bottom - top),
    },
  };
}
