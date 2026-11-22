import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SPECIES_URL } from "@/catalog/api";
import { decodeCompact, type ApiCompact } from "@/catalog/compact";
import { BACKGROUND_IDS, STYLE_IDS, viewLookup } from "@/catalog/lookup";
import { toView, type SpeciesView } from "@/catalog/species-view";
import { validToken } from "@/lib/render-token";
import { Poster } from "@/poster/components/Poster";
import { sanitize } from "@/poster/state/storage";
import { RenderReady } from "./RenderReady";

/**
 * The print route: only the poster, at an exact pixel width, for the render worker's browser.
 * Reachable only with a signed token. Previews carry a watermark.
 */
async function Render({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { id } = await params;
  const q = await searchParams;
  const width = Math.round(Number(q.w) || 0);
  const kind = q.kind === "print" ? "print" : "preview";
  if (width < 200 || width > 8000 || !validToken(id, width, kind, q.t))
    notFound();

  const api = process.env.API_ORIGIN ?? "http://localhost:8000";
  const [posterRes, catalogRes] = await Promise.all([
    fetch(`${api}/api/v1/posters/${encodeURIComponent(id)}`, {
      cache: "no-store",
    }),
    fetch(`${api}${SPECIES_URL}`, { cache: "no-store" }),
  ]);
  if (!posterRes.ok || !catalogRes.ok) notFound();
  const { state: raw } = (await posterRes.json()) as { state: unknown };
  const list = decodeCompact((await catalogRes.json()) as ApiCompact);

  const views = new Map<string, SpeciesView>(
    list.species.map((s) => [s.id, toView(s)]),
  );
  const catalog = viewLookup(views);
  const state = sanitize(raw, {
    catalog,
    styles: STYLE_IDS,
    backgrounds: BACKGROUND_IDS,
  });
  if (!state) notFound();

  return (
    <div className="relative" style={{ width }} data-render-root>
      <Poster state={state} species={views} catalog={catalog} print />
      {kind === "preview" && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ containerType: "inline-size" }}
          data-watermark
        >
          <div
            className="absolute -inset-1/2 flex flex-wrap content-center justify-center gap-[6cqw] font-sans font-semibold whitespace-nowrap"
            style={{
              transform: "rotate(-30deg)",
              fontSize: "4cqw",
              color: "rgb(30 27 22 / 0.13)",
            }}
          >
            {Array.from({ length: 60 }, (_, i) => (
              <span key={i}>animarka preview</span>
            ))}
          </div>
        </div>
      )}
      <RenderReady />
    </div>
  );
}

export default function RenderPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  return (
    <Suspense fallback={null}>
      <Render {...props} />
    </Suspense>
  );
}
