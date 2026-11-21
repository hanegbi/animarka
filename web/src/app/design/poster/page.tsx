import { Suspense } from "react";
import { FIXTURE } from "@/catalog/fixture";
import { BACKGROUND_IDS, STYLE_IDS, viewLookup } from "@/catalog/lookup";
import type { SpeciesView } from "@/catalog/species-view";
import { STARTER_IDS } from "@/catalog/starter";
import { Poster } from "@/poster/components/Poster";
import { initialState, reduce } from "@/poster/state/reducer";
import {
  LABEL_MODES,
  LAYOUTS,
  ORIENTATIONS,
  SIZES,
  type CatalogLookup,
  type LabelMode,
  type LayoutId,
  type Orientation,
  type PosterContext,
  type SizeId,
} from "@/poster/state/types";

function pick<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  return (allowed as readonly string[]).includes(value ?? "")
    ? (value as T)
    : fallback;
}

/**
 * Dev page for tests and design review: any count from 1 to 150, any layout, label mode, size and language.
 * Counts above the catalog size reuse real art under synthetic ids.
 */
async function PosterFromQuery({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const q = await searchParams;
  const n = Math.max(0, Math.min(150, Number(q.n ?? 12) || 0));
  const realViews = FIXTURE.species;
  // The starter birds first, so n=12 is the poster a new visitor sees.
  const realIds = [
    ...STARTER_IDS.filter((id) => realViews.has(id)),
    ...[...realViews.keys()].filter((id) => !STARTER_IDS.includes(id)),
  ];

  // Counts above the fixture size reuse real art under synthetic ids.
  const views = new Map<string, SpeciesView>(realViews);
  const ids: string[] = [];
  for (let i = 0; i < n; i++) {
    if (i < realIds.length) {
      ids.push(realIds[i]);
    } else {
      const base = realViews.get(realIds[i % realIds.length])!;
      const id = `${base.id}-copy-${i}`;
      views.set(id, { ...base, id, name: `${base.name} ${i}` });
      ids.push(id);
    }
  }

  const lookup = viewLookup(views);
  const catalog: CatalogLookup = { ...lookup, ids: () => ids };
  const ctx: PosterContext = {
    catalog,
    styles: STYLE_IDS,
    backgrounds: BACKGROUND_IDS,
  };

  let state = initialState(ctx, ids);
  state = reduce(
    state,
    { type: "setLayout", layout: pick<LayoutId>(q.layout, LAYOUTS, "scatter") },
    ctx,
  );
  state = reduce(
    state,
    {
      type: "setLabels",
      labels: pick<LabelMode>(q.labels, LABEL_MODES, "names"),
    },
    ctx,
  );
  state = reduce(
    state,
    { type: "setSize", size: pick<SizeId>(q.size, SIZES, "3:4") },
    ctx,
  );
  state = reduce(
    state,
    {
      type: "setOrientation",
      orientation: pick<Orientation>(q.orientation, ORIENTATIONS, "portrait"),
    },
    ctx,
  );
  state = reduce(
    state,
    {
      type: "setStyle",
      style: STYLE_IDS.includes(q.style) ? q.style : STYLE_IDS[0],
    },
    ctx,
  );
  state = reduce(
    state,
    {
      type: "setBg",
      bg: BACKGROUND_IDS.includes(q.bg) ? q.bg : BACKGROUND_IDS[0],
    },
    ctx,
  );
  state = reduce(
    state,
    { type: "setLang", lang: q.lang === "he" ? "he" : "en" },
    ctx,
  );
  state = { ...state, seed: Number(q.seed ?? 7) || 7 };

  return (
    <main className="mx-auto w-full max-w-[900px] p-4">
      <Poster
        state={state}
        species={views}
        catalog={catalog}
        className="shadow-md"
      />
    </main>
  );
}

export default function PosterTestPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  return (
    <Suspense fallback={null}>
      <PosterFromQuery searchParams={searchParams} />
    </Suspense>
  );
}
