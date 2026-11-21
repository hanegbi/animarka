import type { Orientation, SizeId } from "@/poster/state/types";
import type { Box } from "./types";

/** Smallest and largest relative size, from the prototype's log mass rule. */
export const SCALE_MIN = 0.72;
export const SCALE_MAX = 1.35;

/** Relative size from body mass: log scale, clamped. An eagle is bigger than a finch, both stay readable. */
export function massScale(massG: number): number {
  const m = massG > 0 ? massG : 100;
  const s = SCALE_MIN + 0.2 * (Math.log10(m) - 1);
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, s));
}

/** 0 for the smallest scale, 1 for the largest. */
export function massRel(massG: number): number {
  return (massScale(massG) - SCALE_MIN) / (SCALE_MAX - SCALE_MIN);
}

/** Share of the cell an animal uses: the lightest fills 70%, the heaviest 100%. */
export function fitFactor(massG: number): number {
  return 0.7 + 0.3 * massRel(massG);
}

const PORTRAIT_ASPECT: Record<SizeId, number> = {
  "3:4": 3 / 4,
  "2:3": 2 / 3,
  "4:5": 4 / 5,
};

/** Poster width over height. */
export function frameAspect(size: SizeId, orientation: Orientation): number {
  const a = PORTRAIT_ASPECT[size];
  return orientation === "portrait" ? a : 1 / a;
}

/** Largest box of the given aspect that fits inside maxW by maxH. */
export function fitBox(
  aspect: number,
  maxW: number,
  maxH: number,
): { w: number; h: number } {
  const a = aspect > 0 ? aspect : 0.75;
  const w = Math.max(0, Math.min(maxW, maxH * a));
  return { w, h: w / a };
}

export function median(values: number[]): number {
  if (!values.length) return 0.75;
  const s = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

export function centerOf(b: Box): { x: number; y: number } {
  return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
}
