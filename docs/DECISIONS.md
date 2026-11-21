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
| R3 | 2026-11-21 | Search input | S1. Inline field with search icon. The list below filters as you type, with a found count | https://21st.dev/@uiable/components/component-search | Simplest. The code is a plain shadcn input with an icon, built directly (not installed) |
| R3 | 2026-11-21 | Family filter | F1. Wrapping pills with a badge counting birds on the poster | https://21st.dev/@cnippet-dev/components/v-toggle-10 | Code retrieved and adapted: shadcn Toggle and Badge from the shadcn registry (base-ui), our tokens, single select instead of multi select |
| R3 | 2026-11-21 | Bird chip and list | C2. Picture cards, columns follow the width, check mark when on | https://21st.dev/@hero_ui/components/heroui-list-box | Owner choice over the recommended C1. Deviation: the 21st.dev component re-exports the whole HeroUI package, which breaks the bundle budget. Only the card look is built, in our code, with a virtualized listbox. Needs thumbnails from the M2 ingest, since the M1 art is 640 px |
| R3 | 2026-11-21 | Poster tray | T2. Thumbnail strip with a remove cross on each, names on hover and in the accessible name | https://21st.dev/@bundui/components/badge10 | Code retrieved and adapted. Densest, fits 150 birds |
| R4 | 2026-11-21 | Segmented control (design and labels) | G5. Cards with a preview: the same bird in each style, a bird with each label type | https://21st.dev/@mahmoudilyan/components/radio-card | Owner choice over the recommended G1. You see the result before you pick. Takes about 190 px of height |
| R4 | 2026-11-21 | Layout buttons | L5. Three circle icons with a text label under each, and a raised highlight that slides to the chosen layout | https://21st.dev/@pmalay694/components/radio-group | The highlight must jump instantly under reduced motion |
| R4 | 2026-11-21 | Background picker | B1. Eight round swatches in one row, the name of the chosen one below | https://21st.dev/@starc007/components/color-selector | Owner choice over the recommended B2. The three picture backgrounds show as small round crops |
| R4 | 2026-11-21 | Poster size | Z3. Text buttons: 3:4, 2:3, 4:5, A series | https://21st.dev/@shadcnspace/components/aspect-ratio-05 | Owner choice. No landscape switch: landscape is not offered in the interface. The layout engine and state keep landscape support, tested, but nothing in the UI sets it. Physical print sizes are chosen at export (M4) |
| R5 | 2026-11-21 | Motion | M1. Quick ease out, 200 ms, plain CSS. Mirror is a 180 ms flip. Reduced motion turns it off | https://21st.dev/@motiondotdev/components/motion-reorder-items (library route not taken) | Matches the PRD, no dependency |
| R5 | 2026-11-21 | Drag and drop | D1. dnd-kit. Drag one bird onto another to swap. Tap mirrors. Enter or Space mirrors and arrow keys move a bird, on our own key handler, because dnd-kit's keyboard sensor lifts with Space | https://21st.dev/@ebnsina/components/sortable | Tested for touch and screen readers |
| R5 | 2026-11-21 | Toasts | T1. Single toast with Undo, Sonner | https://21st.dev/@ghaerdi/components/toast | Used for destructive changes (clear, replace, remove) and later Link copied |
| R5 | 2026-11-21 | Tooltips | P1. Plain label, shadcn tooltip | https://21st.dev/@shadcn/components/tooltip | Owner choice over the recommended P2, so no shortcut hints or Latin name in tooltips |
| R5 | 2026-11-21 | Empty states | E1. Text and two buttons on the empty poster. The search miss uses the same pattern with suggestion chips | https://21st.dev/@serafimcloud/components/empty-state | |
| R5 | 2026-11-21 | Loading state | L2. Poster-shaped skeleton | https://21st.dev/@hero_ui/components/skeleton | No layout shift for the first poster |
| M1.12 | 2026-11-21 | Narrow desktop behavior (S2 weakness) | At 1100 px and wider: desktop shell, the toolbar wraps to a second row when needed. Below 1100 px, including tablets: the phone shell (P3) | | Decided by the planner, tested at 1100 and 1099 px. The toolbar never gets squeezed |
| M1.12 | 2026-11-21 | Phone tabs | Three tabs for now: Birds, Layout, Style. The sheet starts on Birds. The Export tab and the header Export button come in M4 with the export dialog | | P3 names four tabs. Adding a dead Export tab now would be a button that does nothing |
| M1.12 | 2026-11-21 | Art credits | Always visible under the picker on desktop. At the end of the Birds sheet on a phone | | Both sources named with links and licenses, and the AI generated note, as the PRD requires |
| M1.12 | 2026-11-21 | Report a wrong bird | Not added yet. It needs the reports endpoint from M2 (or a contact address from the owner) | | The PRD's mail link would need an address. Open question for the owner |
| M1.13 | 2026-11-21 | Tooltip implementation (P1) | The plain dark label is drawn with CSS and shows on hover and keyboard focus. The shadcn tooltip component is not used and was removed | https://21st.dev/@shadcn/components/tooltip (look only) | Planner call to meet the PRD budget. Base UI's tooltip costs about 34 KB gzipped, more than the whole picker. Same look as P1. The name stays in the button's accessible name |
| M1.13 | 2026-11-21 | Toast loading (T1) | Sonner loads when the first message appears, not with the page | https://21st.dev/@ghaerdi/components/toast | About 10 KB gzipped saved. Behavior is unchanged |
| M1.13 | 2026-11-21 | Page weight | 298 KB before images, budget 300 KB (scripts 199, fonts 84, styles 12, document 3). First poster visible after 1.3 s on a phone and 1.6 s on desktop at 4 Mbit/s and 100 ms | | Only 2 KB of room. M2 replaces the bundled catalog with an API call, so the budget is re-measured then. Images are 3 MB on first load because M1 uses 640 px art for thumbnails. M2 makes real thumbnails |
| M1.13 | 2026-11-21 | Family chips on a phone | One row that scrolls sideways. On desktop they still wrap (F1) | | Planner call. Wrapping pills filled five rows and pushed every bird off the first screen of the Birds sheet. The owner can overrule |
| M1 follow up | 2026-11-21 | Tap on a bird | A tap selects the bird and shows a small bar with a Mirror button and a Remove button. It no longer mirrors straight away. Remove offers Undo. Tap the bird again, tap elsewhere or press Escape to put the bar away. Drag still swaps. Keyboard: Enter or Space selects (focus goes to Mirror), Delete removes, arrows move, Escape closes | | Owner request after seeing M1. Changes PRD 6.3, which said tap mirrors. The bar sits above the bird, or below it when above would cover the poster title or leave the window |
| M1 follow up | 2026-11-21 | Bird buttons | Icon only. Mirror is a flip icon. Remove is a minus in a circle, not a trash can. Each has its name as the accessible name and a plain label on hover and keyboard focus | | Owner asked for icons only and a better Remove icon. A trash can suggests deleting for good, and an X reads as close the bar. Minus is the opposite of adding a bird |
| M2 | 2026-11-21 | Matched species | 1,161 species have art in both styles and metadata in species.json (fg 11,162 files, wb 2,806 files, species.json 11,011 entries). Matches the PRD estimate | | Measured by the M2.3 ingest at the pinned commits in api/data/sources.json |
| M2 | 2026-11-21 | Database driver | psycopg 3 for the async API and the sync workers, one driver instead of asyncpg plus a second one | | Fewer moving parts. On Windows, async mode needs the selector event loop, set in main.py and conftest.py |
| M2 | 2026-11-21 | Files path | Stored files are served at `/api/v1/files/{key}`, not `/art/{key}` | | Backgrounds and renders will live in the same store, so the path is not art only |
| M2 | 2026-11-21 | Missing data | 47 species have no mass: they take their family median, flagged `massEstimated`. Unknown facing is `left`, flagged `facesKnown: false`, until the vision step in M3 | | The layout needs a size for every bird, and the flags let M3 find what to fix |
| M2.5 | 2026-11-21 | Presets | 11 lists in api/data/presets.json: Birds of Israel (44), Owls of the world (26), Garden birds of North America (26), Garden birds of Europe (14), Birds of Australia (24), Raptors (19), Waterside (17), Parrots and cockatoos (43), Hummingbirds (8), Kingfishers (10), Woodpeckers (22). Region lists drafted by hand, family lists from taxonomy. A test keeps every slug inside the 1,161 matched species | | Many Israeli icons (bulbul, Palestine sunbird, Tristram's starling, smyrna kingfisher) are missing from one art set, so they cannot be in the list. Only one penguin is matched, so there is no penguin list. Waiting for the owner's review |
| M2.6 | 2026-11-21 | Catalog budget (provisional) | The 300 KB budget now covers the app shell only (296 KB). The catalog JSON for 1,161 birds has its own budget of 120 KB gzipped (97 KB measured). It is preloaded from the page head, so the first poster still shows in 1.55 s on 4G | | The shell had 1 KB of room, and no catalog of this size fits in it. Owner to confirm, or ask for a smaller payload (about 56 KB is possible with a compact format) |
| M2.6 | 2026-11-21 | Names switch | English or עברית, a segmented control built on the R4 radio group, in the toolbar and the phone Style tab. 595 of 1,161 birds have a Hebrew name, the rest keep their English one | | Reuses a chosen component, so no design round |
| M2.6 | 2026-11-21 | Family chips | One row that scrolls sideways at every width. Families are the 134 taxonomic families in English, in taxonomic order | | Wrapping over a hundred chips on desktop would push the birds off the first screen. The M1 groups (Owls, Herons and egrets) were hand made for 118 birds and do not scale |
| M2.6 | 2026-11-21 | Bird list | Virtualized against the panel that already scrolls, with a scroll margin, instead of a box of its own | | The old box grew to its full height, so all cards rendered: 246 ms to clear a search on 1,161 birds. Now under 50 ms |
| M2.6 | 2026-11-21 | Tests without a backend | Playwright answers the API from a committed fixture (245 real birds, scripts/make_web_fixture.py) and one placeholder image. `E2E_LIVE_API=1` runs the same suite against docker compose | | CI stays fast and needs no ingest. The live run passed 218 of 218 |
| M3 | 2026-11-21 | Cut M3 | No vision model, facing graph, admin review page, SSE or Prometheus metrics. Jobs move into M4 in their smallest form, polled. Upscaling only if the M4 proof prints look soft | | Owner: "I really don't need it." 236 directions are hand checked, the rest default to left, and Mirror fixes any bird |
| R8 | 2026-11-21 | Desktop layout | A2 side inspector: birds left, poster centre, style column on the right. The names language switch sits at the top of the column. The A series size is removed | 5 options, `docs/design/r8/` | Owner pick. The poster is height bound, so the side column costs no poster size |
| R8 | 2026-11-21 | Control system | B1: every control 40 px, small 32 px, 10 px corners, 14 px medium text, 44 px on phones. No sample pictures in Design and Labels | 5 options | Owner pick |
| R8 | 2026-11-21 | Chosen birds | C1: round pictures of the birds on the poster in a strip under the search, x on hover, one click removes. The bird sits inside the circle with padding so it never touches the ring. Replaces the tray under the list | 5 options | Owner pick |
| R8 | 2026-11-21 | Tap a bird | Tap only mirrors, no bar and no Remove button (reverses the M1 follow up). D3 hop and turn, sped up to about 300 ms. Delete still removes for keyboard users | 5 options | Owner pick: "make it a bit faster" |
| R8 | 2026-11-21 | Swap | E3 live preview: while a bird is dragged over another, the other slides to the dragged bird's place; drop confirms | 5 options | Owner pick |

## Open questions

| # | Question | Needed by | Suggestion |
|---|---|---|---|
| 4 | Price for the print ready file, and whether it depends on size | M5 | |
| 5 | Commercial permission for the woodblock set | Before M5 | Ask the authors. Fallback: paid export in field guide style only |
| 6 | Hosting for k3s | M6 | One VPS with 8 GB RAM |
| 7 | Domain | M6 | |
| 8 | Print sizes at launch beyond 18x24 in, 12x16 in, A2, A3 | M4 | |
| 10 | Review the preset lists in `api/data/presets.json`. Add, remove or rename freely | M2 | |
| 11 | Confirm the split budget: app shell 300 KB, catalog data 120 KB gzipped | M2 | Accept. A compact payload could bring the catalog to about 56 KB later |

## Working preferences

- The 21st.dev free tier allows 2 code retrievals a day. Spend them on components with real logic. Plain inputs and cards are built directly. The CLI install needs `API_KEY_21ST` in the environment, never in the repo. (2026-11-21)
- Design rounds must be shown at desktop size first, then phone. Screenshots at 1280 px or wider, with options side by side where possible. (Owner, 2026-11-21)
