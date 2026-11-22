import type { ApiPreset, ApiSpeciesList } from "./api";
import { buildCatalog } from "./client";
import { encodeCompact } from "./compact";
import raw from "./fixture/catalog.json";

/**
 * A slice of the real catalog, for unit tests and the design pages. Built by
 * scripts/make_web_fixture.py from a running API, in the full form; it goes through the same
 * compact encoding the app reads, so tests exercise the real decoder. The Playwright mocks serve
 * the same file.
 */
const file = raw as unknown as {
  species: ApiSpeciesList;
  presets: ApiPreset[];
};
export const FIXTURE = buildCatalog({
  species: encodeCompact(file.species),
  presets: file.presets,
});
