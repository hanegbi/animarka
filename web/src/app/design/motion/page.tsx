import type { ReactNode } from "react";
import { FONT_VARIABLE_CLASSES } from "@/design/fonts";
import { OptionCard, OptionRow, type OptionMeta } from "@/design/option-card";
import * as M from "@/design/r5-mocks";

type Item = [OptionMeta, () => ReactNode];

const MOTION: Item[] = [
  [
    {
      id: "M1",
      name: "Quick ease out, 200 ms",
      rec: true,
      source: {
        label:
          "plain CSS, no library. For the library route see Reorder items by motiondotdev",
        url: "https://21st.dev/@motiondotdev/components/motion-reorder-items",
      },
      how: "Birds glide to their new places in 200 ms and stop softly. The mirror is a quick 180 ms flip. Click Rearrange and Flip the owl to feel it.",
      strength:
        "Matches the PRD (about 200 ms). No dependency, so it costs nothing in page weight.",
      weakness: "Plain. No bounce or personality.",
    },
    () => <M.MotionDemo kind="ease" />,
  ],
  [
    {
      id: "M2",
      name: "Springy, with a little overshoot",
      source: {
        label: "Reorder items by motiondotdev",
        url: "https://21st.dev/@motiondotdev/components/motion-reorder-items",
      },
      how: "Birds overshoot a little and settle, about half a second. Shown here as a close CSS copy. The real thing uses the Motion library.",
      strength: "Playful. Feels alive.",
      weakness:
        "Slower than the 200 ms in the PRD, and the real version adds the Motion library (about 30 KB).",
    },
    () => <M.MotionDemo kind="spring" />,
  ],
  [
    {
      id: "M3",
      name: "Staggered, one after another",
      source: {
        label: "Layout animation by motiondotdev",
        url: "https://21st.dev/@motiondotdev/components/motion-layout-animation",
      },
      how: "Same glide as M1, but each bird starts 35 ms after the last, like a ripple.",
      strength: "Nice for a few birds. Draws the eye along the new order.",
      weakness:
        "With 150 birds the ripple lasts over 5 seconds, so the delay must be capped.",
    },
    () => <M.MotionDemo kind="stagger" />,
  ],
  [
    {
      id: "M4",
      name: "Fade and pop, no travel",
      source: {
        label: "Enter animation by motiondotdev",
        url: "https://21st.dev/@motiondotdev/components/motion-enter-animation",
      },
      how: "Birds appear in their new places with a short fade and a small scale up. Nothing slides across.",
      strength:
        "Calm. Works with 150 birds, and there is never a bird in the way of another.",
      weakness: "You cannot follow where a bird went.",
    },
    () => <M.MotionDemo kind="pop" />,
  ],
  [
    {
      id: "M5",
      name: "No motion",
      source: {
        label: "plain CSS, nothing to install",
        url: "https://ui.shadcn.com/docs/theming",
      },
      how: "Everything jumps to the new arrangement and the owl flips at once.",
      strength:
        "Fastest and simplest. It is also what people with reduced motion get.",
      weakness: "Feels abrupt, and you lose track of which bird is which.",
    },
    () => <M.MotionDemo kind="none" />,
  ],
];

const DND: Item[] = [
  [
    {
      id: "D1",
      name: "dnd-kit sortable grid",
      rec: true,
      source: {
        label: "Sortable List by ebnsina",
        url: "https://21st.dev/@ebnsina/components/sortable",
      },
      how: "Drag a bird onto another to swap. Pointer, touch and keyboard sensors with spoken hints, and edge scrolling.",
      strength:
        "Tested for touch and screen readers. Our keyboard path comes ready.",
      weakness: "About 12 KB, and a library to keep up to date.",
    },
    () => <M.DnDKit />,
  ],
  [
    {
      id: "D2",
      name: "Our own pointer events",
      source: {
        label: "Drag Item by ai2 (the visual states only)",
        url: "https://21st.dev/@ai2/components/item-drag",
      },
      how: "A small piece of our own code, as in the prototype. Arrow keys move a focused bird.",
      strength: "Smallest, and we control every detail.",
      weakness: "We must test touch, scrolling and screen readers ourselves.",
    },
    () => <M.DnDPointer />,
  ],
  [
    {
      id: "D3",
      name: "Swapy, a swap library",
      source: {
        label: "Draggable Grid Dashboard by uilayout.contact",
        url: "https://21st.dev/@uilayout.contact/components/default-swapy",
      },
      how: "Made for swapping. The dragged bird leaves a dashed slot and the other slides into it.",
      strength: "The animation is built in and looks polished.",
      weakness: "Keyboard support is limited, and it is a smaller project.",
    },
    () => <M.DnDSwapy />,
  ],
  [
    {
      id: "D4",
      name: "Tap two birds to swap",
      source: {
        label: "no matching 21st.dev component, so this would be custom",
        url: "https://21st.dev/@diceui/components/sortable",
      },
      how: "No dragging. Tap one bird, it gets a ring, tap another and they swap.",
      strength: "Works with no precision and no scrolling trouble on a phone.",
      weakness:
        "The PRD says tap mirrors the bird, so swapping needs a mode switch.",
    },
    () => <M.DnDTap />,
  ],
  [
    {
      id: "D5",
      name: "Reorder in the tray only",
      source: {
        label: "Sortable by sean0205",
        url: "https://21st.dev/@sean0205/components/sortable",
      },
      how: "The poster only mirrors on tap. Reordering is done in the tray with grip handles.",
      strength: "Simple to make accessible. No dragging over a busy poster.",
      weakness: "Drops the PRD's drag one bird onto another on the poster.",
    },
    () => <M.DnDTray />,
  ],
];

const TOAST: Item[] = [
  [
    {
      id: "T1",
      name: "Single toast with Undo",
      rec: true,
      source: {
        label: "Toast by ghaerdi (Sonner)",
        url: "https://21st.dev/@ghaerdi/components/toast",
      },
      how: "One toast at the bottom, gone after 5 seconds. Used for Link copied, Poster saved and Removed with Undo.",
      strength: "The shadcn default. Small and well tested.",
      weakness: "Plain look.",
    },
    () => <M.ToastSonner />,
  ],
  [
    {
      id: "T2",
      name: "Stacked toasts",
      source: {
        label: "Toast by cnippet-dev (Base UI)",
        url: "https://21st.dev/@cnippet-dev/components/toast",
      },
      how: "Several toasts stack and fan out on hover.",
      strength: "Built on Base UI, the same library as our components.",
      weakness: "We rarely have more than one message, so the stack is wasted.",
    },
    () => <M.ToastStack />,
  ],
  [
    {
      id: "T3",
      name: "Morphing pill",
      source: {
        label: "Ding Toast by yusufceng1z",
        url: "https://21st.dev/@yusufceng1z/components/ding-toast",
      },
      how: "One pill. A new message morphs it in place with a spring.",
      strength: "Playful and small.",
      weakness: "One message at a time, and no room for an Undo button.",
    },
    () => <M.ToastMorph />,
  ],
  [
    {
      id: "T4",
      name: "Undo toast with countdown",
      source: {
        label: "Animated Toast by dev.shejanmahamud",
        url: "https://21st.dev/@dev.shejanmahamud/components/animated-toast",
      },
      how: "A toast with an Undo button and a countdown bar, for every destructive action.",
      strength: "Makes Nothing is lost visible. Clear.",
      weakness: "Heavy for simple messages like Link copied.",
    },
    () => <M.ToastUndo />,
  ],
  [
    {
      id: "T5",
      name: "Message bar in the panel",
      source: {
        label: "Alert by sean0205",
        url: "https://21st.dev/@sean0205/components/alert-1",
      },
      how: "No floating toast. A bar inside the panel, read aloud by screen readers.",
      strength: "Never covers the poster, as the PRD requires.",
      weakness: "Easy to miss, and Undo has little room.",
    },
    () => <M.ToastInline />,
  ],
];

const TIP: Item[] = [
  [
    {
      id: "P1",
      name: "Plain label",
      source: {
        label: "Tooltip by shadcn",
        url: "https://21st.dev/@shadcn/components/tooltip",
      },
      how: "A dark label on hover and focus. For bird thumbnails and icon buttons.",
      strength: "The shadcn default. Light and accessible.",
      weakness: "Tells you nothing beyond the name.",
    },
    () => <M.TipShadcn />,
  ],
  [
    {
      id: "P2",
      name: "Label with shortcut and Latin name",
      rec: true,
      source: {
        label: "Tooltip by wensity",
        url: "https://21st.dev/@wensity/components/tooltip",
      },
      how: "The same label, plus the keyboard shortcut on buttons and the scientific name on birds.",
      strength: "Teaches the shortcuts, and bird lovers like the Latin name.",
      weakness: "Slightly bigger bubble.",
    },
    () => <M.TipShortcut />,
  ],
  [
    {
      id: "P3",
      name: "Small bird card",
      source: {
        label: "Tooltip by originui",
        url: "https://21st.dev/@originui/components/tooltip",
      },
      how: "A card with a larger picture, the family and the weight.",
      strength: "Rich and informative.",
      weakness:
        "Heavy for every thumbnail, and hover only, so nothing on a phone.",
    },
    () => <M.TipCard />,
  ],
  [
    {
      id: "P4",
      name: "Plain label with a delay",
      source: {
        label: "Tooltip by mayurrawte",
        url: "https://21st.dev/@mayurrawte/components/tooltip",
      },
      how: "The plain label, shown after 600 ms so it does not flash as you pass.",
      strength: "Calm for a toolbar.",
      weakness: "Feels slow if you are looking for the name.",
    },
    () => <M.TipDelay />,
  ],
  [
    {
      id: "P5",
      name: "Browser tooltip",
      source: {
        label: "no component, the title attribute",
        url: "https://21st.dev/@sean0205/components/tooltip",
      },
      how: "The browser's own title tooltip.",
      strength: "Zero code, zero weight.",
      weakness:
        "Looks different everywhere, never shows on touch, no shortcut hints.",
    },
    () => <M.TipNative />,
  ],
];

const EMPTY: Item[] = [
  [
    {
      id: "E1",
      name: "Text and two buttons",
      rec: true,
      source: {
        label: "Empty State by serafimcloud",
        url: "https://21st.dev/@serafimcloud/components/empty-state",
      },
      how: "On the empty poster: Your poster is empty, a hint, and Surprise mix and a preset as buttons.",
      strength: "Tells you what to do and does it in one tap.",
      weakness: "Plain.",
    },
    () => <M.EmptyCard />,
  ],
  [
    {
      id: "E2",
      name: "Ghost poster",
      source: {
        label: "Empty by cnippet-dev",
        url: "https://21st.dev/@cnippet-dev/components/cnippet-empty",
      },
      how: "A faint poster with empty slots and the line Tap a bird to place it.",
      strength: "Shows what the result will look like.",
      weakness: "No buttons, so the first step is less obvious.",
    },
    () => <M.EmptyGhost />,
  ],
  [
    {
      id: "E3",
      name: "Search miss with suggestions",
      source: {
        label: "Search Empty State by arihantcodes",
        url: "https://21st.dev/@arihantcodes_1f7b8c4d/components/search-empty",
      },
      how: "For a search with no result: the words typed and chips to try.",
      strength: "Gets the visitor out of the dead end.",
      weakness:
        "Only fits the search, so it needs a second design for the empty poster.",
    },
    () => <M.EmptySearch />,
  ],
  [
    {
      id: "E4",
      name: "Faded placeholder rows",
      source: {
        label: "Empty State with Marquee by shadcnui-blocks",
        url: "https://21st.dev/@shadcnui-blocks/components/empty-state-04",
      },
      how: "Faded gray rows with a short line.",
      strength: "Pretty.",
      weakness: "Says nothing about what to do next.",
    },
    () => <M.EmptyMarquee />,
  ],
  [
    {
      id: "E5",
      name: "Icon and one line",
      source: {
        label: "Empty State by wensity",
        url: "https://21st.dev/@wensity/components/empty-state",
      },
      how: "A small feather, a title and one hint.",
      strength: "Quietest.",
      weakness: "No action, and an emoji may look different on each device.",
    },
    () => <M.EmptyIcon />,
  ],
];

const LOAD: Item[] = [
  [
    {
      id: "L1",
      name: "Shimmer cards",
      source: {
        label: "Skeleton Loader by animbits",
        url: "https://21st.dev/@animbits/components/loaders-skeleton",
      },
      how: "Gray card shapes with a moving shine where the bird cards will be.",
      strength: "Familiar. Keeps the list height.",
      weakness:
        "A moving shine is extra motion for reduced motion users, so it must stop.",
    },
    () => <M.LoadShimmer />,
  ],
  [
    {
      id: "L2",
      name: "Poster-shaped skeleton",
      rec: true,
      source: {
        label: "Skeleton by hero_ui",
        url: "https://21st.dev/@hero_ui/components/skeleton",
      },
      how: "The poster outline with soft blocks, so the page does not jump when the real poster arrives.",
      strength:
        "Right shape, so no layout shift. Fits the first poster in 2 seconds goal.",
      weakness: "Only for the first load.",
    },
    () => <M.LoadPoster />,
  ],
  [
    {
      id: "L3",
      name: "Cards that fade in",
      source: {
        label: "Skeleton Swap by ddoemonn",
        url: "https://21st.dev/@ddoemonn/components/skeleton-swap",
      },
      how: "Each card holds its size and the picture fades in over a gray block.",
      strength:
        "No layout shift. Great for the 11,011 thumbnails loading as you scroll.",
      weakness:
        "Not a full page loader, so it needs to be paired with another.",
    },
    () => <M.LoadSwap />,
  ],
  [
    {
      id: "L4",
      name: "Thin bar and a line",
      source: {
        label: "Skeleton by mayurrawte",
        url: "https://21st.dev/@mayurrawte/components/skeleton",
      },
      how: "A thin progress bar and the words Loading your poster.",
      strength: "Honest and cheap.",
      weakness: "Hides the layout, so the page jumps when ready.",
    },
    () => <M.LoadProgress />,
  ],
  [
    {
      id: "L5",
      name: "Birds fading in",
      source: {
        label: "Shapes Skeleton by ai2",
        url: "https://21st.dev/@ai2/components/skeleton-shapes",
      },
      how: "Four real birds fade in one after another with the line Gathering your birds.",
      strength: "On brand.",
      weakness:
        "A decoration that needs images loaded to work, which defeats a loading state.",
    },
    () => <M.LoadBirds />,
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

export default function MotionRound() {
  return (
    <div
      className={`${FONT_VARIABLE_CLASSES} mx-auto w-full max-w-[1700px] space-y-12 bg-neutral-100 p-4 text-neutral-900 md:p-8`}
    >
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">
          Round R5: motion, drag and drop, messages and waiting
        </h1>
        <p className="max-w-4xl text-sm text-neutral-700">
          Dev only page. Six decisions, five options each. Theme A, Fraunces and
          Inter. The motion options are live: click Rearrange and Flip the owl
          in each one. Everything respects reduced motion. Source links are the
          21st.dev components each option is based on, or are marked when
          nothing matches.
        </p>
      </header>
      <Round
        title="Decision 1. Motion when birds move and flip"
        items={MOTION}
      />
      <Round title="Decision 2. Drag and drop" items={DND} />
      <Round title="Decision 3. Messages (toasts)" items={TOAST} />
      <Round title="Decision 4. Tooltips" items={TIP} />
      <Round title="Decision 5. Empty states" items={EMPTY} />
      <Round title="Decision 6. Loading states" items={LOAD} />
    </div>
  );
}
