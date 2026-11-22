# Prompt: animarka landing page

Use the /frontend-design:frontend-design skill for this task. Work in the animarka repo (`master`), follow every rule in `docs/PRD.md`, `docs/PLAN.md` and `docs/DECISIONS.md`, and keep the rule of five.

## The goal

Build the landing page for animarka. It should feel like opening a beautiful field guide, not like a SaaS template. One job: get a visitor to make their first poster in under a minute. It is round R7 in the plan, now a full page.

## What animarka is (facts only, never invent more)

- A free web tool that turns birds you pick into an illustrated wildlife poster.
- 1,161 bird species. Search by name, scientific name or family. Names in English and Hebrew.
- Two art styles of the same birds: **Field guide** (soft, detailed colour plates) and **Woodblock** (bold, printmaking look). One click switches the whole poster and every bird keeps its place.
- Three layouts: **Scattered**, **Grid**, **Centerpiece** (one big bird in the middle, you choose which). Shuffle for a new arrangement.
- Make it yours: tap a bird to mirror it, drag one onto another to swap, drag one off the poster to remove it, make every bird face left or right at once, rename any bird by clicking its name, edit the title, 8 backgrounds, 3 poster shapes (3:4, 2:3, 4:5), labels as names, numbers with a legend, or no text.
- Ready sets to start from: Birds of Israel, Owls of the world, Garden birds of North America, Garden birds of Europe, Birds of Australia, Birds of prey, By the water, Parrots and cockatoos, Hummingbirds, Kingfishers, Woodpeckers.
- Share a link to any poster. Free preview image (PNG, 1,600 px, light watermark).
- Print file: 300 DPI PDF and PNG with no watermark, 18 x 24 in, 12 x 16 in, A2, A3. **Coming soon.** Say so honestly. No price yet.
- The art is AI generated, from two open sets: field guide art by Huashu (huashu-bird-sticker, CC BY 4.0) and woodblock art by Adam Oberley, Teddy Warner and contributors (HABirdDashboard, MIT). Credit both on the page. Never call the art hand painted or say an artist drew it.
- No account, no sign up.

Do not invent testimonials, user counts, ratings, press logos or reviews. Real numbers only: 1,161 birds, 2 styles, 3 layouts, 8 backgrounds, 11 sets, 4 print sizes.

## Voice and copy rules

- Plain, short sentences. Warm and a little nerdy about birds, like a good field guide.
- Sentence case everywhere. No em dashes, no hyphens used as punctuation.
- Verbs on buttons say what happens: "Make your poster", "See the owls set".
- Draft copy is below. Improve it if you can, but keep the facts.

## Page map and draft copy

**0. Top bar.** Logo "animarka" left. Links: How it works, Styles, Sets, Print. Button right: "Make your poster".

**1. Hero.** The single most important section.
- Headline options (pick the best, or write a better one):
  - "Every bird you love, on one poster."
  - "Your birds. Your poster."
  - "Make a bird poster that is truly yours."
  - "1,161 birds. One wall."
- Subline: "Pick birds from 1,161 species, choose an illustrated style, and arrange them your way. Free, in your browser, no sign up."
- Primary button: "Make your poster". Secondary: "Start from a set".
- Visual: a real poster from the app, large and crisp. Ideas: the poster switching between Field guide and Woodblock; birds settling into place; a living field guide plate. Use real renders from our render pipeline (`/render/[id]`), never stock images.

**2. How it works.** Three steps.
- "Pick your birds." Search 1,161 species or start from a ready set.
- "Make it yours." Choose a style, a layout and a background. Mirror, swap and rename any bird.
- "Share or print." Send a link, download a free preview, or get the print file (coming soon).

**3. Two styles.** "Two ways to see the same birds."
- Field guide: "Soft colour plates with every feather in place."
- Woodblock: "Bold shapes and strong lines, like a printmaker's proof."
- A toggle or slider that shows the same poster in both styles.

**4. Ready sets.** "Start from a set." A gallery of real posters made from the sets (Birds of Israel, Owls of the world, Garden birds of North America, Birds of prey...). Each card opens the builder with that set. Line: "Or build your own from 1,161 species."

**5. Make it yours.** "Small touches, big difference." Show the real interactions: tap to mirror, drag to swap, drag off to remove, Face left / Face right, rename a bird, 8 backgrounds, 3 layouts, English or Hebrew names. Short looping demos are better than words.

**6. Print and share.** "Made for your wall."
- Free preview: "A 1,600 px image with a light watermark. Free, always."
- Print file: "300 DPI PDF and PNG, no watermark, for 18 x 24 in, 12 x 16 in, A2 and A3. Coming soon."
- Share: "Every poster has its own link."

**7. FAQ.** Real questions only:
- Is it free? (Building, sharing and the preview image are free. The print file will be paid.)
- Do I need an account? (No.)
- Who made the art? (Two open, AI generated sets, with credit and licences.)
- Can I use Hebrew names? (Yes, 595 birds have a Hebrew name; the rest keep English.)
- Where can I print it? (Any print shop. The file is 300 DPI.)
- Is the art accurate? (It is AI generated and can contain mistakes. Tell us if a bird looks wrong.)

**8. Final call.** "Your wall is waiting." Button: "Make your poster".

**9. Footer.** Credits for both art sets with links and licences, "AI generated, may contain errors", a link to report a wrong bird.

## The rule of five, for every section

For each of the 10 parts above (top bar, hero, how it works, two styles, sets, make it yours, print and share, FAQ, final call, footer):

1. Search 21st.dev with the 21st MCP tools for real components that fit, shortlisted by accessibility, phone behaviour, weight, code quality, then looks.
2. Build **5 different design options** as real rendered samples on a dev only page (`web/src/app/design/landing/`), using our real posters and copy, in our tokens.
3. For each option give: a short name, two lines on look and behaviour, the 21st.dev link, one strength, one weakness, and mark one as recommended with a one sentence reason.
4. Put all 50 options on one review page and publish it as an artifact. Show it at **desktop size first**, then phone. Codes like H1 to H5 for the hero, S1 to S5 for styles, so I can answer "H3 S2 ..." in one line.
5. Wait for my picks. Then build the chosen ones, install components with the shadcn CLI (the key comes from `API_KEY_21ST` in the environment, never in a file), and adapt them to our tokens with no hardcoded colours.

## Design direction

- Our design system stays: Field guide theme (paper `#f8f4ea`, ink `#1e1b16`, forest green `#2c6b4f`, ochre for decoration only), dark mode Museum night (charcoal with brass). Fraunces for headings, Inter for text, Frank Ruhl Libre and Heebo for Hebrew. 10 px corners, whisper shadows, controls 40 px (32 px small, 44 px on phones).
- The birds are the stars. Big, real poster renders. Generous paper white space. Feel like a museum shop, a printed field guide, a framed print on a wall.
- One bold moment, not ten: maybe the style switch, or birds flying into a poster as you scroll. Everything else calm.
- Avoid the generic look: no purple gradients, no glass cards, no emoji, no fake dashboards, no stock photos, no "trusted by" logos.
- Motion is short and respects reduced motion.

## Hard requirements

- Desktop first, then phone. No sideways scroll at any width.
- Where it lives: decide with me in the first round. Suggestion: the landing at `/` and the builder at `/make`, with share links (`/p/[id]`) unchanged. Every "Make your poster" goes to the builder; every set card opens it with that set.
- Fast: the landing page under 300 KB before images, the hero visible in under 2 s on 4G, images in modern formats and lazy loaded below the fold.
- Accessible: WCAG AA contrast, real headings in order, alt text on every poster, keyboard reachable, no serious axe violations.
- SEO: title, description, Open Graph image (a real poster), Hebrew ready.
- Tests: Playwright at 390 px and 1280 px for every section, the CTA paths, and axe. Keep all existing tests green.
- Commit and push after each finished part, then show me desktop screenshots.
