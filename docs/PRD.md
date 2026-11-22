# animarka: working rules and PRD

This is the owner's brief, saved as written. The 21st.dev API key has been removed. Part 1 is how we work. Part 2 is the PRD and is the source of truth for scope, architecture and design rules.

---

## PART 1. Working rules

You are building **animarka**, a web app where anyone builds their own wildlife poster. The full PRD is in Part 2. A working single file prototype is in `prototype/animarka_prototype.html`. The HTML prototype is only a prototype. Use it to understand the behavior I like, but you are free to change it and make something better. The PRD is the source of truth for scope, architecture and design rules.

### How we work

1. **Plan first, code later.** Start in plan mode. Do not create or edit any file until I approve the plan.
2. **Two models.** I plan with Fable and I code with Sonnet. After I approve the plan I will switch models with `/model`. So the plan must be executable by a different model that has not seen this conversation:
   - Write the approved plan to `docs/PLAN.md` and the decisions I made to `docs/DECISIONS.md`.
   - Break every milestone into small tasks. Each task names the files to touch, the exact behavior, and how to verify it.
   - No task may depend on context that is not written in those two files or in this PRD.
3. **One milestone at a time.** Finish a milestone, run its checks, show me the result, wait for my go before the next one.
4. **Ask before you assume.** If the PRD is silent or contradicts the prototype, stop and ask.

### Git

- Repo: `https://github.com/hanegbi/animarka.git`
- Work only on `master`. No feature branches and no pull requests.
- Commit and push as you go, after every finished task. Do not wait for me and do not ask before committing or pushing.
- Small commits with clear messages. Never commit secrets or API keys.

### The rule of five (design and UI)

Every time a design or UI decision comes up, do not pick for me. Show me **exactly 5 options** and wait for my choice. This covers color palette, typography, page layout, each main component, motion, empty states, the mobile pattern and the landing page.

For each option give:
- a short name
- two lines on how it looks and behaves
- where it comes from (the 21st.dev component or theme, with its link)
- one strength and one weakness for this product
- mark the one you recommend and say why in one sentence

Batch related decisions so I answer a few times, not fifty. Record every choice in `docs/DECISIONS.md`.

### 21st.dev

All UI components come from **21st.dev** (a registry of React, Tailwind and shadcn/ui compatible components), installed through the shadcn CLI so the code lives in our repo.

- The 21st MCP server is connected in the owner's Claude Code setup (server name `21st`, URL `https://21st.dev/api/mcp`). If it is missing, ask the owner to connect it. The API key is a secret and is not stored in this repo.
- This key is a secret. Never write it into any file, commit, log or doc in the repo.
- For each UI part in section 9 of the PRD, search 21st.dev, shortlist real components, and bring me 5 options as described above.
- Choose candidates by best practice, in this order: accessibility (keyboard, focus, ARIA, contrast), mobile behavior, bundle weight, code quality, then looks.
- Never invent a component when a good one exists. Never install two components that do the same job.
- After install, adapt every component to our design tokens. No hardcoded colors.

### What I want from the plan

- Repo structure (monorepo: `web/`, `api/`, `workers/`, `infra/`, `docs/`).
- Data model and API contract.
- Milestone breakdown from section 12 with tasks, checks and risks.
- The list of design decisions you will bring me with the rule of five, and in which milestone.
- Open questions for me.

### Writing style for all UI copy and docs

Plain, short sentences. No em dashes and no hyphens used as punctuation. Sentence case for buttons and headings. No marketing filler.

---

## PART 2. PRD

### 1. Summary

**animarka** lets a visitor pick any animals they like, see them arranged on a poster of illustrated wildlife, change the art style with one tap, and get a print ready file.

Tagline: **Build your own wildlife poster.**

Version 1 is birds only. Mammals come next. The product is also my portfolio project for backend and AI infrastructure roles, so the async pipeline, queueing, orchestration and deployment are part of the goal, not overhead.

### 2. Who it is for

- **Nature and bird lovers** who want a poster of their own species, their region or their life list.
- **Parents** decorating a child's room with favorite animals.
- **Gift buyers** who want something personal.
- **Teachers and guides** who need a chart of a specific group or region.

### 3. Goals and non goals

Goals for version 1:
- A fast, joyful poster builder that works on a phone.
- Any mix of species from any family, with no limit.
- Two art styles that swap in place.
- Print ready export, free preview and paid full resolution.
- An async backend I can show in interviews.

Non goals for version 1:
- Accounts and social features (posters are saved in the browser and by share link).
- Selling physical prints ourselves. Later we may hand off to a print partner or photo tile service.
- Free text prompts from users to an image model.

### 4. Art and data sources

| | Field guide style | Woodblock style |
|---|---|---|
| Repo | `alchaincyf/huashu-bird-sticker` | `adamoberley/HABirdDashboard` (branch `HABirdDashboard`) |
| Size | about 11,000 species | 2,521 images, 1,283 species |
| Path | `stickers/<Order>/<Family>/<Genus_species>.webp` | `avian/assets/illustrations/<genus-species>.png` (`-2` suffix is a flight pose) |
| Metadata | `data/species.json` (taxonomy, common names in many languages including Hebrew, body mass) | file names only |
| License | CC BY 4.0, attribution required | repo says MIT, but the art began in a non commercial project |

Rules:
- Version 1 catalog is the **1,161 species that exist in both sets**, matched by scientific name slug (`genus-species`).
- Show attribution for both sources in the footer and on the export page.
- Both sets are AI generated. Add a "report a wrong bird" link per species.
- Field guide birds all look left. Woodblock birds look either way. See section 6.4.

### 5. Core user flow

1. Land on the page and see a ready poster (a starter mix of 12 birds from different families).
2. Add and remove birds: search, filter by family, tap to toggle.
3. Arrange: drag to swap, tap to mirror, shuffle.
4. Style: switch layout, art style, labels, title, background, size.
5. Export: free watermarked preview, or pay for the print ready file.
6. Share: copy a link that reopens the same poster.

### 6. Functional requirements

The prototype already shows 6.1 to 6.5. Keep what works and improve whatever you can.

#### 6.1 Picking animals
- Search across all species by common name, scientific name and family. Results update as you type.
- Family filter chips. A family chip only filters the list. It never resets the poster. Each chip shows how many of its birds are on the poster.
- Each bird is a toggle chip with thumbnail and name. On means it is on the poster.
- "Add all" adds everything in the current list. "Only this family" (or "Only these N" for a search) replaces the poster with exactly that list.
- "Your poster" tray shows everything selected across families, with a count such as "14 birds from 5 families". Tap to remove.
- "Surprise mix" builds a random poster of 12 to 16 birds. "Clear poster" empties it.
- Presets (new): ready sets such as "Birds of Israel", "Owls of the world", "Garden birds of North America". Stored as data, not code.
- With 1,161 species the list must be virtualized and thumbnails lazy loaded.

#### 6.2 The poster
- Portrait 3:4 by default. Also 2:3, 4:5 and A series, plus landscape.
- **Layout (new):** the user chooses how the animals are arranged. Three buttons, exactly three, shown side by side:
    - **Scattered** (default): loose and hand placed, with seeded jitter so it is reproducible. This is what the prototype does today.
    - **Grid:** straight rows and columns, evenly spaced, like a classic field guide chart.
    - **Centerpiece:** the largest animal sits big in the middle and the others are arranged around it.
- Each layout button is an **icon made of small circles** placed the way that layout places the animals, so the user understands it without reading. Add a text label under the icon and an accessible name.
- Switching layout keeps the same animals, order, mirrors, style, labels and background. It only moves them, with a short animation.
- Every layout must obey the same rules below: nothing crosses the frame, it works from 1 to 150 animals, and it works with all three label modes.
- Layouts are separate functions behind one interface (`animals in, positions and sizes out`), so a fourth layout is easy to add later. The print render uses the same functions.
- Animal size follows the log of body mass, clamped, so an eagle is bigger than a finch but both stay readable.
- The layout picks the column count that gives the largest animals for the current count and label mode.
- Nothing may cross the poster frame, the title area or the legend. This is a hard requirement with an automated test.
- Must stay correct from 1 to 150 animals.
- **Background (new):** the user can set the poster background. Two kinds:
    - a solid paper color: cream, white, sage, blush, night
    - a background image, with 3 examples shipped at launch: "Aged paper" (warm paper texture), "Morning sky" (soft watercolor wash), "Forest" (muted botanical pattern)
- Backgrounds are data in a `backgrounds` table, so adding one is not a code change. Each has a light or dark flag, and labels and title switch color to stay readable.
- The background is part of the print render at full resolution.

#### 6.3 Interactions
- Tap or click an animal to mirror it, with a short hop and turn (about 300 ms). Animals are removed in the picker: untick a card, or click a picture in the strip of chosen birds. (R8, 2026-11-22. Replaces the Mirror and Remove bar.)
- Drag one animal onto another to swap places. Works with mouse and touch.
- Click an animal's name on the poster to rename it for this poster (F2 from the keyboard). An empty name goes back to the catalog name.
- Drag an animal off the poster to remove it: a trash badge shows while it is outside, and letting go there removes it.
- Keyboard: Enter or Space mirrors an animal, Delete removes it, arrow keys move it through the order.
- Shuffle button gives a new arrangement inside the chosen layout.
- Undo and redo (new), at least 20 steps.

#### 6.4 Switching art style
- One control switches every animal between styles.
- Each animal keeps the same place and the same box size in both styles.
- Each animal keeps the **same looking direction** after the switch. Store `faces` (`left`, `right`, `front`) per species per style. Effective mirror = user mirror XOR (style faces right). Front facing animals are never auto mirrored.
- The prototype has a hand made list for 118 birds. For the full catalog this comes from the pipeline in section 8.

#### 6.5 Labels and title
- Label modes: names under each animal, numbers with a legend at the bottom, or no text.
- Legend grows from 3 to 5 columns and shrinks its type as the count grows.
- Title is editable. Until the user edits it, it follows the selection: one family gives that family name, a mix gives "Birds".
- Label language (new): English and Hebrew at launch, from `species.json`. Hebrew posters render right to left.

#### 6.6 Saving and sharing
- Autosave in localStorage.
- Share link: the poster state is stored on the server under a short id and reopened by URL.

#### 6.7 Export and payment
- Free: watermarked PNG preview, long edge about 1600 px.
- Paid: print ready PDF and PNG at 300 DPI in the chosen size (for example 18x24 in, 12x16 in, A2, A3), with bleed option.
- Rendering runs as an async job. The user sees progress and gets a download link.
- Lemon Squeezy checkout, one time payment per poster. No accounts: the receipt email carries the download link. Keep all payment code behind one small interface so the provider can be swapped later.
- Identical paid renders are cached by a hash of the poster state.

#### 6.8 Later phases (design for them now, build later)
- **Mammals** and other groups, as new catalogs with the same data shape.
- **AI generated art** for species or styles we do not have. Requests go through a moderated pipeline, never straight from user text to an image model.
- **More styles:** each style is a row in a `styles` table, not a code change.
- **Physical product** through a print or photo tile partner.

### 7. Architecture

| Layer | Choice |
|---|---|
| Web | Next.js (App Router), TypeScript, Tailwind, shadcn/ui, components from 21st.dev |
| Drag and drop | dnd-kit or pointer events as in the prototype (bring me options) |
| API | FastAPI (Python), Pydantic, SQLAlchemy, Alembic |
| Database | Postgres |
| Cache and job state | Redis |
| Queue | RabbitMQ |
| Workers | Celery |
| AI orchestration | LangGraph |
| Object storage | Wait with this. For now images are plain files on local disk, served by the API or web app, behind one storage interface so S3 can be added later |
| Payments | Lemon Squeezy checkout and webhooks |
| Local dev | Docker Compose for everything |
| Deploy | k3s, with KEDA scaling Celery workers on RabbitMQ queue length |
| Observability | Prometheus, Grafana, structured logs, Flower for Celery |
| CI | GitHub Actions: lint, type check, unit tests, Playwright, image build |

Data model (first draft, refine in the plan):
- `species` (id slug, scientific name, order, family, mass_g, names by language)
- `styles` (id, name, source, license)
- `backgrounds` (id, name, kind color or image, value or image_key, is_dark)
- `artworks` (species_id, style_id, image_key, width, height, faces, pose, status)
- `presets` (id, title, species ids)
- `posters` (short id, state json, created_at)
- `jobs` (id, type, status, progress, input hash, result key, error)
- `orders` (id, poster id, lemon squeezy order id, status, download key)

### 8. Async pipeline

Queues are separated so slow work never blocks fast work: `ingest`, `vision`, `render`, `generate`.

- **Ingest:** pull both art repos, match species, trim transparent borders, write web sizes (thumb, medium) and keep the original for print, save to the local image folder, fill the tables.
- **Facing detection (LangGraph):** for every artwork, a vision model answers "which way is the head looking: left, right or front" with a confidence. Low confidence or disagreement between two passes goes to a human review queue in a small admin page. This fills `artworks.faces` for all 1,161 species times two styles.
- **Print render:** rebuild the poster server side from the saved state at 300 DPI. The server layout must be the same code path or a tested port of the client layout, with a pixel comparison test.
- **Generation (later):** LangGraph graph: validate species, gather reference, generate, remove background, quality check, human approve, publish to catalog.

Every job is idempotent, retried with backoff, has a dead letter queue, and reports progress to Redis for the UI.

### 9. UI and UX

Principles:
- **The poster is the hero.** It is always visible and controls never cover it.
- **Instant feedback.** Every tap changes the poster in under 100 ms.
- **Phone first.** Most visitors arrive on a phone. Thumb reach decides where controls go.
- **Calm chrome, rich content.** The interface is quiet so the animals carry the color.
- **Nothing is lost.** Autosave, undo, and no destructive action without a way back.

Layout:
- **Desktop:** picker on the left, poster in the center, style and export controls on the right or in a top bar.
- **Phone:** poster on top and always in view, picker in a bottom sheet with three heights (peek, half, full). The prototype puts the poster below the picker on phones. That is the main thing to fix.

Motion: short and purposeful. Animals ease to new positions on reflow (about 200 ms). The mirror is a quick flip. Respect reduced motion.

Accessibility: WCAG AA contrast, full keyboard path, visible focus, real button semantics, alt text from species names, touch targets at least 44 px.

Performance budget: first poster visible in under 2 s on 4G, page weight under 300 KB before images, thumbnails as WebP or AVIF with fixed dimensions.

UI parts to source from 21st.dev with the rule of five:
1. App shell and header
2. Search input with results (command palette style or inline)
3. Family filter chips with counts
4. Species toggle chip and virtualized list
5. Selected tray
6. Segmented control for style and labels, and the three layout buttons with circle icons
7. Bottom sheet for phones
8. Background and size pickers
9. Export dialog with job progress
10. Toasts, tooltips, empty and loading states
11. Landing section above the tool
12. Theme tokens (color, type, radius, shadow)

### 10. Color and type directions

These are my five starting directions for the app chrome. Present them as real rendered samples and let me choose. The poster background is a separate user setting.

| | Name | Background | Text | Accent | Feel |
|---|---|---|---|---|---|
| A | Field guide | warm paper `#F8F4EA` | ink `#1E1B16` | forest `#2C6B4F`, ochre `#C58B2A` | natural history book, matches the prototype |
| B | Museum night | charcoal `#14171A` | bone `#EDE8DC` | brass `#B8935A` | dark gallery wall, the poster glows |
| C | Herbarium | sage `#E7EDE4` | moss `#2F4A3A` | terracotta `#C4623E` | soft, botanical, calm |
| D | Coastal | fog `#F3F6F7` | navy `#1F3347` | heron blue `#4F86A6`, sand `#D9C7A3` | clean, airy, modern |
| E | Playroom | cream `#FFF8EC` | ink `#22223B` | coral `#F2695C`, sky `#5BB7DB`, sun `#F4C542` | friendly, aimed at kids' rooms |

My leaning: A for light mode with B as its dark mode. Check every pair for AA contrast before showing it.

Type: a serif with character for the poster title and headings, a clean sans for the interface and labels. Bring five pairings. Fonts must be free for commercial use and embeddable in the PDF.

### 11. Quality bar

- Unit tests for layout math, mirror logic and state reducers.
- Playwright tests at 390 px and 1280 px for: add, remove, only this family, swap, mirror, style switch keeps position and direction, all label modes, 1 and 150 animals inside the frame.
- API tests for every endpoint. Worker tests for idempotency and retry.
- A load test that queues 200 render jobs and shows KEDA scaling workers up and back down.

### 12. Milestones

| | Milestone | Done when |
|---|---|---|
| M0 | Repo, tooling, Docker Compose, CI, design decisions made | `docker compose up` runs web, api, db, redis, rabbitmq. Theme chosen through the rule of five. |
| M1 | Poster builder in Next.js with the 118 prototype birds | Full parity with the prototype plus the phone bottom sheet, undo, the three layouts and backgrounds with the 3 example images. Playwright suite green. |
| M2 | Catalog backend | Ingest job loads all 1,161 shared species. API serves species, families, presets. Web uses the API with a virtualized list. |
| M3 | Async pipeline | RabbitMQ and Celery in place. Facing detection run on the full catalog with a review page. Style switch is correct for every species. |
| M4 | Share and export | Share links work. Free preview and print ready render through the queue with progress. |
| M5 | Payments | Lemon Squeezy checkout, webhook, emailed download link. |
| M6 | Deploy and observe | k3s deploy, KEDA scaling shown in Grafana, load test report in `docs/`. |
| M7 | Mammals and AI generation | New catalog and the LangGraph generation graph with human approval. |

### 13. Open questions for me

1. Price for the print ready file.
2. Which image and vision models to use, and the monthly budget cap.
3. Hosting for k3s (single VPS or a managed cluster).
4. Domain.
5. Whether Hebrew ships in M1 or later.
