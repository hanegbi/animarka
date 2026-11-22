/**
 * The compact catalog form (`?format=compact`): about 11,000 birds as short rows, roughly a fifth
 * of the full form. Decoded once into the full form, so the rest of the app is unchanged. The
 * encoder exists for tests and mocks.
 */

import type { ApiArt, ApiSpecies, ApiSpeciesList } from "./api";

/** [width, height, hash, faces right (1) or left (0), faces known (1) or default (0)] */
export type CompactArt = [number, number, string, 0 | 1, 0 | 1];

/** [id, english, hebrew or 0, family index, mass g, mass estimated, field guide art, woodblock art] */
export type CompactRow = [
  string,
  string,
  string | 0,
  number,
  number,
  0 | 1,
  CompactArt | 0,
  CompactArt | 0,
];

export type ApiCompact = {
  v: 2;
  catalog: string;
  count: number;
  /** Prefix for image URLs, for example /api/v1/files/ */
  files: string;
  /** [scientific family, English family] */
  families: [string, string][];
  species: CompactRow[];
};

const STYLES = ["fg", "wb"] as const;

/** tyto-alba to Tyto alba. */
export function sciOf(id: string): string {
  const i = id.indexOf("-");
  if (i < 0) return id;
  return id[0].toUpperCase() + id.slice(1, i) + " " + id.slice(i + 1);
}

function art(files: string, style: string, id: string, a: CompactArt): ApiArt {
  const base = `${files}art/${style}/${id}/${a[2]}`;
  return {
    thumb: `${base}-200.webp`,
    medium: `${base}-640.webp`,
    w: a[0],
    h: a[1],
    faces: a[3] ? "right" : "left",
    facesKnown: a[4] === 1,
  };
}

export function decodeCompact(c: ApiCompact): ApiSpeciesList {
  const species: ApiSpecies[] = c.species.map((r, seq) => {
    const [id, en, he, fam, massG, est] = r;
    const names: Partial<Record<string, string>> = {};
    if (en) names.en = en;
    if (he) names.he = he;
    const arts: Record<string, ApiArt> = {};
    STYLES.forEach((style, k) => {
      const a = r[6 + k] as CompactArt | 0;
      if (a) arts[style] = art(c.files, style, id, a);
    });
    const [familySci, family] = c.families[fam] ?? ["", ""];
    return {
      id,
      sci: sciOf(id),
      names,
      family,
      familySci,
      order: "",
      seq,
      massG,
      massEstimated: est === 1,
      art: arts,
    };
  });
  return { catalog: c.catalog, count: c.count, species };
}

/** The hash part of an art URL: .../{hash}-640.webp */
function hashOf(url: string): string {
  return url.slice(url.lastIndexOf("/") + 1).replace(/-640\.webp$/, "");
}

/** For tests and mocks: the compact form of a full list. URLs must share one files prefix. */
export function encodeCompact(
  list: ApiSpeciesList,
  files = "/api/v1/files/",
): ApiCompact {
  const families: [string, string][] = [];
  const index = new Map<string, number>();
  const species: CompactRow[] = list.species.map((s) => {
    if (!index.has(s.familySci)) {
      index.set(s.familySci, families.length);
      families.push([s.familySci, s.family]);
    }
    const a = (style: string): CompactArt | 0 => {
      const x = s.art[style];
      return x
        ? [
            x.w,
            x.h,
            hashOf(x.medium),
            x.faces === "right" ? 1 : 0,
            x.facesKnown ? 1 : 0,
          ]
        : 0;
    };
    return [
      s.id,
      s.names.en ?? "",
      s.names.he ?? 0,
      index.get(s.familySci)!,
      s.massG,
      s.massEstimated ? 1 : 0,
      a("fg"),
      a("wb"),
    ];
  });
  return {
    v: 2,
    catalog: list.catalog,
    count: species.length,
    files,
    families,
    species,
  };
}
