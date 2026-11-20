# Decisions

Every choice that shapes the build is recorded here. Newest entries go at the bottom of each table. `docs/PRD.md` is the scope. `docs/PLAN.md` is the task list.

## Owner decisions

| # | Date | Decision | Choice | Notes |
|---|---|---|---|---|
| 1 | 2026-11-21 | Print render engine | Headless Chromium | The Celery render task uses Playwright for Python to open a hidden print route of the web app at print size. One layout code path, in TypeScript. Rejected: a Node renderer service, a Python port of the layout. |
| 2 | 2026-11-21 | Low resolution source art | AI upscale in the pipeline | Field guide files are about 700 x 1070 px. Woodblock files are about 520 x 810 px. A new `upscale` queue in M3 makes a 4x print master per artwork, with a quality review step. |
| 3 | 2026-11-21 | Images for M1 | Fetch script, commit web sizes | `scripts/fetch_m1_art.py` downloads the 118 birds in both styles, trims, converts to WebP. Results are committed under `web/public/art/`. The M2 ingest replaces them. |
| 4 | 2026-11-21 | Hebrew | RTL ready in M1, ship in M2 | M1 uses logical CSS, keeps `lang` in the poster state and has an RTL test with sample names. The language switch arrives in M2 with the full names. |

## Technical calls by the planner

The owner can overrule any of these.

| # | Call | Reason |
|---|---|---|
| T1 | pnpm for `web/`. uv workspace for Python (`api/`, `workers/`) | Fast, lockfiles, one command each. |
| T2 | Shared Python package `animarka_core` (settings, models, storage, queue names) lives in `api/src/animarka_core`. `workers/` depends on it through the uv workspace | API and workers need the same models. |
| T3 | Poster state is a pure reducer in TypeScript, wrapped in a Zustand store, with past and future stacks for undo | Reducers are unit testable and the same state JSON goes to the server. |
| T4 | The whole catalog is sent in one cached response and searched in the browser | Meets the 100 ms feedback rule. No search endpoint in version 1. |
| T5 | Layout units are percent of poster width. Layout functions take aspect ratios and never touch the DOM | Same result at 390 px and at 7200 px. |
| T6 | Label text gets a fixed box that the layout reserves. Names take up to 2 lines, then an ellipsis | Removes the DOM measuring step the prototype needs. |
| T7 | Centerpiece: the heaviest species is the center by default. Dragging a bird onto the center makes it the new center (`state.center`) | The PRD says "largest". Users will still want to choose. |
| T8 | Job progress reaches the browser by Server Sent Events from the API, which reads Redis | Simpler than WebSockets. |
| T9 | No accounts. The admin review page is protected by one token from an env var | Matches the non goals. |
| T10 | The download link in the receipt uses the Lemon Squeezy `receipt_link_url` checkout option. Verify in the Lemon Squeezy docs at M5 | No email provider needed. |
| T11 | gitleaks runs in CI | Never commit secrets. |

## Design decisions (rule of five)

Filled in as each round is answered. See the rounds table in `docs/PLAN.md`.

| Round | Date | Decision | Choice | Source link | Why |
|---|---|---|---|---|---|

## Open questions

| # | Question | Needed by | Suggestion |
|---|---|---|---|
| 1 | Vision model and monthly budget cap for facing detection | M3 | Claude Haiku 5.5 for both passes, cap of 20 USD |
| 2 | Where the upscale model runs: CPU in the worker or a rented GPU for a one time batch | M3 | |
| 3 | Is one shared admin token enough | M3 | Yes |
| 4 | Price for the print ready file, and whether it depends on size | M5 | |
| 5 | Commercial permission for the woodblock set | Before M5 | Ask the authors. Fallback: paid export in field guide style only |
| 6 | Hosting for k3s | M6 | One VPS with 8 GB RAM |
| 7 | Domain | M6 | |
| 8 | Print sizes at launch beyond 18x24 in, 12x16 in, A2, A3 | M4 | |
