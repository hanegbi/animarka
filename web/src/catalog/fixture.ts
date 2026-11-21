import { buildCatalog, type CatalogRaw } from "./client";
import raw from "./fixture/catalog.json";

/**
 * A slice of the real catalog, for unit tests and the design pages. Built by
 * scripts/make_web_fixture.py from a running API. The Playwright mocks serve the same file.
 */
export const FIXTURE = buildCatalog(raw as unknown as CatalogRaw);
