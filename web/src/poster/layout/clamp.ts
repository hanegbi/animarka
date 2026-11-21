import type { Box } from "./types";

const EPS = 1e-6;

export function boxInside(b: Box, bounds: Box): boolean {
  return (
    b.x >= bounds.x - EPS &&
    b.y >= bounds.y - EPS &&
    b.x + b.w <= bounds.x + bounds.w + EPS &&
    b.y + b.h <= bounds.y + bounds.h + EPS
  );
}

export function boxesOverlap(a: Box, b: Box): boolean {
  return (
    a.x < b.x + b.w - EPS &&
    b.x < a.x + a.w - EPS &&
    a.y < b.y + b.h - EPS &&
    b.y < a.y + a.h - EPS
  );
}

/** Union of boxes. */
export function unionBox(...boxes: (Box | undefined)[]): Box {
  const list = boxes.filter((b): b is Box => !!b);
  const x0 = Math.min(...list.map((b) => b.x));
  const y0 = Math.min(...list.map((b) => b.y));
  const x1 = Math.max(...list.map((b) => b.x + b.w));
  const y1 = Math.max(...list.map((b) => b.y + b.h));
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/**
 * Slide a box the smallest distance so it sits inside the bounds. A box larger than the bounds is centered.
 * Layouts already build inside the free area, so this is a safety net, not the main method.
 */
export function clampInto(b: Box, bounds: Box): Box {
  const place = (pos: number, size: number, lo: number, span: number) =>
    size >= span
      ? lo + (span - size) / 2
      : Math.min(Math.max(pos, lo), lo + span - size);
  return {
    ...b,
    x: place(b.x, b.w, bounds.x, bounds.w),
    y: place(b.y, b.h, bounds.y, bounds.h),
  };
}

export function shiftBox(b: Box, dx: number, dy: number): Box {
  return { ...b, x: b.x + dx, y: b.y + dy };
}
