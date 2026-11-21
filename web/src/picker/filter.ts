import type { SpeciesView } from "@/catalog/species-view";
import type { Lang } from "@/poster/state/types";

/** 1161 reads as "1,161". */
export const num = (n: number) => n.toLocaleString("en-US");

export const ALL = "All";

/** Lowercase and drop accents, so "Kestrel", "kestrel" and "késtrel" all match. */
export function normalize(text: string): string {
  return text.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/** Every word typed must match the common name (any language), the scientific name or the family. */
export function matches(s: SpeciesView, query: string): boolean {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = normalize(
    [s.name, ...Object.values(s.names), s.sci, s.family].join(" | "),
  );
  return words.every((w) => haystack.includes(w));
}

/** Search wins over the family filter, like the prototype. */
export function shownList(
  list: SpeciesView[],
  view: string,
  query: string,
): SpeciesView[] {
  if (query.trim()) return list.filter((s) => matches(s, query));
  return view === ALL ? list : list.filter((s) => s.family === view);
}

export type FamilyInfo = { family: string; total: number; onPoster: number };

/** Families in catalog order, with how many birds each has and how many are on the poster. */
export function familyList(list: SpeciesView[], order: string[]): FamilyInfo[] {
  const on = new Set(order);
  const map = new Map<string, FamilyInfo>();
  for (const s of list) {
    const info = map.get(s.family) ?? {
      family: s.family,
      total: 0,
      onPoster: 0,
    };
    info.total++;
    if (on.has(s.id)) info.onPoster++;
    map.set(s.family, info);
  }
  return [...map.values()];
}

export type ListActions = {
  /** "Add all 12" or "Remove these 12". */
  addAllLabel: string;
  /** True when every bird in the list is already on the poster. */
  allOn: boolean;
  addAllDisabled: boolean;
  /** "Only owls" or "Only these 5". Hidden when the list is the whole catalog. */
  onlyLabel: string;
  onlyHidden: boolean;
  /** True when the poster already holds exactly this list. */
  onlyDisabled: boolean;
};

export function listActions(
  list: SpeciesView[],
  view: string,
  query: string,
  order: string[],
): ListActions {
  const on = new Set(order);
  const onCount = list.filter((s) => on.has(s.id)).length;
  const allOn = list.length > 0 && onCount === list.length;
  const searching = query.trim().length > 0;
  return {
    addAllLabel: allOn
      ? `Remove these ${num(list.length)}`
      : `Add all ${num(list.length)}`,
    allOn,
    addAllDisabled: list.length === 0,
    onlyLabel: searching
      ? `Only these ${num(list.length)}`
      : `Only ${view.toLowerCase()}`,
    onlyHidden: list.length === 0 || (view === ALL && !searching),
    onlyDisabled: allOn && order.length === list.length,
  };
}

/** The line above the list, read aloud by screen readers. */
export function statusLine(
  list: SpeciesView[],
  view: string,
  query: string,
  order: string[],
): string {
  if (!list.length) return "No bird matches that search.";
  const on = new Set(order);
  const onCount = list.filter((s) => on.has(s.id)).length;
  const base = query.trim()
    ? `${num(list.length)} found`
    : view === ALL
      ? `All ${num(list.length)} birds`
      : `${view}, ${num(list.length)} birds`;
  return onCount ? `${base}, ${onCount} on poster` : base;
}

/** "14 birds from 5 families", "1 bird from 1 family" or "empty". */
export function trayLabel(
  order: string[],
  byId: Map<string, SpeciesView>,
): string {
  if (!order.length) return "empty";
  const families = new Set(
    order.map((id) => byId.get(id)?.family).filter(Boolean),
  );
  const birds = `${order.length} ${order.length === 1 ? "bird" : "birds"}`;
  return `${birds} from ${families.size} ${families.size === 1 ? "family" : "families"}`;
}

/** The name to show for a language, with English as the fallback. */
export function nameIn(s: SpeciesView, lang: Lang): string {
  return s.names[lang] ?? s.name;
}
