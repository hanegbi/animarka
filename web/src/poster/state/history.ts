import { reduce } from "./reducer";
import type { PosterAction, PosterContext, PosterState } from "./types";

export const HISTORY_LIMIT = 40;

export type History = {
  past: PosterState[];
  present: PosterState;
  future: PosterState[];
  /** The last action type, used to merge runs of title typing into one undo step. */
  last: PosterAction["type"] | null;
};

export function createHistory(present: PosterState): History {
  return { past: [], present, future: [], last: null };
}

export function apply(
  history: History,
  action: PosterAction,
  ctx: PosterContext,
): History {
  const next = reduce(history.present, action, ctx);
  if (next === history.present) return history;
  const merge = action.type === "setTitle" && history.last === "setTitle";
  const past = merge
    ? history.past
    : [...history.past, history.present].slice(-HISTORY_LIMIT);
  return { past, present: next, future: [], last: action.type };
}

export function undo(history: History): History {
  if (!history.past.length) return history;
  const present = history.past[history.past.length - 1];
  return {
    past: history.past.slice(0, -1),
    present,
    future: [history.present, ...history.future],
    last: null,
  };
}

export function redo(history: History): History {
  if (!history.future.length) return history;
  const [present, ...future] = history.future;
  return {
    past: [...history.past, history.present],
    present,
    future,
    last: null,
  };
}
