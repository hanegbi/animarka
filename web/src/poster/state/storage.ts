import { autoTitle, initialState } from "./reducer";
import {
  LABEL_MODES,
  LANGS,
  LAYOUTS,
  ORIENTATIONS,
  SIZES,
  type PosterContext,
  type PosterState,
} from "./types";

export const STORAGE_KEY = "animarka-poster-v1";

function oneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return typeof value === "string" &&
    (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

/** Turn anything read from storage or a share link into a valid state. Returns null if it is not a poster. */
export function sanitize(raw: unknown, ctx: PosterContext): PosterState | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (!Array.isArray(r.order)) return null;

  const base = initialState(ctx);
  const order = r.order.filter(
    (id, i, arr): id is string =>
      typeof id === "string" && ctx.catalog.has(id) && arr.indexOf(id) === i,
  );
  const on = new Set(order);

  const flip: Record<string, true> = {};
  if (r.flip && typeof r.flip === "object") {
    for (const id of Object.keys(r.flip)) if (on.has(id)) flip[id] = true;
  }

  const titleAuto = typeof r.titleAuto === "boolean" ? r.titleAuto : true;
  const rawTitle = typeof r.title === "string" ? r.title.slice(0, 60) : "";
  const title =
    titleAuto || !rawTitle.trim() ? autoTitle(order, ctx) : rawTitle;

  return {
    ...base,
    order,
    flip,
    center:
      typeof r.center === "string" && on.has(r.center) ? r.center : undefined,
    seed:
      typeof r.seed === "number" && Number.isFinite(r.seed)
        ? Math.floor(r.seed)
        : base.seed,
    title,
    titleAuto: titleAuto || !rawTitle.trim(),
    labels: oneOf(r.labels, LABEL_MODES, base.labels),
    lang: oneOf(r.lang, LANGS, base.lang),
    style: oneOf(r.style, ctx.styles, base.style),
    bg: oneOf(r.bg, ctx.backgrounds, base.bg),
    layout: oneOf(r.layout, LAYOUTS, base.layout),
    size: oneOf(r.size, SIZES, base.size),
    orientation: oneOf(r.orientation, ORIENTATIONS, base.orientation),
  };
}

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function loadState(
  storage: StorageLike | undefined,
  ctx: PosterContext,
): PosterState | null {
  try {
    const text = storage?.getItem(STORAGE_KEY);
    return text ? sanitize(JSON.parse(text), ctx) : null;
  } catch {
    return null;
  }
}

export function saveState(
  storage: StorageLike | undefined,
  state: PosterState,
): void {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode or a full disk. The poster still works, it just will not be remembered.
  }
}
