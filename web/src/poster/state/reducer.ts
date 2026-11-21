import { seededShuffle } from "./random";
import {
  MAX_BIRDS,
  type PosterAction,
  type PosterContext,
  type PosterState,
} from "./types";

export const DEFAULT_TITLE = "Birds";

export function initialState(
  ctx: PosterContext,
  order: string[] = [],
): PosterState {
  const state: PosterState = {
    v: 1,
    catalog: "birds",
    order: order.filter((id) => ctx.catalog.has(id)),
    flip: {},
    seed: 7,
    title: "",
    titleAuto: true,
    labels: "names",
    lang: "en",
    style: ctx.styles[0],
    bg: ctx.backgrounds[0],
    layout: "scatter",
    size: "3:4",
    orientation: "portrait",
  };
  return withAutoTitle(state, ctx);
}

/** One family gives its name. A mix, or an empty poster, gives "Birds". */
export function autoTitle(order: string[], ctx: PosterContext): string {
  const families = new Set<string>();
  for (const id of order) {
    const f = ctx.catalog.family(id);
    if (f) families.add(f);
  }
  return families.size === 1 ? [...families][0] : DEFAULT_TITLE;
}

function withAutoTitle(state: PosterState, ctx: PosterContext): PosterState {
  if (!state.titleAuto) return state;
  const title = autoTitle(state.order, ctx);
  return title === state.title ? state : { ...state, title };
}

/** Keep flips and the centerpiece pointing only at birds still on the poster. */
function pruned(state: PosterState): PosterState {
  const on = new Set(state.order);
  const flip: Record<string, true> = {};
  for (const id of Object.keys(state.flip)) if (on.has(id)) flip[id] = true;
  const center =
    state.center && on.has(state.center) ? state.center : undefined;
  return { ...state, flip, center };
}

function setOrder(
  state: PosterState,
  order: string[],
  ctx: PosterContext,
): PosterState {
  return withAutoTitle(pruned({ ...state, order }), ctx);
}

function unique(ids: string[]): string[] {
  return ids.filter((id, i) => ids.indexOf(id) === i);
}

/** Surprise mix picks 12 to 16 birds. The seed decides which, so tests are stable. */
export function surprisePick(allIds: string[], seed: number): string[] {
  const count = 12 + (Math.abs(Math.floor(seed)) % 5);
  return seededShuffle(allIds, seed).slice(0, Math.min(count, allIds.length));
}

/** Pure. Returns the same object when nothing changes, so history can skip no-ops. */
export function reduce(
  state: PosterState,
  action: PosterAction,
  ctx: PosterContext,
): PosterState {
  switch (action.type) {
    case "toggle": {
      if (!ctx.catalog.has(action.id)) return state;
      if (state.order.includes(action.id))
        return setOrder(
          state,
          state.order.filter((x) => x !== action.id),
          ctx,
        );
      if (state.order.length >= MAX_BIRDS) return state;
      return setOrder(state, [...state.order, action.id], ctx);
    }
    case "addMany": {
      const add = unique(action.ids)
        .filter((id) => ctx.catalog.has(id) && !state.order.includes(id))
        .slice(0, Math.max(0, MAX_BIRDS - state.order.length));
      return add.length
        ? setOrder(state, [...state.order, ...add], ctx)
        : state;
    }
    case "removeMany": {
      const drop = new Set(action.ids);
      const order = state.order.filter((id) => !drop.has(id));
      return order.length === state.order.length
        ? state
        : setOrder(state, order, ctx);
    }
    case "replaceWith": {
      const order = unique(action.ids)
        .filter((id) => ctx.catalog.has(id))
        .slice(0, MAX_BIRDS);
      // Replacing the poster resets mirrors, like the prototype's "Only this family".
      return setOrder({ ...state, flip: {}, center: undefined }, order, ctx);
    }
    case "clear":
      return state.order.length
        ? setOrder({ ...state, flip: {}, center: undefined }, [], ctx)
        : state;
    case "surprise":
      return setOrder(
        { ...state, flip: {}, center: undefined, seed: action.seed },
        surprisePick(ctx.catalog.ids(), action.seed),
        ctx,
      );
    case "swap": {
      const i = state.order.indexOf(action.a);
      const j = state.order.indexOf(action.b);
      if (i === -1 || j === -1 || i === j) return state;
      const order = state.order.slice();
      order[i] = action.b;
      order[j] = action.a;
      return { ...state, order };
    }
    case "move": {
      const i = state.order.indexOf(action.id);
      const j = i + action.delta;
      if (i === -1 || j < 0 || j >= state.order.length || j === i) return state;
      const order = state.order.slice();
      [order[i], order[j]] = [order[j], order[i]];
      return { ...state, order };
    }
    case "mirror": {
      if (!state.order.includes(action.id)) return state;
      const flip = { ...state.flip };
      if (flip[action.id]) delete flip[action.id];
      else flip[action.id] = true;
      return { ...state, flip };
    }
    case "shuffle":
      return state.order.length < 2
        ? state
        : {
            ...state,
            order: seededShuffle(state.order, action.seed),
            seed: action.seed,
          };
    case "setStyle":
      return ctx.styles.includes(action.style) && action.style !== state.style
        ? { ...state, style: action.style }
        : state;
    case "setLabels":
      return action.labels === state.labels
        ? state
        : { ...state, labels: action.labels };
    case "setLayout":
      return action.layout === state.layout
        ? state
        : { ...state, layout: action.layout };
    case "setBg":
      return ctx.backgrounds.includes(action.bg) && action.bg !== state.bg
        ? { ...state, bg: action.bg }
        : state;
    case "setSize":
      return action.size === state.size
        ? state
        : { ...state, size: action.size };
    case "setOrientation":
      return action.orientation === state.orientation
        ? state
        : { ...state, orientation: action.orientation };
    case "setLang":
      return action.lang === state.lang
        ? state
        : { ...state, lang: action.lang };
    case "setTitle": {
      const titleAuto = !action.title.trim();
      const next = { ...state, title: action.title, titleAuto };
      return titleAuto ? withAutoTitle(next, ctx) : next;
    }
    case "setCenter":
      if (action.id !== undefined && !state.order.includes(action.id))
        return state;
      return action.id === state.center
        ? state
        : { ...state, center: action.id };
  }
}
