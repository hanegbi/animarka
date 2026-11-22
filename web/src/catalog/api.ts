/** Wire types of the catalog API, see docs/PLAN.md, API contract. */

import type { Faces } from "@/poster/state/types";

export type ApiArt = {
  thumb: string;
  medium: string;
  w: number;
  h: number;
  faces: Faces;
  /** False while faces is the M2 default, before the vision step. */
  facesKnown: boolean;
};

export type ApiSpecies = {
  id: string;
  sci: string;
  names: Partial<Record<string, string>>;
  family: string;
  familySci: string;
  order: string;
  seq: number;
  massG: number;
  massEstimated: boolean;
  art: Record<string, ApiArt>;
};

export type ApiSpeciesList = {
  catalog: string;
  count: number;
  species: ApiSpecies[];
};

export type ApiPreset = {
  id: string;
  title: string;
  description: string;
  ids: string[];
};

export const CATALOG_ID = "birds";
/** The compact form: one short row per bird, decoded by compact.ts. */
export const SPECIES_URL = `/api/v1/catalogs/${CATALOG_ID}/species?lang=en,he&format=compact`;
export const PRESETS_URL = `/api/v1/catalogs/${CATALOG_ID}/presets`;
