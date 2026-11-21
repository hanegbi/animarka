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
| R1 | 2026-11-21 | Color theme | A. Field guide (light). B. Museum night is its dark mode | https://21st.dev/community/themes/vintage-paper (reference only) | Matches the prototype and passes AA. Adjusted accent shades are used only where a PRD accent fails (not needed for A) |
| R1 | 2026-11-21 | Type pairing | 1. Fraunces (titles) and Inter (interface). Hebrew: Frank Ruhl Libre and Heebo | Google Fonts, OFL | Warm headings, clean small text. Subset Fraunces to keep the file small |
| R2 | 2026-11-21 | Desktop shell | S2. Picker left, all style controls in one toolbar above the poster | https://21st.dev/@isaiahbjork/components/app-dashboard-shell | Largest poster. Known weakness: the toolbar crowds under about 1100 px, so below that width it must wrap or move into the picker column. Decide the narrow desktop behavior in M1.12 |
| R2 | 2026-11-21 | Phone pattern | P3. Bottom tab bar (Birds, Layout, Style, Export). A tab opens a short sheet above the bar | https://21st.dev/@coss.com/components/drawer | Thumb friendly. Known weakness: the sheet must stay short so the poster stays in view, and switching tabs takes one tap |
| R2 | 2026-11-21 | Corner radius | R3. Soft. About 7, 10, 12 and 17 px (shadcn `--radius` 0.75rem) | https://ui.shadcn.com/docs/theming | Friendly, echoes the bird shapes |
| R2 | 2026-11-21 | Shadow | D2. Whisper. `0 1px 2px` and `0 4px 14px` | https://ui.shadcn.com/docs/theming | Quiet, lets the art carry the page |

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

## Working preferences

- Design rounds must be shown at desktop size first, then phone. Screenshots at 1280 px or wider, with options side by side where possible. (Owner, 2026-11-21)
