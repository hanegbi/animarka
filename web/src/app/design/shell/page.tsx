import type { ReactNode } from "react";
import { FONT_VARIABLE_CLASSES } from "@/design/fonts";
import {
  BASE_TOKENS,
  Btn,
  Chip,
  ControlsPanel,
  DISPLAY,
  LayoutIcons,
  Option,
  PICK,
  PickerPanel,
  Panel,
  Poster,
  PosterStage,
  Seg,
  Swatches,
  TopBar,
  themeVars,
  type Tokens,
} from "@/design/mock";

const FRAME =
  "h-[720px] w-full overflow-hidden rounded-[var(--r-lg)] border shadow-[var(--shadow)] flex flex-col";

function Frame({ children }: { children: ReactNode }) {
  return (
    <div
      className={FRAME}
      style={{ ...themeVars(), borderColor: "var(--line)" }}
    >
      {children}
    </div>
  );
}

/* ---------- Desktop shells ---------- */

function S1() {
  return (
    <Frame>
      <TopBar />
      <div className="grid min-h-0 flex-1 grid-cols-[300px_1fr_280px]">
        <Panel title="Add birds">
          <PickerPanel />
        </Panel>
        <PosterStage />
        <Panel title="Style" className="border-r-0 border-l">
          <ControlsPanel />
        </Panel>
      </div>
    </Frame>
  );
}

function S2() {
  return (
    <Frame>
      <TopBar />
      <div
        className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b px-4 py-2"
        style={{ borderColor: "var(--line)", background: "var(--surface)" }}
      >
        <Seg items={["Field guide", "Woodblock"]} small />
        <LayoutIcons small />
        <Seg items={["Names", "Numbers", "No text"]} small />
        <Swatches />
        <Btn small>3:4 portrait</Btn>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[340px_1fr]">
        <Panel title="Add birds">
          <PickerPanel />
        </Panel>
        <PosterStage />
      </div>
    </Frame>
  );
}

function Rail() {
  const items = ["Birds", "Layout", "Style", "Back", "Export"];
  return (
    <nav
      className="flex w-[68px] flex-col items-center gap-1 border-r py-3"
      style={{ borderColor: "var(--line)", background: "var(--surface)" }}
      aria-label="Tools"
    >
      {items.map((t, i) => (
        <span
          key={t}
          className="flex w-14 flex-col items-center gap-0.5 rounded-[var(--r-md)] py-1.5 text-[10px]"
          style={
            i === 0
              ? {
                  background:
                    "color-mix(in srgb, var(--accent) 14%, var(--surface))",
                  color: "var(--accent)",
                }
              : { color: "var(--muted)" }
          }
        >
          <span className="size-5 rounded-[var(--r-sm)] border-2 border-current" />
          {t}
        </span>
      ))}
    </nav>
  );
}

function S3() {
  return (
    <Frame>
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <Rail />
        <Panel title="Add birds" className="w-[300px] shrink-0">
          <PickerPanel />
        </Panel>
        <PosterStage className="flex-1" />
      </div>
    </Frame>
  );
}

function Handle() {
  return (
    <span
      className="flex w-2 items-center justify-center"
      style={{ background: "var(--line)" }}
      aria-hidden
    >
      <span className="h-8 w-0.5 rounded bg-[var(--muted)]" />
    </span>
  );
}

function S4() {
  return (
    <Frame>
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <Panel title="Add birds" className="w-[28%]">
          <PickerPanel />
        </Panel>
        <Handle />
        <PosterStage className="flex-1" />
        <Handle />
        <Panel title="Style" className="w-[26%] border-r-0">
          <ControlsPanel />
        </Panel>
      </div>
    </Frame>
  );
}

function S5() {
  return (
    <Frame>
      <header className="flex items-center justify-between px-4 py-2.5">
        <span className="text-xl font-bold" style={{ fontFamily: DISPLAY }}>
          animarka
        </span>
        <span className="flex gap-2">
          <Btn small>Share</Btn>
          <Btn small primary>
            Export
          </Btn>
        </span>
      </header>
      <div className="relative flex min-h-0 flex-1">
        <PosterStage className="flex-1 pb-20" />
        <aside
          className="absolute top-2 right-2 bottom-20 w-[340px] rounded-[var(--r-lg)] border p-3 shadow-[var(--shadow-hi)]"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        >
          <p
            className="mb-2 text-[11px] font-semibold tracking-wide uppercase"
            style={{ color: "var(--muted)" }}
          >
            Add birds
          </p>
          <PickerPanel />
        </aside>
        <div
          className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-[var(--r-pill)] border px-4 py-2 shadow-[var(--shadow-hi)]"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        >
          <Btn small>Birds 12</Btn>
          <LayoutIcons small />
          <Seg small items={["Field guide", "Woodblock"]} />
          <Swatches />
          <Btn small>Undo</Btn>
        </div>
      </div>
    </Frame>
  );
}

/* ---------- Phone patterns ---------- */

function Phone({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="space-y-2">
      <div
        className="relative mx-auto flex h-[640px] w-[320px] flex-col overflow-hidden rounded-[28px] border-[6px] border-neutral-800"
        style={{ ...themeVars(), borderColor: "#262626" }}
        aria-label={label}
      >
        <header className="flex items-center justify-between px-3 py-2">
          <span className="text-base font-bold" style={{ fontFamily: DISPLAY }}>
            animarka
          </span>
          <span className="flex gap-1">
            <Btn small>Undo</Btn>
            <Btn small primary>
              Export
            </Btn>
          </span>
        </header>
        {children}
      </div>
    </div>
  );
}

function SheetBody({ tabs = true }: { tabs?: boolean }) {
  return (
    <>
      {tabs && (
        <div className="mb-2 flex gap-1.5 px-3">
          <span
            className="flex-1 rounded-[var(--r-md)] py-2 text-center text-xs font-semibold"
            style={{ background: "var(--accent)", color: "var(--on-accent)" }}
          >
            Birds 12
          </span>
          <span
            className="flex-1 rounded-[var(--r-md)] border py-2 text-center text-xs font-semibold"
            style={{ borderColor: "var(--line)" }}
          >
            Style
          </span>
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-hidden px-3">
        <PickerPanel small />
      </div>
    </>
  );
}

function Grab() {
  return (
    <span
      className="mx-auto mt-2 mb-1.5 block h-1.5 w-11 rounded-full"
      style={{ background: "var(--line)" }}
    />
  );
}

const SHEET =
  "absolute right-0 bottom-0 left-0 flex flex-col rounded-t-[var(--r-lg)] border-t shadow-[var(--shadow-hi)]";

function P1() {
  return (
    <Phone label="Three height sheet">
      <PosterStage className="h-[300px] shrink-0 px-8 py-2" />
      <div
        className={`${SHEET} h-[300px]`}
        style={{ borderColor: "var(--line)", background: "var(--surface)" }}
      >
        <Grab />
        <SheetBody />
      </div>
    </Phone>
  );
}

function P2() {
  return (
    <Phone label="Magnetic spring sheet">
      <PosterStage className="h-[300px] shrink-0 px-8 py-2" />
      <div
        className="absolute top-[200px] right-1 flex h-[300px] flex-col justify-between py-4"
        aria-hidden
      >
        {["Full", "Half", "Peek"].map((t, i) => (
          <span
            key={t}
            className="flex items-center gap-1 text-[9px]"
            style={{ color: i === 1 ? "var(--accent)" : "var(--muted)" }}
          >
            {t}
            <span
              className="size-2 rounded-full"
              style={{ background: i === 1 ? "var(--accent)" : "var(--line)" }}
            />
          </span>
        ))}
      </div>
      <div
        className={`${SHEET} mr-8 h-[300px]`}
        style={{ borderColor: "var(--line)", background: "var(--surface)" }}
      >
        <Grab />
        <SheetBody />
      </div>
    </Phone>
  );
}

function P3() {
  const tabs = ["Birds", "Layout", "Style", "Export"];
  return (
    <Phone label="Bottom tab bar">
      <PosterStage className="h-[330px] shrink-0 px-6 py-2" />
      <div
        className={`${SHEET} bottom-[56px] h-[210px]`}
        style={{ borderColor: "var(--line)", background: "var(--surface)" }}
      >
        <Grab />
        <div className="min-h-0 flex-1 overflow-hidden px-3">
          <PickerPanel small />
        </div>
      </div>
      <nav
        className="absolute right-0 bottom-0 left-0 flex h-[56px] border-t"
        style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        aria-label="Tools"
      >
        {tabs.map((t, i) => (
          <span
            key={t}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px]"
            style={{ color: i === 0 ? "var(--accent)" : "var(--muted)" }}
          >
            <span className="size-4 rounded-[4px] border-2 border-current" />
            {t}
          </span>
        ))}
      </nav>
    </Phone>
  );
}

function P4() {
  return (
    <Phone label="Sheet with sticky actions">
      <PosterStage className="h-[290px] shrink-0 px-8 py-2" />
      <div
        className={`${SHEET} h-[310px]`}
        style={{ borderColor: "var(--line)", background: "var(--surface)" }}
      >
        <Grab />
        <SheetBody />
        <div
          className="flex gap-1.5 border-t p-2"
          style={{ borderColor: "var(--line)" }}
        >
          <Btn small>Surprise mix</Btn>
          <Btn small>Shuffle</Btn>
          <span className="flex-1" />
          <Btn small primary>
            Export
          </Btn>
        </div>
      </div>
    </Phone>
  );
}

function P5() {
  return (
    <Phone label="Split screen">
      <PosterStage className="h-[300px] shrink-0 px-8 py-2" />
      <div
        className="flex min-h-0 flex-1 flex-col border-t"
        style={{ borderColor: "var(--line)", background: "var(--surface)" }}
      >
        <div className="flex gap-1.5 p-2">
          <span
            className="flex-1 rounded-[var(--r-md)] py-2 text-center text-xs font-semibold"
            style={{ background: "var(--accent)", color: "var(--on-accent)" }}
          >
            Birds 12
          </span>
          <span
            className="flex-1 rounded-[var(--r-md)] border py-2 text-center text-xs font-semibold"
            style={{ borderColor: "var(--line)" }}
          >
            Style
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden px-3">
          <PickerPanel small />
        </div>
      </div>
    </Phone>
  );
}

/* ---------- Radius and shadow ---------- */

const RADII: { id: string; name: string; t: Partial<Tokens> }[] = [
  {
    id: "1",
    name: "Square, 0 px",
    t: { rSm: "0px", rMd: "0px", rLg: "0px", rPill: "0px" },
  },
  {
    id: "2",
    name: "Crisp, 4 px",
    t: { rSm: "2px", rMd: "4px", rLg: "6px", rPill: "4px" },
  },
  {
    id: "3",
    name: "Soft, 10 px",
    t: { rSm: "6px", rMd: "10px", rLg: "16px", rPill: "999px" },
  },
  {
    id: "4",
    name: "Round, 16 px",
    t: { rSm: "10px", rMd: "16px", rLg: "24px", rPill: "999px" },
  },
  {
    id: "5",
    name: "Pill, full",
    t: { rSm: "12px", rMd: "999px", rLg: "28px", rPill: "999px" },
  },
];

const SHADOWS: { id: string; name: string; shadow: string; hi: string }[] = [
  { id: "1", name: "Flat, borders only", shadow: "none", hi: "none" },
  {
    id: "2",
    name: "Whisper",
    shadow: "0 1px 2px rgb(30 27 22 / 0.06)",
    hi: "0 4px 14px rgb(30 27 22 / 0.10)",
  },
  {
    id: "3",
    name: "Paper stack",
    shadow:
      "0 1px 0 rgb(30 27 22 / 0.06), 0 2px 6px rgb(120 90 40 / 0.12), 0 8px 18px rgb(120 90 40 / 0.08)",
    hi: "0 14px 34px rgb(120 90 40 / 0.28)",
  },
  {
    id: "4",
    name: "Lifted",
    shadow: "0 2px 4px rgb(30 27 22 / 0.10), 0 10px 24px rgb(30 27 22 / 0.14)",
    hi: "0 24px 50px rgb(30 27 22 / 0.30)",
  },
  {
    id: "5",
    name: "Ring and glow",
    shadow: "0 0 0 1px rgb(44 107 79 / 0.18), 0 4px 14px rgb(44 107 79 / 0.14)",
    hi: "0 0 0 1px rgb(44 107 79 / 0.25), 0 16px 40px rgb(44 107 79 / 0.28)",
  },
];

function TokenSample({ tokens }: { tokens: Tokens }) {
  return (
    <div
      className="space-y-3 rounded-[var(--r-lg)] border p-4 shadow-[var(--shadow)]"
      style={{
        ...themeVars(tokens),
        borderColor: "var(--line)",
        background: "var(--surface)",
      }}
    >
      <div className="flex flex-wrap gap-2">
        <Btn primary>Export</Btn>
        <Btn>Undo</Btn>
      </div>
      <Seg items={["Field guide", "Woodblock"]} small />
      <div className="flex flex-wrap gap-1.5">
        <Chip id={PICK[0]} on small />
        <Chip id={PICK[1]} small />
      </div>
      <div
        className="rounded-[var(--r-md)] border px-3 py-2 text-xs"
        style={{ borderColor: "var(--line)", color: "var(--muted)" }}
      >
        Search all birds
      </div>
      <div className="@container mx-auto w-24">
        <Poster />
      </div>
    </div>
  );
}

export default function ShellRound() {
  return (
    <div
      className={`${FONT_VARIABLE_CLASSES} mx-auto max-w-[1560px] space-y-12 bg-neutral-100 p-4 text-neutral-900 md:p-8`}
    >
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">
          Round R2: app shell, phone pattern, radius and shadow
        </h1>
        <p className="max-w-3xl text-sm text-neutral-700">
          Dev only page. Theme A with Fraunces and Inter, as chosen in R1.
          Desktop options come first, each drawn at 1280 px wide or more. The
          phone patterns follow, side by side on this wide page.
        </p>
      </header>

      <section aria-labelledby="d1" className="space-y-8">
        <h2 id="d1" className="text-2xl font-semibold">
          Decision 1. Desktop shell
        </h2>
        <Option
          id="S1"
          name="Three columns"
          rec
          source={{
            label: "shadcn Sidebar",
            url: "https://21st.dev/@shadcn/components/sidebar",
          }}
        >
          <S1 />
          <p className="text-sm text-neutral-700">
            Picker left, poster center, style right. Everything visible at once.
            Strength: no hunting, poster stays centered. Weakness: the poster
            gets about 700 px of width on a 1280 px screen.
          </p>
        </Option>
        <Option
          id="S2"
          name="Picker and top toolbar"
          source={{
            label: "Dashboard Shell",
            url: "https://21st.dev/@isaiahbjork/components/app-dashboard-shell",
          }}
        >
          <S2 />
          <p className="text-sm text-neutral-700">
            Picker left, every style control in one toolbar above the poster.
            Strength: poster gets the most width and the toolbar scans like
            Canva. Weakness: the toolbar crowds on screens under 1100 px.
          </p>
        </Option>
        <Option
          id="S3"
          name="Icon rail with flyout"
          source={{
            label: "Sidebar by wensity",
            url: "https://21st.dev/@wensity/components/sidebar",
          }}
        >
          <S3 />
          <p className="text-sm text-neutral-700">
            A thin rail of tools opens one panel at a time. Strength: tidy,
            grows when we add mammals and more styles. Weakness: one panel at a
            time means more clicks between picking birds and changing style.
          </p>
        </Option>
        <Option
          id="S4"
          name="Resizable panes"
          source={{
            label: "Resizable by preetsuthar17",
            url: "https://21st.dev/@preetsuthar17/components/resizable",
          }}
        >
          <S4 />
          <p className="text-sm text-neutral-700">
            Same as three columns, but the user drags the dividers. Strength:
            power users give the poster more room. Weakness: more code and a
            state to save. Few visitors will ever drag it.
          </p>
        </Option>
        <Option
          id="S5"
          name="Poster first with floating dock"
          source={{
            label: "Drawer by coss.com",
            url: "https://21st.dev/@coss.com/components/drawer",
          }}
        >
          <S5 />
          <p className="text-sm text-neutral-700">
            Poster fills the stage. Tools sit in a floating dock and the picker
            floats on the right. Strength: the poster is the hero, as the PRD
            says. Weakness: floating panels can cover the poster edge, which
            breaks the rule that controls never cover it.
          </p>
        </Option>
        <p className="text-sm">
          <b>My pick: S1.</b> It is the only one that shows picking and styling
          together with no extra clicks. S2 is the close second if you want a
          larger poster.
        </p>
      </section>

      <section aria-labelledby="d2" className="space-y-6">
        <h2 id="d2" className="text-2xl font-semibold">
          Decision 2. Phone pattern
        </h2>
        <p className="max-w-3xl text-sm text-neutral-700">
          The phone shows the poster on top, always in view. The five patterns
          differ in how the controls reach it.
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-8">
          <Option
            id="P1"
            name="Three height sheet"
            rec
            source={{
              label: "Drawer by wensity",
              url: "https://21st.dev/@wensity/components/drawer",
            }}
          >
            <P1 />
            <p className="text-sm text-neutral-700">
              Drag handle with peek, half and full heights, Birds and Style
              tabs. Strength: what the prototype does, proven. Weakness: at full
              height the sheet covers the poster, so users lose sight of it.
            </p>
          </Option>
          <Option
            id="P2"
            name="Magnetic spring sheet"
            source={{
              label: "Magnetic Drawer by animbits",
              url: "https://21st.dev/@animbits/components/specials-magnetic-drawer",
            }}
          >
            <P2 />
            <p className="text-sm text-neutral-700">
              Same heights, but the sheet snaps with a spring feel. Strength:
              feels alive. Weakness: more motion to make accessible, and it
              ignores reduced motion unless we handle it.
            </p>
          </Option>
          <Option
            id="P3"
            name="Bottom tab bar"
            source={{
              label: "Drawer by coss.com",
              url: "https://21st.dev/@coss.com/components/drawer",
            }}
          >
            <P3 />
            <p className="text-sm text-neutral-700">
              Four tabs at the thumb: Birds, Layout, Style, Export. A tab opens
              a short sheet. Strength: easy to find, thumb friendly. Weakness:
              two taps to switch between picking and styling, and the picker
              gets less height.
            </p>
          </Option>
          <Option
            id="P4"
            name="Sheet with sticky actions"
            source={{
              label: "Astryx Bottom Sheet",
              url: "https://21st.dev/@Astryxdesign/components/astryx-bottom-sheet",
            }}
          >
            <P4 />
            <p className="text-sm text-neutral-700">
              The sheet keeps Surprise mix, Shuffle and Export pinned at its
              foot. Strength: key actions never scroll away. Weakness: the
              pinned bar takes list height on small phones.
            </p>
          </Option>
          <Option
            id="P5"
            name="Split screen, no overlay"
            source={{
              label: "Resizable by kemiljk",
              url: "https://21st.dev/@kemiljk/components/resizable",
            }}
          >
            <P5 />
            <p className="text-sm text-neutral-700">
              Poster fixed on top, a scrolling panel below. Nothing covers the
              poster. Strength: the poster is always fully visible, simplest to
              build and test. Weakness: the picker list is short, about five
              rows.
            </p>
          </Option>
        </div>
        <p className="text-sm">
          <b>My pick: P1.</b> It fixes the prototype&apos;s main flaw (poster
          below the picker), and I would cap full height so the poster top stays
          visible.
        </p>
      </section>

      <section aria-labelledby="d3" className="space-y-6">
        <h2 id="d3" className="text-2xl font-semibold">
          Decision 3. Corner radius
        </h2>
        <p className="text-sm text-neutral-700">
          Source for all five: the shadcn/ui <code>--radius</code> token,
          https://ui.shadcn.com/docs/theming.
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          {RADII.map((r) => (
            <div key={r.id} className="space-y-2">
              <h3 className="font-semibold">
                R{r.id}. {r.name}{" "}
                {r.id === "3" && (
                  <span className="ml-1 rounded bg-green-900 px-2 py-0.5 text-xs font-normal text-white">
                    Recommended
                  </span>
                )}
              </h3>
              <TokenSample tokens={{ ...BASE_TOKENS, ...r.t }} />
            </div>
          ))}
        </div>
        <ul className="max-w-3xl list-disc space-y-1 pl-5 text-sm text-neutral-700">
          <li>
            <b>R1 Square:</b> strongest print and field guide feel. It looks
            stern and dated for a friendly tool.
          </li>
          <li>
            <b>R2 Crisp:</b> neat and editorial. Slightly cold next to the soft
            bird art.
          </li>
          <li>
            <b>R3 Soft (recommended):</b> friendly without being childish, and
            it echoes the rounded bird shapes.
          </li>
          <li>
            <b>R4 Round:</b> warm and modern. Large radii waste space in the
            dense picker.
          </li>
          <li>
            <b>R5 Pill:</b> playful. Pill buttons beside soft cards feels busy
            in a tool with many controls.
          </li>
        </ul>
      </section>

      <section aria-labelledby="d4" className="space-y-6">
        <h2 id="d4" className="text-2xl font-semibold">
          Decision 4. Shadow
        </h2>
        <p className="text-sm text-neutral-700">
          Source for all five: the shadcn/ui shadow tokens,
          https://ui.shadcn.com/docs/theming. Poster shadow follows the same
          step.
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          {SHADOWS.map((s) => (
            <div key={s.id} className="space-y-2">
              <h3 className="font-semibold">
                D{s.id}. {s.name}{" "}
                {s.id === "3" && (
                  <span className="ml-1 rounded bg-green-900 px-2 py-0.5 text-xs font-normal text-white">
                    Recommended
                  </span>
                )}
              </h3>
              <TokenSample
                tokens={{ ...BASE_TOKENS, shadow: s.shadow, shadowHi: s.hi }}
              />
            </div>
          ))}
        </div>
        <ul className="max-w-3xl list-disc space-y-1 pl-5 text-sm text-neutral-700">
          <li>
            <b>D1 Flat:</b> cleanest and cheapest to render. The poster does not
            lift off the page.
          </li>
          <li>
            <b>D2 Whisper:</b> barely there. Safe, forgettable.
          </li>
          <li>
            <b>D3 Paper stack (recommended):</b> warm shadow tinted brown, so
            the poster looks like a sheet on a table. Fits theme A.
          </li>
          <li>
            <b>D4 Lifted:</b> strong depth, a more app like look. Heavy on a
            paper theme.
          </li>
          <li>
            <b>D5 Ring and glow:</b> green tinted. Distinctive, but it looks
            like focus state styling everywhere.
          </li>
        </ul>
      </section>
    </div>
  );
}
