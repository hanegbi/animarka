# R9 audit of the landing page (before)

Page: `/`, code in `web/src/landing`, state at commit `6c39d5e`. Screenshots: `docs/design/r7/built/landing-desktop-1440.png` and `landing-phone-390.png`.
Tools: the `charles-unslop` signs walk, and `charles-color-analysis` (`color.py measure`, `contrast`, `palette`) on the full page at 1440 px (route landing) and on the first viewport (route graphic).

## 1. Unslop audit

Scope: signs across layout, color, components and copy, so the full pass applies.

### Signs found

| Group | Sign | Where |
|---|---|---|
| Template look | Warm cream field with a serif display and a muted earth accent: the post AI default | whole page, `bg-background` #F8F4EA under every section |
| Layout | Every section is heading left, content right, on the same field, so the page has one rhythm | hero, steps, styles, sets, touches, print, questions, final call |
| Layout | No full bleed section except the dark print band | all sections sit in the same 1280 px column |
| Surfaces | The field is a flat colour, no material | `Landing.tsx` root `bg-background` |
| Hero | Three small framed posters, none large enough to read; nothing leads | `[data-gallery-wall]` |
| Hero | Thick black frames (`bg-foreground/85`, 2.5% padding) read as heavy and generic | `Framed` |
| Components | Feature list as icon tile, bold title and one line, six times: the feature card sign | Small touches, `TOUCHES` |
| Structure | Two mechanisms for one job: the drag line and a second range slider under it | `CompareSlider` |
| Structure | Dividers between steps where spacing would group them | steps `divide-y border-y` |
| Components | Native scrollbar under the set carousel; cards of uneven height when titles wrap | `SetsCarousel` |
| Visuals | The owl inside a circle crop: a decorative container around content | print band |
| Visuals | The slider line cuts bird names (Peregrine Falcon, Barn Swallow) and the handle sits on the heron | `CompareSlider` at 50% |
| Copy | "Small touches, big difference." could be pasted onto any product | touches heading |
| Copy | "wall" three times: "Three steps to your wall", "Made for your wall", "Your wall is waiting" | steps, print, final call |
| Type | Italic used for emphasis on the step numerals | steps |
| Licence | The footer dropped the art credits; CC BY 4.0 needs attribution on the page that shows the art | footer |
| Motion | None, which is fine; nothing to delete | |

Not found: gradients, glows, glass, emoji, pills, fake proof, invented numbers, uppercase tracked labels, hype words.

### Direction

- **Product:** a free web tool that arranges illustrated birds into a poster you download, print and hang.
- **Character:** curious, exact, a little playful.
- **World:** a natural history museum shop and a printed field guide: ivory paper with grain, plate numbers and Latin names, thin natural wood frames, a vermilion stamp.
- **Moment:** the hero. One big bird from the art set, its own red carrying the accent, breaking out of the plate into the headline.
- **Signature:** field guide plate captions with the real common and Latin name ("Plate 1. Northern cardinal, Cardinalis cardinalis"), used wherever a single bird is shown.
- **Concept:** every section is a plate from the field guide you are about to make. It rules out generic feature cards, icon grids and decorative frames, and it survives every state, because each plate shows real birds and real names.

## 2. Colour analysis

*A landing page for people who love birds and want a print for their wall, meant to feel curious, crafted and museum like; the eye should land on the hero subject, then on "Make your poster".*

**Verdict:** the value structure is sound (lightness range 0.76, the dark print band gives one strong stop) and every text pair passes. But nothing leads: neutrals hold 89% / 11% of the page, the hero's accent is 3% green, and the only vivid colour is the art's muted orange at 1.3%, an orphan with no echo.

**Keep:**
- The value range (p5 L 0.22, p95 L 0.98): the dark band and the dark CTA read in greyscale.
- Ink #1E1B16 on cream: APCA Lc well above 75.
- The warm field: it fits paper, the material the page claims.

**Fix, ranked:**
1. **No accent leads.** 60/30/10 measures 89 light / 11 dark / 0 accent; in the hero the accent family is 3% (the target at this lightness is 10 to 24%, up to 30% when it is the subject's own colour). Viewers see a pleasant page with nothing to look at first. Fix: one vermilion `#F04A24` (oklch 0.641 0.209 34.0) on the hero subject, 15 to 30% of the first viewport, and nowhere in the builder. Cost: the page stops being quiet; that is the point.
2. **Temperature is undecided.** Coloured area splits warm 61% / cool 38%: the green CTA and woodpecker poster against warm art and paper. Fix: type and CTA in Deep forest `#1F4A3A` (oklch 0.373 0.056 166.5), field in warm Ivory `#F6F1E4` (oklch 0.958 0.018 89.4); the warm field carries the temperature, vermilion and forest are a planned complementary pair (132 degrees apart in OKLCH, ΔL 0.27). Cost: the palette check still reports the coloured area as split (warm 38 / cool 62 in the stand-in), so the vermilion has to be large enough in the hero to lead.
3. **The field is flat.** A single cream fills 80% of the page with no texture, which reads digital. Fix: a paper grain on the ivory (one layer, low contrast), and alternate tones by section: `#F8F4EA`, `#ECE5D5` and the dark band.
4. **Orphan accent.** Nothing echoes the art's orange (hue 64). With vermilion as the accent, echo it in the subject (the cardinal, the kingfisher's breast) and once more in a small vermilion mark per section, never on body text.

**Contrast limits for the new palette (checked with `contrast`):**

| Pair | APCA Lc | WCAG | Use |
|---|---|---|---|
| Deep forest #1F4A3A on Ivory #F6F1E4 | 84.8 | 8.87:1 | body text, headings, CTA |
| Ivory on Deep forest | 88.1 | 8.87:1 | CTA label, dark band text |
| Deep forest on #ECE5D5 | 78.0 | 7.97:1 | text on the second paper tone |
| Vermilion #F04A24 on Ivory | 54.8 | 3.26:1 | display type 36 px and up, and shapes only; never small text |
| Ivory on Vermilion | 59.5 | 3.26:1 | no button labels on vermilion |

So the CTA stays Deep forest with an Ivory label, and vermilion is reserved for the subject, one headline word at display size, and small marks.

**Numbers (before):**

| Colour | Role | Area | OKLCH |
|---|---|---|---|
| #F6F2E9 | field | 80.0% | 0.962 0.013 86.8 |
| #1E1B16 | ink | 8.3% | 0.224 0.010 80.6 |
| #D7D3C7 | card edges, second tone | 4.5% | 0.867 0.017 91.6 |
| #9F744B | art orange (content) | 1.3% | 0.593 0.078 64.0 |
| #206345 | CTA green (hero) | 3.2% of hero | 0.449 0.084 160.5 |
