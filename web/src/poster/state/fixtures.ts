import type { CatalogLookup, Faces, PosterContext } from "./types";

/** Small fake catalog for tests. */
export const FAKE_BIRDS: Record<
  string,
  { family: string; fg?: Faces; wb?: Faces }
> = {
  a: { family: "Owls" },
  b: { family: "Owls" },
  c: { family: "Owls" },
  d: { family: "Ducks", wb: "right" },
  e: { family: "Herons", wb: "front" },
  f: { family: "Herons", wb: "right" },
};

export const fakeCatalog: CatalogLookup = {
  has: (id) => id in FAKE_BIRDS,
  family: (id) => FAKE_BIRDS[id]?.family ?? null,
  faces: (id, style) =>
    (style === "wb" ? FAKE_BIRDS[id]?.wb : FAKE_BIRDS[id]?.fg) ?? "left",
  ids: () => Object.keys(FAKE_BIRDS),
};

export const fakeCtx: PosterContext = {
  catalog: fakeCatalog,
  styles: ["fg", "wb"],
  backgrounds: ["cream", "night"],
};
