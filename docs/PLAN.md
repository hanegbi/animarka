# animarka build plan

## Context

animarka is a web app where a visitor builds a wildlife poster: pick birds, arrange them, switch art style, export a print ready file. It is also a portfolio project for backend and AI infrastructure roles, so the async pipeline, queues and deployment are goals in themselves.

The repo holds only `README.md` and `prototype/animarka_prototype.html` (untracked). Everything is built from zero. The PRD (`docs/PRD.md`) is the source of truth for scope. This plan is written so a different model can execute it without the planning conversation.

**Context rule:** `docs/PRD.md`, `docs/PLAN.md` and `docs/DECISIONS.md` are the only context a task may rely on. Task M0.1 is done. Start at M0.2.

**Already done ahead of order:** task M1.1 (fetch art). `web/public/art/{fg,wb}/` holds 236 WebP files and `web/src/catalog/static-m1.ts` holds the 118 species with art sizes and `faces`. Nothing was missing. All 29 `WB_FLIP` woodblock birds were checked by eye and face right. So `web/` is not empty: in M0.2 scaffold Next.js in a way that keeps these files (for example scaffold in a temp folder and move it in). Note for M3: several woodblock owls look straight ahead, so expect `front` for them.

## What the prototype tells us

Read from `prototype/animarka_prototype.html` (471 lines, vanilla JS):

- Data: `RAW` holds 118 birds as `[slug, common name, scientific name, family, mass_g]`. `STARTER` is the 12 bird opening poster. `WB_FLIP` lists the woodblock birds that face right.
- State: `{view, order, title, titleAuto, seed, labels, style, flip, bg, layout}`. Undo keeps snapshots of everything except `view`.
- Mirror rule: `mirrored = userFlip XOR (style is woodblock AND bird in WB_FLIP)`.
- Size rule: `scale = clamp(0.72 + 0.2 * (log10(mass) - 1), 0.72, 1.35)`.
- Layout: one function, `renderGrid`. It tries 2 to 16 columns and keeps the count that gives the largest base size. Scatter adds seeded jitter (FNV hash of id, seed and index). "ring" places birds on up to 7 concentric ellipses.
- It already has a phone bottom sheet with three heights, undo and redo, three layouts and eight backgrounds.

Gaps the rebuild must close:

1. **Layout is not pure.** `fitInside` measures the DOM and nudges birds back inside the frame after render. The new layout must be pure math, so it needs each artwork's aspect ratio as input and fixed label boxes.
2. **Centerpiece is not a centerpiece.** The "ring" layout does not put the largest animal in the middle. The PRD requires it.
3. **Backgrounds are CSS gradients**, not images. The PRD wants three real image backgrounds that print at full resolution.
4. **Images are missing.** The prototype loads `fg/<slug>.webp` and `wb/<slug>.webp`. Those folders are not in the repo.
5. No poster size options, no presets, no virtualized list, no share, no export.

## Decisions so far (goes into `docs/DECISIONS.md`)

Made by the owner during planning:

| # | Decision | Choice |
|---|---|---|
| 1 | Print render engine | Headless Chromium. The Celery render task uses Playwright for Python to open a hidden print route of the web app at print size. One layout code path. |
| 2 | Low resolution source art (about 700 x 1070 px field guide, about 520 x 810 px woodblock) | AI upscale in the pipeline. A new `upscale` queue in M3 makes a 4x print master per artwork, with a quality review step. |
| 3 | Images for M1 | A fetch script downloads the 118 x 2 files, trims, converts to WebP. Results are committed under `web/public/art/`. Replaced by ingest in M2. |
| 4 | Hebrew | M1 is RTL ready (logical CSS, `lang` in state, RTL test with sample names). The language switch ships in M2. |

Technical calls made by the planner (owner can overrule):

| # | Call | Reason |
|---|---|---|
| T1 | pnpm for `web/`, uv workspace for Python (`api/`, `workers/`) | Fast, lockfiles, one command each. |
| T2 | Shared Python package `animarka_core` (settings, models, storage, queue names) lives in `api/src/animarka_core` and `workers/` depends on it through the uv workspace | API and workers need the same models. |
| T3 | Poster state is a pure reducer in TypeScript, wrapped in a Zustand store, with past and future stacks for undo | Reducers are unit testable and the same state JSON goes to the server. |
| T4 | The whole catalog (1,161 species, about 40 KB gzipped) is sent in one cached response and searched in the browser | Meets the 100 ms feedback rule. No search endpoint needed in v1. |
| T5 | Layout units are percent of poster width. Layout functions take aspect ratios and never touch the DOM | Same result at 390 px and at 7200 px. |
| T6 | Label text gets a fixed box (names: up to 2 lines, then ellipsis) that the layout reserves | Removes the need for `fitInside`. |
| T7 | Centerpiece: the heaviest species is the center by default. Dragging a bird onto the center makes it the new center (`state.center`) | The PRD says "largest". Users will still want to choose. |
| T8 | Job progress reaches the browser by Server Sent Events from the API, which reads Redis | Simpler than WebSockets, works through proxies. |
| T9 | No accounts. The admin review page is protected by one token from an env var | Matches the non goals. |
| T10 | Download link in the receipt uses the Lemon Squeezy `receipt_link_url` checkout option, so no email provider is needed. Verify in the Lemon Squeezy docs at M5 | Fewer moving parts. |
| T11 | gitleaks runs in CI | The owner's rule: never commit secrets. |

## Repo structure

```
web/            Next.js App Router, TypeScript strict, Tailwind, shadcn/ui
  src/app/                  routes: / (builder), /p/[id] (shared poster), /render/[id] (print), /admin/review, /design/* (dev only samples)
  src/poster/state/         types.ts, reducer.ts, history.ts, store.ts, storage.ts
  src/poster/layout/        types.ts, sizing.ts, scatter.ts, grid.ts, centerpiece.ts, legend.ts, clamp.ts, index.ts
  src/poster/components/    Poster.tsx, Animal.tsx, Legend.tsx, PosterTitle.tsx
  src/picker/               search, family chips, species list, tray
  src/controls/             style, labels, layout buttons, background, size, undo, shuffle
  src/catalog/              types.ts, client.ts, static-m1.ts
  src/components/ui/        components installed from 21st.dev through the shadcn CLI
  public/art/{fg,wb}/       M1 images. public/backgrounds/  the three background images
  e2e/                      Playwright tests
api/            FastAPI
  src/animarka_core/        settings.py, db.py, models.py, storage.py, queues.py, hashing.py
  src/animarka_api/         main.py, routers/{catalog,posters,renders,jobs,checkout,webhooks,reports,admin}.py, schemas.py, payments/{base,lemonsqueezy}.py
  alembic/  tests/
workers/        Celery
  src/animarka_workers/     app.py, tasks/{ingest,facing,upscale,render,generate}.py, graphs/{facing,generation}.py, progress.py
  tests/
infra/
  compose/docker-compose.yml, compose/*.Dockerfile
  k8s/ (Helm chart or kustomize), keda/, grafana/, prometheus/
scripts/        make_web_fixture.py, make_backgrounds.py, loadtest/
docs/           PRD.md, PLAN.md, DECISIONS.md, design/ (screenshots of option rounds)
prototype/      animarka_prototype.html (kept as reference)
.github/workflows/ci.yml
```

## Poster state (version 1)

```ts
type PosterState = {
  v: 1
  catalog: "birds"
  order: string[]                 // species slugs, poster order
  flip: Record<string, true>      // user mirrors
  center?: string                 // centerpiece override
  seed: number
  title: string
  titleAuto: boolean
  labels: "names" | "legend" | "none"
  lang: "en" | "he"
  style: string                   // styles.id, "fg" or "wb"
  bg: string                      // backgrounds.id
  layout: "scatter" | "grid" | "centerpiece"
  size: string                    // "3:4", "2:3", "4:5", "a"
  orientation: "portrait" | "landscape"
}
```

`view` and search text are UI state, not poster state. The state hash is SHA 256 of the canonical JSON (sorted keys).

## Layout interface

```ts
type LayoutInput = {
  animals: { id: string; massG: number; aspect: number }[]   // aspect = width / height of the trimmed art in the current style box
  frameAspect: number            // poster width / height
  labels: "names" | "legend" | "none"
  seed: number
  center?: string
}
type Placed = { id: string; cx: number; cy: number; w: number; h: number; label?: Box; number?: Box }
type LayoutResult = { items: Placed[]; nameFont: number; title: Box; legend?: { box: Box; cols: number; font: number } }
type LayoutFn = (input: LayoutInput) => LayoutResult
```

Rules every layout must pass (property test over 1 to 150 animals, 3 layouts, 3 label modes, every poster aspect): every art box and label box is inside the safe frame, none overlaps the title box or the legend box, output is identical for identical input.

One box size per species for both styles: the box aspect is the mean of the two styles' aspects and art is fitted with `object-fit: contain`. This keeps place and size identical on style switch.

## Data model

- `catalogs` (id, name)
- `species` (id slug, catalog_id, scientific_name, order, family, family_english, mass_g, names jsonb by language)
- `styles` (id, name, source_url, license, attribution)
- `artworks` (id, species_id, style_id, pose, image_key, thumb_key, medium_key, print_key, width, height, faces, faces_confidence, faces_source model or human or manual, status). Unique on (species_id, style_id, pose).
- `backgrounds` (id, name, kind color or image, value, image_key, is_dark, sort)
- `presets` (id, catalog_id, title, species_ids array, sort)
- `posters` (id short, state jsonb, state_hash, created_at)
- `jobs` (id, type, status, progress, input_hash, result_key, error, created_at, updated_at). Unique on (type, input_hash) for cache hits.
- `orders` (id, poster_id, provider, provider_order_id, status, email, download_token, job_id, created_at)
- `reports` (id, species_id, style_id, note, created_at)

## API contract (prefix `/api/v1`)

| Method and path | Purpose |
|---|---|
| GET `/catalogs/{id}/species` | All species with names (`?lang=en,he`), family, mass, and per style: thumb and medium URL, aspect, faces. ETag and long cache. |
| GET `/catalogs/{id}/families` | Families with counts. |
| GET `/styles`, GET `/backgrounds`, GET `/catalogs/{id}/presets` | Data driven options. |
| POST `/posters` body `{state}` returns `{id, url}`. GET `/posters/{id}` returns `{state}` | Share links. Same state hash returns the same id. |
| POST `/renders` body `{poster_id, kind: preview or print, size, bleed, formats}` returns `{job_id}` | Print requires a paid order token. Cache hit returns a finished job. |
| GET `/jobs/{id}`, GET `/jobs/{id}/events` (SSE) | Status, progress, result URL. |
| POST `/checkout` body `{poster_id, size, bleed}` returns `{checkout_url}` | Through the payment interface. |
| POST `/webhooks/lemonsqueezy` | Signature check, mark order paid, queue the render. Idempotent. |
| GET `/orders/{token}` | Download page data: status, job, file links. |
| POST `/reports` | "Report a wrong bird". |
| GET `/admin/review/facing`, POST `/admin/artworks/{id}/faces`, same for upscale review | Token protected. |
| GET `/files/{key}` | Files from the storage interface (local disk now). Keys hold a content hash, so a year of cache. |
| GET `/healthz`, GET `/metrics` | Ops. |

## Design decisions to bring with the rule of five

Procedure for every round (a task type called "design round"): search 21st.dev through the 21st MCP tools, shortlist real components ranked by accessibility, mobile behavior, bundle weight, code quality, then looks. Build the five options as a dev only page under `web/src/app/design/<round>/` so they are real rendered samples, screenshot at 390 px and 1280 px into `docs/design/`, and present five options each with: short name, two lines on look and behavior, the 21st.dev link, one strength, one weakness, and one marked recommendation with a one sentence reason. Wait for the owner's choice. Record it in `docs/DECISIONS.md`. Then install the chosen one with the shadcn CLI and adapt it to the design tokens with no hardcoded colors. Never install two components for one job.

| Round | Milestone | Decisions in the round |
|---|---|---|
| R1 | M0 | Color theme (the five PRD directions A to E, each pair checked for AA contrast first), type pairing (five pairs, free for commercial use, embeddable in PDF), radius and shadow tokens |
| R2 | M0 | Page layout: desktop app shell and header, phone pattern and bottom sheet component |
| R3 | M1 | Picker: search input and results, family chips with counts, species toggle chip and virtualized list, selected tray |
| R4 | M1 | Controls: segmented control for style and labels, the three layout buttons with circle icons, background picker, size picker |
| R5 | M1 | Motion (reflow, mirror flip, sheet), drag and drop approach (dnd-kit, pointer events, and three more), toasts, tooltips, empty and loading states |
| R6 | M4 | Export dialog with job progress, share control, download page |
| R7 | M4 | Landing section above the tool |

The admin review page reuses already chosen components and gets no round.

## Milestones and tasks

Rules for the coding model:
- Do tasks in order. After each task run its check, then commit and push to `master` with a clear message. No branches, no pull requests. Never ask before committing or pushing.
- At the end of each milestone run the milestone checks, show the owner the result, and wait for a go.
- If the PRD is silent or conflicts with the prototype, stop and ask.
- UI copy and docs: plain short sentences, sentence case, no em dashes, no hyphens as punctuation.
- Never write an API key or secret into any file.

### M0. Repo, tooling, compose, CI, design decisions

| Task | Files | Behavior | Check |
|---|---|---|---|
| M0.1 Docs and hygiene | `docs/PRD.md`, `docs/PLAN.md`, `docs/DECISIONS.md`, `.gitignore`, `.gitattributes`, `.editorconfig`, `README.md` | Save the PRD without the API key line. Copy this plan. Write decisions. Fix `README.md` encoding (it is UTF 16 now) and give it a short run guide. Track `prototype/`. | No API key in any tracked file. Pushed to `origin/master`. |
| M0.2 Web scaffold | `web/*` | Next.js App Router, TypeScript strict, Tailwind, shadcn init, ESLint, Prettier, Vitest, Playwright with two projects (390 px and 1280 px). Home page shows the name and tagline only. | `pnpm -C web lint typecheck test build` and `pnpm -C web e2e` pass. |
| M0.3 Python workspace and API scaffold | root `pyproject.toml` (uv workspace), `api/*` | FastAPI app with `/healthz`, settings from env, SQLAlchemy async engine, Alembic with an empty first migration, ruff, mypy, pytest. | `uv run pytest api` passes. `/healthz` returns 200. |
| M0.4 Workers scaffold | `workers/*` | Celery app wired to RabbitMQ and Redis, queues `ingest`, `vision`, `upscale`, `render`, `generate` declared with dead letter exchanges, one `ping` task. | Unit test runs `ping` in eager mode. |
| M0.5 Docker Compose | `infra/compose/docker-compose.yml`, Dockerfiles, `.env.example` | Services: web, api, worker, db (Postgres), redis, rabbitmq (management UI), flower. Health checks. Hot reload for web and api. | `docker compose up` brings all up healthy. `curl` to web and `/healthz` works. `ping` task round trips through RabbitMQ. |
| M0.6 CI | `.github/workflows/ci.yml` | Jobs: web lint, typecheck, unit, Playwright. Python ruff, mypy, pytest. Docker image builds. gitleaks. | CI is green on `master`. |
| M0.7 Design round R1 | `web/src/app/design/themes/*`, `docs/design/r1/*` | Five themes and five type pairings rendered on a mock builder screen with a sample poster. Contrast table for every text and accent pair. | Owner picks. Recorded in decisions. |
| M0.8 Design round R2 | `web/src/app/design/shell/*`, `docs/design/r2/*` | Five app shell and phone sheet options. | Owner picks. Recorded. |
| M0.9 Tokens | `web/src/app/globals.css`, `web/src/styles/tokens.css`, font setup | Chosen theme as CSS variables in the shadcn token format, light and dark. Chosen fonts self hosted through `next/font`. | Sample page uses only tokens. `grep` finds no hex colors outside the token file and poster background data. |

Milestone check: `docker compose up` runs web, api, db, redis, rabbitmq. CI green. Theme and shell chosen.

### M1. Poster builder with the 118 prototype birds (frontend only)

| Task | Files | Behavior | Check |
|---|---|---|---|
| M1.1 Fetch art | `scripts/fetch_m1_art.py`, `web/public/art/{fg,wb}/*.webp`, `web/src/catalog/static-m1.ts`, `web/public/art/ATTRIBUTION.md` | Read the 118 rows of `RAW` from the prototype. Field guide: find each species in `data/species.json` of `alchaincyf/huashu-bird-sticker` to get order and family, download `stickers/<Order>/<Family>/<Genus_species>.webp`. Woodblock: download `avian/assets/illustrations/<genus-species>.png` from branch `HABirdDashboard` of `adamoberley/HABirdDashboard` (the file without the `-2` suffix). Trim transparent borders, write WebP at max 640 px long edge. Generate `static-m1.ts` with slug, names, family, mass, per style width, height and `faces` (field guide all `left`, woodblock `right` if in `WB_FLIP` else `left`). | 236 files exist. Script prints a table of missing files (expected none). Owner or model eyeballs 10 `WB_FLIP` birds to confirm they face right. If not, stop and ask. |
| M1.2 State | `web/src/poster/state/*` | `PosterState` as above. Reducer actions: toggle, addMany, removeMany, replaceWith, clear, surprise, swap, move, mirror, shuffle, setStyle, setLabels, setLayout, setBg, setSize, setOrientation, setTitle, setCenter, load. Title follows the selection while `titleAuto` is true (one family gives the family name, else "Birds"). History of at least 20 steps, title edits coalesced into one step. Autosave to localStorage with validation on load. | Vitest covers every action, undo and redo, mirror XOR rule, bad saved data. |
| M1.3 Layout core | `web/src/poster/layout/{types,sizing,legend,clamp}.ts` | Interface above. `sizing` ports the prototype mass scale. `legend` ports the 3 to 5 column rule and type shrink. `clamp` moves any box inside the safe frame and away from title and legend, pure math. | Unit tests against values taken from the prototype formulas. |
| M1.4 Scatter and grid | `scatter.ts`, `grid.ts` | Port the column search from `renderGrid`. Scatter keeps the seeded jitter and row stagger. Grid has no jitter and centers the last row. | Property test (see layout rules) passes for both. |
| M1.5 Centerpiece | `centerpiece.ts` | Center animal (heaviest or `state.center`) takes a large box in the middle of the free area. Others go on concentric ellipses around it, reusing the prototype ring search for ring count and size. Works for 1 and 2 animals. | Property test passes. Snapshot of positions for 1, 2, 12, 60, 150. |
| M1.6 Poster component | `web/src/poster/components/*` | Renders a `LayoutResult` with absolutely placed elements in container query units. Poster sizes 3:4, 2:3, 4:5, A series, each in portrait and landscape. Background from data with `is_dark` switching ink color. Names, numbers with legend, or no text. `dir="rtl"` when `lang` is `he`. Alt text from species names. | Playwright: every animal box inside the poster frame for 1 and 150 animals, all layouts, all label modes, both viewports. RTL case with sample Hebrew names. |
| M1.7 Backgrounds | `web/public/backgrounds/*`, `web/src/catalog/backgrounds.ts` | Five solid colors and three image backgrounds: "Aged paper", "Morning sky", "Forest". Create the images as original files at least 3600 px on the long edge (generated procedurally by a script or drawn as SVG, no third party art), with web sized copies. | Visual check by owner. Labels readable on all eight (contrast test in Playwright with axe). |
| M1.8 Design rounds R3, R4, R5 | `web/src/app/design/*`, `docs/design/r3..r5/*` | As in the rounds table. | Owner picks. Recorded. Components installed. |
| M1.9 Picker | `web/src/picker/*` | Search by common name, scientific name and family, updating as you type. Family chips with on poster counts that only filter. Toggle chips with lazy thumbnails in a virtualized list. "Add all N", "Remove these N", "Only this family", "Only these N". Tray with "14 birds from 5 families" and tap to remove. "Surprise mix" (12 to 16), "Clear poster". Presets read from a data file. | Playwright: add, remove, only this family, add all, search, presets. |
| M1.10 Controls | `web/src/controls/*` | Style switch, labels, three layout buttons with circle icons plus text label and accessible name, background, size and orientation, undo, redo, shuffle, editable title. | Playwright: style switch keeps each animal's box position and facing direction. Layout switch keeps order and mirrors. |
| M1.11 Interactions and motion | `Animal.tsx`, chosen drag and drop approach | Tap mirrors. Drag onto another animal swaps. Enter or Space mirrors. Arrow keys move through the order. Animals ease to new positions in about 200 ms. Mirror is a quick flip. Reduced motion is respected. Ctrl Z and Ctrl Shift Z. | Playwright with mouse and touch: swap, mirror, keyboard path. |
| M1.12 Shell | `web/src/app/page.tsx`, shell components | Desktop: picker left, poster center, controls right or top as chosen in R2. Phone: poster on top always in view, picker and controls in a bottom sheet with peek, half and full. Footer with attribution for both art sources and "report a wrong bird" as a mail link for now. | Playwright at 390 px: poster stays visible at every sheet height. axe has no serious issues. Touch targets at least 44 px. |
| M1.13 Budget | `web/next.config.*`, CI | Lighthouse CI or a bundle size check: under 300 KB before images. | Check passes in CI. |

Milestone check: full parity with the prototype plus sheet, undo, three layouts, backgrounds. Playwright green at 390 px and 1280 px.

### M2. Catalog backend

| Task | Files | Behavior | Check |
|---|---|---|---|
| M2.1 Models and migration | `animarka_core/models.py`, `alembic/versions/*` | Tables from the data model. Seed styles, backgrounds, presets from data files. | Migration up and down in a test. |
| M2.2 Storage interface | `animarka_core/storage.py` | `put`, `get`, `url`, `exists` with a local disk backend on a compose volume. | Unit tests. |
| M2.3 Ingest tasks | `workers/tasks/ingest.py` | On the `ingest` queue: shallow clone or tarball both repos at pinned commits, parse `species.json`, match by slug `genus-species`, keep species present in both sets, trim, write thumb, medium and original, upsert rows. Chunked with a parent job reporting progress to Redis. Idempotent: a rerun changes nothing. | Worker tests on a 20 species fixture for idempotency and retry. Full run reports the matched count. If it is not 1,161, record the real number in decisions and tell the owner. |
| M2.4 Catalog API | `routers/catalog.py`, `routers/reports.py`, `schemas.py` | Endpoints from the contract with ETag. | API tests for every endpoint. |
| M2.5 Presets | `api/data/presets.json` | "Birds of Israel", "Owls of the world", "Garden birds of North America" and a few more, as data. Lists drafted by the model, reviewed by the owner. | API returns them. Every slug exists in the catalog. |
| M2.6 Web on the API | `web/src/catalog/client.ts`, picker | Load the catalog from the API, cache it, fall back gracefully on error. Virtualized list holds 1,161 species smoothly. Hebrew language switch and Hebrew names. Remove `static-m1.ts` and the committed M1 art. | Playwright against compose. Search answers in under 100 ms in a perf test. |

Until M3 fills `faces`, woodblock artworks outside the old `WB_FLIP` list default to `left`. Known and accepted for M2.

### M3. Async pipeline

| Task | Files | Behavior | Check |
|---|---|---|---|
| M3.1 Job framework | `workers/progress.py`, `animarka_core/queues.py`, `routers/jobs.py` | Base task with idempotency key, retry with backoff, dead letter queue, progress in Redis, row in `jobs`. SSE endpoint. Prometheus metrics. | Tests: retry, dead letter, duplicate delivery does no double work. |
| M3.2 Facing graph | `workers/graphs/facing.py`, `tasks/facing.py` | LangGraph: load image, ask the vision model "left, right or front" with confidence, ask again on the mirrored image and expect the opposite answer, accept if both agree and confidence is high, else send to review. Budget guard that stops at the monthly cap. | Graph tests with a fake model. Accuracy against the 118 hand labeled birds reported before the full run. |
| M3.3 Review page | `web/src/app/admin/review/*`, `routers/admin.py` | Token protected. Shows queued artworks large, three buttons, keyboard shortcuts. | Playwright happy path. |
| M3.4 Full facing run | none | Run on all artworks, clear the review queue. | Every artwork has `faces`. Playwright style switch test passes on a random sample of 100 species. |
| M3.5 Upscale | `tasks/upscale.py` | On the `upscale` queue: 4x print master per artwork with an open upscale model, alpha preserved, stored as `print_key`. Automatic check (size, alpha edge, similarity to the source when scaled back down) and a sampled human review in the admin page. | Tests on fixtures. Owner approves 20 side by side samples before the full run. |

### M4. Share and export

| Task | Files | Behavior | Check |
|---|---|---|---|
| M4.1 Share | `routers/posters.py`, `web/src/app/p/[id]/page.tsx` | Save state under a short id, reopen by URL, copy link control. | API and Playwright tests. |
| M4.2 Print route | `web/src/app/render/[id]/page.tsx` | Chrome free page that draws only the poster at a requested pixel size with print masters, bleed and optional watermark. Signals ready when fonts and images are loaded. Only reachable with a signed token. | Playwright: route matches the builder poster. |
| M4.3 Render task | `tasks/render.py`, worker Dockerfile with Chromium | On the `render` queue: Playwright for Python opens the print route, writes PNG and PDF (fonts embedded) to storage, reports progress. Preview is watermarked at 1600 px long edge. Print is 300 DPI for 18x24 in, 12x16 in, A2, A3. Cached by state hash plus options. | Pixel comparison test: print render scaled down against the browser poster, within a small threshold. Worker tests for idempotency and retry. |
| M4.4 Design rounds R6, R7 | `web/src/app/design/*` | Export dialog, share control, landing section. | Owner picks. |
| M4.5 Export UI and landing | `web/src/export/*`, landing section | Dialog with size and bleed, live progress over SSE, download link. Attribution on the export page. Landing section above the tool. | Playwright end to end for the free preview. |

### M5. Payments

| Task | Files | Behavior | Check |
|---|---|---|---|
| M5.1 Payment interface | `payments/base.py`, `payments/lemonsqueezy.py` | `create_checkout`, `verify_webhook`, `parse_event`. Lemon Squeezy implementation plus a fake for tests. | Unit tests. |
| M5.2 Checkout and webhook | `routers/checkout.py`, `routers/webhooks.py` | Create order, redirect to checkout, on paid webhook queue the print render. Webhook is idempotent and signature checked. Receipt link points to the download page. | API tests with signed fixtures. Test mode purchase end to end. |
| M5.3 Download page | `web/src/app/orders/[token]/page.tsx` | Shows progress, then PDF and PNG links. | Playwright with the fake provider. |

Blocker before real charging: written permission for commercial use of the woodblock set (see open questions).

### M6. Deploy and observe

| Task | Files | Behavior | Check |
|---|---|---|---|
| M6.1 k3s manifests | `infra/k8s/*` | Deployments for web, api, one worker deployment per queue, Postgres, Redis, RabbitMQ, ingress with TLS, secrets from the cluster. | Deployed and reachable. |
| M6.2 KEDA | `infra/keda/*` | ScaledObject per worker on RabbitMQ queue length, render workers scale to zero. | `kubectl get hpa` shows scaling under load. |
| M6.3 Observability | `infra/prometheus/*`, `infra/grafana/*` | Prometheus scrape, Grafana dashboards for queue depth, worker count, job duration, error rate. Structured JSON logs. Flower. | Dashboards show live data. |
| M6.4 Load test | `scripts/loadtest/*`, `docs/LOADTEST.md` | Queue 200 render jobs, record workers scaling up and back down, write the report with Grafana screenshots. | Report committed. |
| M6.5 Deploy in CI | `.github/workflows/deploy.yml` | Build and push images, roll out on push to `master`. | A commit reaches production. |

### M7. Mammals and AI generation

| Task | Files | Behavior | Check |
|---|---|---|---|
| M7.1 Mammal catalog | data, ingest | Second catalog with the same data shape. Catalog switch in the picker. | API and Playwright tests. |
| M7.2 Generation graph | `workers/graphs/generation.py`, `tasks/generate.py` | LangGraph on the `generate` queue: validate species, gather reference, generate, remove background, quality check, human approve, publish. Never accepts free user text. | Graph tests with fakes. |
| M7.3 Approval page | admin | Approve or reject generated art. | Playwright happy path. |

M7 needs its own short planning pass once M6 is done, since it depends on model choices not yet made.

## Risks

| Risk | Effect | Handling |
|---|---|---|
| Woodblock art began in a non commercial project | Selling files with it may not be allowed | Owner asks the authors before M5. Fallback: paid export only in field guide style. |
| Source art is small | Soft prints | Upscale queue (decision 2), reviewed samples, proof prints at M4. |
| Chromium renders are heavy | Slow jobs, large image, memory spikes at A2 | One render per worker process, memory limits, KEDA scaling, cache by hash. |
| The woodblock pose the prototype used is unknown | `WB_FLIP` may not match the downloaded files | Visual check in M1.1, stop and ask on mismatch. |
| The 1,161 overlap is unverified | Catalog size differs | M2.3 reports the real count. |
| Both art sets are AI made and may show wrong birds | Trust | Report link per species, `reports` table, status flag on artworks. |
| Source repos change or vanish | Ingest breaks | Pin commits, keep originals in storage. |
| Vision model cost | Budget | About 4,650 small image calls for the full facing run. Budget guard in M3.2. |
| The handoff between models loses context | Wrong assumptions | Everything lives in `docs/PRD.md`, `docs/PLAN.md`, `docs/DECISIONS.md`. Tasks say "stop and ask" where a choice is open. |

## Open questions for the owner

Not needed to start. Each is needed by the milestone shown.

1. Vision model and monthly budget cap for facing detection (M3). Suggestion: Claude Haiku 5.5 for both passes, cap of 20 USD.
2. Where the upscale model runs: CPU in the worker, or a rented GPU for a one time batch (M3).
3. Admin access: is one shared token enough (M3).
4. Price for the print ready file, and whether price depends on size (M5).
5. Commercial permission for the woodblock set (before M5).
6. Hosting for k3s: single VPS or managed cluster (M6). Suggestion: one VPS with 8 GB RAM, since Chromium renders need memory.
7. Domain (M6).
8. Which print sizes to offer at launch beyond 18x24 in, 12x16 in, A2, A3 (M4).

## Verification

- M0: `docker compose -f infra/compose/docker-compose.yml up` shows all services healthy. CI green on GitHub. Owner has chosen theme and shell.
- M1: `pnpm -C web test` (layout property tests, reducers, mirror logic) and `pnpm -C web e2e` (both viewports) pass. Owner opens the app on a phone and compares with the prototype.
- M2 onward: `uv run pytest`, Playwright against compose, and the milestone checks listed in each table.
- Every milestone ends with a short demo to the owner and a wait for go.
