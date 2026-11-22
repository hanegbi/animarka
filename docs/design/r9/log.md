# R9 design log

The landing page redesign. The brief is the owner's R9 message; the audit and the direction are in `audit.md`. This log keeps the system, each round's options and numbers, and what is still open.

## Direction

A natural history museum shop and a printed field guide. Every section is a plate from the field guide you are about to make. One moment: the hero bird and the headline as one image. Signature: plate captions with the real common and Latin name.

## System (landing only)

Tokens live in `web/src/styles/tokens.css` under `[data-landing]`, so the builder can never use them.

| Token | Value | Use |
|---|---|---|
| `--lp-ivory` | #F6F1E4 | the field, under a paper grain |
| `--lp-paper` / `--lp-paper-2` | #F8F4EA / #ECE5D5 | alternate section tones |
| `--lp-forest` | #1F4A3A | type and the main button (8.9:1 on ivory) |
| `--lp-forest-muted` | #4A5F55 | body text (6.1:1 on ivory, 5.5:1 on paper 2) |
| `--lp-on-forest` / `--lp-on-forest-muted` | #F6F1E4 / #C9D6CC | text on the dark band (8.9:1, 6.7:1) |
| `--lp-vermilion` | #F04A24 | the accent: the subject, display type 36 px and up, small marks. Never small text, never a button |
| `--lp-oak` / `--lp-oak-dark` | #C8A676 / #9A7748 | thin natural frames |
| `--lp-grain` | SVG noise, umber at low alpha | the paper material |
| `--lp-shadow-print` | four warm layers | prints and pages |

Type: Fraunces with the optical size axis for display (`web/src/landing/fonts.ts`, landing only), Inter for text.

## Round 1: hero (five options)

Live at `/design/hero?o=1` to `5` (dev only). Review page: `hero/review/index.html`, published for the owner.

| Option | Idea | Red, desktop | Red, phone | Art size at 1440 |
|---|---|---|---|---|
| H1 Knockout (recommended) | Tanager under a huge headline; letters over the bird turn to paper | 21.6% | 19.3% | 1.3x |
| H2 Gaze | Mirrored cardinal looks at the headline; *poster* in vermilion | 18.5% | 17.0% | 1.0x |
| H3 Framed print | Real Birds in red poster, thin oak frame, vermilion mat; *one* in vermilion | 17.0% | 16.7% | poster at 1,600 px |
| H4 Masthead | Two line headline on top; the cardinal's crest stops under *love* | 15.0% | 16.3% | 1.5x |
| H5 Spread | Open field guide; the tanager crosses the gutter, beak points at *bird* | 18.0% | 16.3% | 1.1x |

Red is the vermilion family as a share of the hero with the top bar left out (`color.py measure --route graphic --crop`), brief target 15 to 30%.

What changed while building:

- First pass measured 10 to 12% red on desktop and 6 to 14% on phone. The art fills only 37 to 40% of its box and about half of each bird is red, so the birds were made much larger, cropped by the frame edge, and on phone placed under or behind the words.
- The woodblock cardinal was dropped: its red (#CB4E31) reads as terracotta, not vermilion, and it reached only 11%. Option 4 became the masthead.
- Knockout mask: first by lightness alone, which left green streaks in the letters over feather highlights; now colour plus lightness (knock where chroma is above 0.075 or lightness below 0.665), so the letters stay forest over the pale beak and the white outline and turn ivory over red and black. 0.65 is where ivory and forest tie on contrast against the red.
- Headlines are fluid (`clamp` with vw) so the bird and the type keep their relation from 1280 to 1440.

## Open

- The field guide art is about 1,024 px wide. Birds shown above 1x are a little soft on retina screens; only the poster render is sharp everywhere.
- Fraunces with the optical size axis is a second font file. Check the 300 KB landing budget in the build and drop the plain Fraunces from the landing route if needed.
- The knockout lines up with a small client script; in the build, try CSS container units first.
- Waiting for the owner's pick before items 2 to 9.
