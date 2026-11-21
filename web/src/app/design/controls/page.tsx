import type { ReactNode } from "react";
import * as M from "@/design/controls-mocks";
import { FONT_VARIABLE_CLASSES } from "@/design/fonts";
import { OptionCard, OptionRow, type OptionMeta } from "@/design/option-card";

type Item = [OptionMeta, () => ReactNode];

const SEGMENT: Item[] = [
  [
    {
      id: "G1",
      name: "Sliding thumb",
      rec: true,
      source: {
        label: "Segmented Control by halaska-studio",
        url: "https://21st.dev/@halaska-studio/components/segmented-control",
      },
      how: "One soft track with a white thumb that slides to the chosen option, like on iOS.",
      strength: "Instant to read. Fits two to three options on any width.",
      weakness:
        "The slide is extra motion, so it must stop under reduced motion.",
    },
    () => <M.SegThumb />,
  ],
  [
    {
      id: "G2",
      name: "Separate pills",
      source: {
        label: "Segmented Control by klyv-ui",
        url: "https://21st.dev/@klyv-ui/components/segmented-control",
      },
      how: "Each option is its own pill. The chosen one is filled green. A radio group with arrow-key focus.",
      strength:
        "Matches the family chips, so the whole panel looks like one family.",
      weakness:
        "Looks like a filter, not a switch between two exclusive designs.",
    },
    () => <M.SegPill />,
  ],
  [
    {
      id: "G3",
      name: "Bar with hairlines",
      source: {
        label: "Segmented Control by vamsiy78",
        url: "https://21st.dev/@vamsiy78/components/segmented-control",
      },
      how: "One bordered bar split by thin lines. The chosen segment is tinted and bold.",
      strength: "Compact and calm. Close to the prototype.",
      weakness: "The selected state is subtler than a fill.",
    },
    () => <M.SegHairline />,
  ],
  [
    {
      id: "G4",
      name: "Underline tabs",
      source: {
        label: "Segmented Control by flohoeller",
        url: "https://21st.dev/@flohoeller_5a53e102/components/segmented-control",
      },
      how: "Plain text with a green line under the chosen option.",
      strength: "Lightest. Almost no chrome.",
      weakness:
        "Reads as page navigation, and the touch target is only the text.",
    },
    () => <M.SegUnderline />,
  ],
  [
    {
      id: "G5",
      name: "Cards with a preview",
      source: {
        label: "Radio Card by mahmoudilyan",
        url: "https://21st.dev/@mahmoudilyan/components/radio-card",
      },
      how: "Each option is a small card with a picture of the result: the same bird in each style, and a bird with each label type.",
      strength:
        "You see the difference before you pick. Best for first time visitors.",
      weakness: "Takes the most height, about 190 px for both rows.",
    },
    () => <M.SegPreviewCards />,
  ],
];

const LAYOUT: Item[] = [
  [
    {
      id: "L1",
      name: "Icon cards in a row",
      rec: true,
      source: {
        label: "Radio Card by mahmoudilyan",
        url: "https://21st.dev/@mahmoudilyan/components/radio-card",
      },
      how: "Three cards side by side. The circle icon on top, the name under it. The chosen one is tinted and outlined.",
      strength:
        "What the PRD describes. Clear, and each card is a big touch target.",
      weakness: "Plain. Nothing explains what Centerpiece means.",
    },
    () => <M.LayoutCards />,
  ],
  [
    {
      id: "L2",
      name: "Joined bar",
      source: {
        label: "Styled Radio Group by ai2",
        url: "https://21st.dev/@ai2/components/radio-group-styled",
      },
      how: "One bar with three segments. Smaller circle icons, the chosen segment filled green.",
      strength: "Compact. Matches a segmented control for the design switch.",
      weakness: "Smaller icons, so the circle pattern is harder to read.",
    },
    () => <M.LayoutJoined />,
  ],
  [
    {
      id: "L3",
      name: "Tiles with a description",
      source: {
        label: "Icon Card Radio Group by sean0205",
        url: "https://21st.dev/@sean0205/components/c-radio-group-11",
      },
      how: "Bigger tiles with the icon, the name and one line: Loose and hand placed, Straight rows, One big, the rest around.",
      strength: "Explains each layout without a tooltip.",
      weakness: "Tallest. The small text is hard to read on a phone.",
    },
    () => <M.LayoutTiles />,
  ],
  [
    {
      id: "L4",
      name: "Icon beside the name",
      source: {
        label: "Radio Group by originui",
        url: "https://21st.dev/@originui/components/radio-group",
      },
      how: "Pill buttons with the icon on the left and the name on the right.",
      strength: "Reads like a button, so it is familiar.",
      weakness:
        "The label is not under the icon, and the pills stack in a narrow panel instead of sitting side by side.",
    },
    () => <M.LayoutHorizontal />,
  ],
  [
    {
      id: "L5",
      name: "Sliding highlight",
      source: {
        label: "Radio Group by pmalay694",
        url: "https://21st.dev/@pmalay694/components/radio-group",
      },
      how: "Three icons with a raised highlight that slides to the chosen layout.",
      strength:
        "Echoes the 200 ms reflow, so picking a layout feels like moving the animals.",
      weakness:
        "More motion, and the highlight must jump instantly under reduced motion.",
    },
    () => <M.LayoutSlider />,
  ],
];

const BACKGROUND: Item[] = [
  [
    {
      id: "B1",
      name: "Round swatches in a row",
      source: {
        label: "Animated Color Selector by starc007",
        url: "https://21st.dev/@starc007/components/color-selector",
      },
      how: "Eight round swatches. The chosen one has a ring and its name shows below.",
      strength: "Smallest footprint. One row.",
      weakness: "Swatches hide the pattern of the three picture backgrounds.",
    },
    () => <M.BgCircles />,
  ],
  [
    {
      id: "B2",
      name: "Paper and pictures in two groups",
      rec: true,
      source: {
        label: "ColorSwatchPicker by hero_ui",
        url: "https://21st.dev/@hero_ui/components/heroui-color-swatch-picker",
      },
      how: "Five square paper swatches in one row, and three larger picture thumbnails with their names under them.",
      strength:
        "The two kinds match the PRD. Picture backgrounds get room to show their texture.",
      weakness: "Two blocks, so a bit more height.",
    },
    () => <M.BgGroups />,
  ],
  [
    {
      id: "B3",
      name: "Mini poster tiles",
      source: {
        label: "Cromia Swatches by arikchakma",
        url: "https://21st.dev/@arikchakma/components/cromia-swatches",
      },
      how: "Eight tiny posters with a bird on each background and the title ink drawn on top.",
      strength: "You see how the art and the ink look on each background.",
      weakness: "Tiles are small and eight of them take two rows.",
    },
    () => <M.BgPosterTiles />,
  ],
  [
    {
      id: "B4",
      name: "Dropdown with a swatch",
      source: {
        label: "Select Dropdown by mayurrawte",
        url: "https://21st.dev/@mayurrawte/components/select",
      },
      how: "One field showing the current background. It opens a list with a swatch and a name per row.",
      strength: "Smallest. Scales to 50 backgrounds later.",
      weakness: "Hides the choices. Browsing needs extra taps.",
    },
    () => <M.BgSelect />,
  ],
  [
    {
      id: "B5",
      name: "Presets plus any color",
      source: {
        label: "Color Picker by kemiljk",
        url: "https://21st.dev/@kemiljk/components/color-picker",
      },
      how: "Preset swatches and a plus button that opens a full color picker with a hex field.",
      strength: "Total freedom.",
      weakness:
        "A user can pick a color where the title is unreadable, and backgrounds are meant to be data, not free input.",
    },
    () => <M.BgCustom />,
  ],
];

const SIZE: Item[] = [
  [
    {
      id: "Z1",
      name: "Shapes drawn to scale",
      rec: true,
      source: {
        label: "Aspect Ratio Picker by aadixc0de",
        url: "https://21st.dev/@aadixc0de/components/aspect-ratio-picker",
      },
      how: "Four small outlines in true proportion with the ratio under each, and a portrait or landscape switch below.",
      strength: "You see the shape. No need to know what 2:3 means.",
      weakness:
        "Shows ratios, not print sizes. Sizes in inches are chosen at export.",
    },
    () => <M.SizeShapes />,
  ],
  [
    {
      id: "Z2",
      name: "Dropdown",
      source: {
        label: "Select by cnippet-dev",
        url: "https://21st.dev/@cnippet-dev/components/select",
      },
      how: "One field that opens a list of the four sizes. Orientation is a second control.",
      strength: "Smallest footprint.",
      weakness: "Hides the choices, and the list is text only.",
    },
    () => <M.SizeSelect />,
  ],
  [
    {
      id: "Z3",
      name: "Text buttons and a switch",
      source: {
        label: "Aspect Ratio Switcher by shadcnspace",
        url: "https://21st.dev/@shadcnspace/components/aspect-ratio-05",
      },
      how: "A bar with 3:4, 2:3, 4:5 and A series, plus a landscape switch.",
      strength: "Lightest and quickest to build.",
      weakness:
        "Ratios mean nothing to most people, and there is no hint of the shape.",
    },
    () => <M.SizeText />,
  ],
  [
    {
      id: "Z4",
      name: "Cards with print sizes",
      source: {
        label: "Radio Group with Plan Cards by shadcnspace",
        url: "https://21st.dev/@shadcnspace/components/radio-group-with-plan-cards",
      },
      how: "Four rows, each with a shape and the print sizes it makes: 18 x 24 in and 12 x 16 in, 24 x 36 in, 16 x 20 in, A2 A3 A4.",
      strength: "Ties the choice to what people can buy.",
      weakness: "Tall. It suggests a price decision before the export step.",
    },
    () => <M.SizeCards />,
  ],
  [
    {
      id: "Z5",
      name: "Mini posters at true proportion",
      source: {
        label: "ReUI Aspect Ratio by sean0205",
        url: "https://21st.dev/@sean0205/components/reui-aspect-ratio",
      },
      how: "Four small posters with a bird inside, drawn to scale, and a portrait or landscape switch.",
      strength: "The most visual. Shows the real art shape.",
      weakness: "Larger than outlines, and the bird inside is decoration.",
    },
    () => <M.SizePreviews />,
  ],
];

function Round({
  title,
  intro,
  items,
}: {
  title: string;
  intro?: string;
  items: Item[];
}) {
  return (
    <OptionRow title={title} intro={intro}>
      {items.map(([meta, render]) => (
        <OptionCard key={meta.id} meta={meta}>
          {render()}
        </OptionCard>
      ))}
    </OptionRow>
  );
}

export default function ControlsRound() {
  return (
    <div
      className={`${FONT_VARIABLE_CLASSES} mx-auto w-full max-w-[1700px] space-y-12 bg-neutral-100 p-4 text-neutral-900 md:p-8`}
    >
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Round R4: the style controls</h1>
        <p className="max-w-4xl text-sm text-neutral-700">
          Dev only page. Four decisions, five options each. Theme A, Fraunces
          and Inter. Mock-ups with our tokens, side by side at desktop width.
          Source links are the 21st.dev components each option is based on. The
          chosen one is installed with the shadcn command and adapted to our
          tokens. The layout buttons always show the circle icon with a text
          label under it, as the PRD says.
        </p>
      </header>
      <Round
        title="Decision 1. Segmented control (design and labels)"
        items={SEGMENT}
      />
      <Round title="Decision 2. The three layout buttons" items={LAYOUT} />
      <Round title="Decision 3. Background picker" items={BACKGROUND} />
      <Round title="Decision 4. Poster size and orientation" items={SIZE} />
    </div>
  );
}
