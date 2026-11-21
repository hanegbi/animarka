import { Suspense } from "react";
import { BACKGROUND_IDS, STYLE_IDS, staticLookup } from "@/catalog/lookup";
import { staticSpeciesViews, type SpeciesView } from "@/catalog/species-view";
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

/** Sample Hebrew names for the right to left test only. The real names arrive from the API in M2. */
const SAMPLE_HEBREW: Record<string, string> = {
  "tyto-alba": "תנשמת לבנה",
  "bubo-bubo": "אוח מצוי",
  "alcedo-atthis": "שלדג גמד",
  "falco-peregrinus": "בז נודד",
  "ardea-cinerea": "אנפה אפורה",
  "anas-platyrhynchos": "ברווז בר",
  "cygnus-olor": "ברבור אילם",
  "hirundo-rustica": "סנונית רפתות",
};

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
  const real = staticLookup();
  const realViews = staticSpeciesViews();
  const realIds = real.ids();

  const views = new Map<string, SpeciesView>(realViews);
  const ids: string[] = [];
  for (let i = 0; i < n; i++) {
    if (i < realIds.length) {
      ids.push(realIds[i]);
    } else {
      const base = realViews.get(realIds[i % realIds.length])!;
      const id = `${base.id}-copy-${i}`;
      views.set(id, { ...base, id, artId: base.id, name: `${base.name} ${i}` });
      ids.push(id);
    }
  }
  for (const [id, hebrew] of Object.entries(SAMPLE_HEBREW)) {
    const v = views.get(id);
    if (v) views.set(id, { ...v, names: { ...v.names, he: hebrew } });
  }

  const catalog: CatalogLookup = {
    has: (id) => views.has(id),
    family: (id) => views.get(id)?.family ?? null,
    faces: (id, style) => real.faces(views.get(id)?.artId ?? id, style),
    ids: () => ids,
  };
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
