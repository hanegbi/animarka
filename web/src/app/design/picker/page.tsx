import type { ReactNode } from "react";
import { FONT_VARIABLE_CLASSES } from "@/design/fonts";
import { OptionCard, OptionRow, type OptionMeta } from "@/design/option-card";
import * as M from "@/design/picker-mocks";

type Item = [OptionMeta, () => ReactNode];

const SEARCH: Item[] = [
  [
    {
      id: "S1",
      name: "Inline field",
      rec: true,
      source: {
        label: "Component Search by uiable",
        url: "https://21st.dev/@uiable/components/component-search",
      },
      how: "A field with a search icon. The list below filters as you type and a count says how many were found.",
      strength: "Simplest. Results appear in the list you already look at.",
      weakness: "No hint of what to type for a first time visitor.",
    },
    () => <M.SearchInline />,
  ],
  [
    {
      id: "S2",
      name: "Autocomplete dropdown",
      source: {
        label: "Autocomplete by cubby-ui",
        url: "https://21st.dev/@cubby-ui/components/autocomplete",
      },
      how: "A dropdown under the field lists matches with a picture and the scientific name. Arrow keys pick, Enter adds.",
      strength: "Fast to add one bird. Shows the scientific name.",
      weakness:
        "Two places show birds (dropdown and list). A dropdown over a bottom sheet is awkward on a phone.",
    },
    () => <M.SearchAutocomplete />,
  ],
  [
    {
      id: "S3",
      name: "Family menu and field",
      source: {
        label: "Search Bar with Category Filter by cnippet-dev",
        url: "https://21st.dev/@cnippet-dev/components/v-group-18",
      },
      how: "One joined control: a family menu, the text field and a search button.",
      strength: "Replaces the chip row, so it saves height.",
      weakness:
        "Hides the family list behind a menu. You lose the counts on poster.",
    },
    () => <M.SearchCategory />,
  ],
  [
    {
      id: "S4",
      name: "Command palette",
      source: {
        label: "Command Palette by vovalopuh13",
        url: "https://21st.dev/@vovalopuh13/components/command-palette",
      },
      how: "A dialog opens on Ctrl K. Fuzzy match with the matched letters underlined.",
      strength: "Powerful for people who know a bird name.",
      weakness:
        "Hidden until opened, and it feels like a developer tool. Wrong tone for a poster toy.",
    },
    () => <M.SearchPalette />,
  ],
  [
    {
      id: "S5",
      name: "Field with suggestions",
      source: {
        label: "Suggestive Search by user_hardp",
        url: "https://21st.dev/@user_hardp/components/suggestive-search",
      },
      how: "An empty field shows try chips like kestrel, heron and owl. They fill the field when tapped.",
      strength: "Teaches that you can search by group. Friendly for newcomers.",
      weakness:
        "Takes a row of space, and the chips are only useful until you know the app.",
    },
    () => <M.SearchSuggest />,
  ],
];

const FAMILY: Item[] = [
  [
    {
      id: "F1",
      name: "Wrapping pills with badge",
      rec: true,
      source: {
        label: "Role Filter Chips by cnippet-dev",
        url: "https://21st.dev/@cnippet-dev/components/v-toggle-10",
      },
      how: "Pills wrap to as many rows as needed. A small badge shows how many birds of that family are on the poster.",
      strength: "Everything visible, counts visible. Matches the PRD.",
      weakness: "Ten families take two or three rows on a phone.",
    },
    () => <M.FamilyWrap />,
  ],
  [
    {
      id: "F2",
      name: "Ring select, plain counts",
      source: {
        label: "Chip Filter by amankaushik481",
        url: "https://21st.dev/@amankaushik481/components/chip-filter",
      },
      how: "Like pills, but the selected family gets an accent ring instead of a fill, and counts are plain text.",
      strength: "Quieter, so the birds carry the color.",
      weakness: "The selected state is weaker. Harder to see at a glance.",
    },
    () => <M.FamilyRing />,
  ],
  [
    {
      id: "F3",
      name: "One row with overflow",
      source: {
        label: "Chip Group by kuratlielia",
        url: "https://21st.dev/@kuratlielia/components/chip-group",
      },
      how: "A single row of chips with a plus N more chip that opens the rest.",
      strength: "Saves vertical space on a phone.",
      weakness:
        "Hides families. With 10 to 20 families the hidden ones are hard to find.",
    },
    () => <M.FamilyScroll />,
  ],
  [
    {
      id: "F4",
      name: "Tabs with family size",
      source: {
        label: "Tabs with Count Badge by coss.com",
        url: "https://21st.dev/@coss.com/components/tabs-count-badge",
      },
      how: "Underlined tabs, each with the number of birds in that family. Scrolls sideways.",
      strength: "Clear single selection. Familiar.",
      weakness:
        "Looks like navigation. Counts on poster are lost, and tabs scroll sideways.",
    },
    () => <M.FamilyTabs />,
  ],
  [
    {
      id: "F5",
      name: "Vertical list with bars",
      source: {
        label: "ReUI Filters by larsen66",
        url: "https://21st.dev/@larsen66/components/reui-filters",
      },
      how: "A column of families, each with a fill bar showing how many are on the poster.",
      strength: "Shows coverage at a glance. Fun to fill the bars.",
      weakness: "Needs a column. Fits the desktop picker, not the phone sheet.",
    },
    () => <M.FamilyBars />,
  ],
];

const SPECIES: Item[] = [
  [
    {
      id: "C1",
      name: "Pill chips with round thumbnail",
      rec: true,
      source: {
        label: "Chip by hero_ui",
        url: "https://21st.dev/@hero_ui/components/heroui-chip",
      },
      how: "Wrapping pills with a small round picture and the name. Filled green means on the poster.",
      strength: "Dense, scans fast, proven in the prototype.",
      weakness: "Pictures are tiny, so similar birds look alike.",
    },
    () => <M.SpeciesPills />,
  ],
  [
    {
      id: "C2",
      name: "Picture cards, three columns",
      source: {
        label: "ListBox by hero_ui",
        url: "https://21st.dev/@hero_ui/components/heroui-list-box",
      },
      how: "A grid of cards with a larger picture and the name. A ring and a check mark show it is on.",
      strength: "Birds are easy to recognize.",
      weakness: "Fewer birds per screen, which hurts a list of 118 or 11,011.",
    },
    () => <M.SpeciesCards />,
  ],
  [
    {
      id: "C3",
      name: "Rows with scientific name",
      source: {
        label: "Interactive List by ravikatiyar162",
        url: "https://21st.dev/@ravikatiyar162/components/interactive-list",
      },
      how: "One bird per row: picture, common name, scientific name in italics, and a check box.",
      strength:
        "Best for search and for experts. Easiest to virtualize and to read aloud.",
      weakness:
        "Long and plain. A bird lover browsing feels like reading a table.",
    },
    () => <M.SpeciesRows />,
  ],
  [
    {
      id: "C4",
      name: "Big picture tiles",
      source: {
        label: "Interactive List Preview by hyperiux",
        url: "https://21st.dev/@hyperiux/components/interactive-list-preview",
      },
      how: "Two columns of large pictures. The name bar turns green when the bird is on.",
      strength: "The art is the star. Looks like a field guide page.",
      weakness: "Only about 6 birds visible at once. Slow to scan.",
    },
    () => <M.SpeciesTiles />,
  ],
  [
    {
      id: "C5",
      name: "Text tags with plus and check",
      source: {
        label: "Tag Selector by serafimcloud",
        url: "https://21st.dev/@serafimcloud/components/tag-selector",
      },
      how: "Names only. A plus means add, a check means on. No pictures.",
      strength: "Lightest to load. Fits the most birds.",
      weakness: "Gives up the main selling point, the art.",
    },
    () => <M.SpeciesAddTags />,
  ],
];

const TRAY: Item[] = [
  [
    {
      id: "T1",
      name: "Removable name chips",
      source: {
        label: "Tag Group by hero_ui",
        url: "https://21st.dev/@hero_ui/components/heroui-tag-group",
      },
      how: "Pills with a cross, showing the first eight and a plus N more.",
      strength: "Clear and familiar. Names are readable.",
      weakness: "Long for 50 or more birds, so it needs the plus N more cap.",
    },
    () => <M.TrayChips />,
  ],
  [
    {
      id: "T2",
      name: "Thumbnail strip",
      rec: true,
      source: {
        label: "Removable Badges by bundui",
        url: "https://21st.dev/@bundui/components/badge10",
      },
      how: "Round pictures only, each with a small cross. Names show on hover or long press.",
      strength: "Densest. Shows the mix of birds at a glance. Fits 150 birds.",
      weakness: "Names are hidden, so it needs a tooltip.",
    },
    () => <M.TrayThumbs />,
  ],
  [
    {
      id: "T3",
      name: "Collapsed summary bar",
      source: {
        label: "Tag Group by jolbol1",
        url: "https://21st.dev/@jolbol1/components/tag-group-2",
      },
      how: "One line: four overlapping pictures and 12 birds from 9 families. Tap to open.",
      strength: "Takes almost no height. Best on a phone.",
      weakness: "Removing a bird needs an extra tap to open it.",
    },
    () => <M.TraySummary />,
  ],
  [
    {
      id: "T4",
      name: "Grouped by family",
      source: {
        label: "Animated Tags by educalvolpz",
        url: "https://21st.dev/@educalvolpz/components/animated-tags",
      },
      how: "Small headings per family, with the birds under each.",
      strength: "Shows the mix clearly.",
      weakness: "Tall, and the grouping does not match the poster order.",
    },
    () => <M.TrayGrouped />,
  ],
  [
    {
      id: "T5",
      name: "Numbered reorder grid",
      source: {
        label: "Sortable List by ebnsina",
        url: "https://21st.dev/@ebnsina/components/sortable",
      },
      how: "Small cards in poster order, numbered like the legend, with a grip to drag or use arrow keys.",
      strength: "Doubles as a keyboard and touch friendly way to reorder.",
      weakness: "Bigger than a chip row. Reorder lives in two places.",
    },
    () => <M.TrayNumbered />,
  ],
];

function Round({ title, items }: { title: string; items: Item[] }) {
  return (
    <OptionRow title={title}>
      {items.map(([meta, render]) => (
        <OptionCard key={meta.id} meta={meta}>
          {render()}
        </OptionCard>
      ))}
    </OptionRow>
  );
}

export default function PickerRound() {
  return (
    <div
      className={`${FONT_VARIABLE_CLASSES} mx-auto w-full max-w-[1700px] space-y-12 bg-neutral-100 p-4 text-neutral-900 md:p-8`}
    >
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Round R3: the picker</h1>
        <p className="max-w-4xl text-sm text-neutral-700">
          Dev only page. Four decisions, five options each. Theme A, Fraunces
          and Inter. Real birds and our tokens, shown as mock-ups so you can
          compare looks side by side at desktop width. The source link is the
          21st.dev component the option is based on. The chosen one is installed
          with the shadcn command and adapted to our tokens. The list of 11,011
          birds is virtualized with the same library whichever look you choose.
        </p>
      </header>
      <Round title="Decision 1. Search input" items={SEARCH} />
      <Round title="Decision 2. Family filter" items={FAMILY} />
      <Round title="Decision 3. Bird chip and list" items={SPECIES} />
      <Round title="Decision 4. Your poster tray" items={TRAY} />
    </div>
  );
}
