/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { BACKGROUNDS } from "@/catalog/backgrounds";
import { DOTS } from "./mock";
import { Stage } from "./picker-mocks";

/** Static mock-ups for round R4. Real data, our tokens. Nothing here ships. */

const MUTED = { color: "var(--muted)" };
const OUTLINE = { borderColor: "var(--line)" };
const FILLED = {
  background: "var(--accent)",
  color: "var(--on-accent)",
  borderColor: "var(--accent)",
};
const SOFT = "color-mix(in srgb, var(--accent) 12%, var(--surface))";
const ART = "/art/fg/falco-peregrinus.webp";
const ART_WB = "/art/wb/falco-peregrinus.webp";

const Label = ({ children }: { children: ReactNode }) => (
  <p
    className="mb-1.5 text-[10px] font-semibold tracking-wide uppercase"
    style={MUTED}
  >
    {children}
  </p>
);

const Chevron = () => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

function Glyph({
  kind,
  size = 36,
}: {
  kind: "scatter" | "grid" | "center";
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 44 44"
      width={size}
      height={size}
      aria-hidden
      fill="currentColor"
    >
      {DOTS[kind].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} />
      ))}
    </svg>
  );
}

const STYLES = ["Field guide", "Woodblock"];
const LABELS = ["Names", "Numbers", "No text"];

/* ---------- Segmented control ---------- */

export function SegThumb() {
  const row = (items: string[]) => (
    <div
      className="inline-flex rounded-full p-1"
      style={{
        background: "color-mix(in srgb, var(--text) 8%, var(--surface))",
      }}
    >
      {items.map((t, i) => (
        <span
          key={t}
          className="rounded-full px-3 py-1.5 text-sm"
          style={
            i === 0
              ? {
                  background: "var(--surface)",
                  boxShadow: "var(--shadow)",
                  fontWeight: 600,
                }
              : MUTED
          }
        >
          {t}
        </span>
      ))}
    </div>
  );
  return (
    <Stage>
      <Label>Design</Label>
      {row(STYLES)}
      <div className="mt-3">
        <Label>Labels</Label>
        {row(LABELS)}
      </div>
      <p className="mt-3 text-xs" style={MUTED}>
        A white thumb slides between options.
      </p>
    </Stage>
  );
}

export function SegPill() {
  const row = (items: string[]) => (
    <div role="radiogroup" className="inline-flex gap-1.5">
      {items.map((t, i) => (
        <span
          key={t}
          className="rounded-full border px-3 py-1.5 text-sm"
          style={i === 0 ? FILLED : OUTLINE}
        >
          {t}
        </span>
      ))}
    </div>
  );
  return (
    <Stage>
      <Label>Design</Label>
      {row(STYLES)}
      <div className="mt-3">
        <Label>Labels</Label>
        {row(LABELS)}
      </div>
      <p className="mt-3 text-xs" style={MUTED}>
        Separate pills. A radio group with arrow-key focus.
      </p>
    </Stage>
  );
}

export function SegHairline() {
  const row = (items: string[]) => (
    <div
      className="inline-flex overflow-hidden rounded-[var(--r-md)] border"
      style={OUTLINE}
    >
      {items.map((t, i) => (
        <span
          key={t}
          className="px-3 py-1.5 text-sm"
          style={{
            ...(i === 0
              ? { background: SOFT, fontWeight: 600, color: "var(--accent)" }
              : {}),
            borderInlineStart: i ? "1px solid var(--line)" : undefined,
          }}
        >
          {t}
        </span>
      ))}
    </div>
  );
  return (
    <Stage>
      <Label>Design</Label>
      {row(STYLES)}
      <div className="mt-3">
        <Label>Labels</Label>
        {row(LABELS)}
      </div>
      <p className="mt-3 text-xs" style={MUTED}>
        One bordered bar with hairlines. Calm and compact.
      </p>
    </Stage>
  );
}

export function SegUnderline() {
  const row = (items: string[]) => (
    <div className="flex gap-5 border-b" style={OUTLINE}>
      {items.map((t, i) => (
        <span
          key={t}
          className="pb-1.5 text-sm"
          style={
            i === 0
              ? {
                  borderBottom: "2px solid var(--accent)",
                  fontWeight: 600,
                  marginBottom: -1,
                }
              : MUTED
          }
        >
          {t}
        </span>
      ))}
    </div>
  );
  return (
    <Stage>
      <Label>Design</Label>
      {row(STYLES)}
      <div className="mt-3">
        <Label>Labels</Label>
        {row(LABELS)}
      </div>
      <p className="mt-3 text-xs" style={MUTED}>
        Underline tabs. Lightest, but reads as page navigation.
      </p>
    </Stage>
  );
}

export function SegPreviewCards() {
  const card = (src: string, name: string, on: boolean) => (
    <span
      key={name}
      className="flex flex-1 flex-col items-center gap-1 rounded-[var(--r-md)] border p-2 text-xs"
      style={{
        borderColor: on ? "var(--accent)" : "var(--line)",
        background: on ? SOFT : "var(--surface)",
        boxShadow: on ? "0 0 0 1px var(--accent)" : undefined,
      }}
    >
      <img src={src} alt="" className="h-14 object-contain" />
      {name}
    </span>
  );
  const mini = (name: string, kind: "names" | "num" | "none", on: boolean) => (
    <span
      key={name}
      className="flex flex-1 flex-col items-center gap-0.5 rounded-[var(--r-md)] border p-1.5 text-[10px]"
      style={{
        borderColor: on ? "var(--accent)" : "var(--line)",
        background: on ? SOFT : "var(--surface)",
      }}
    >
      <img src={ART} alt="" className="h-8 object-contain" />
      <span className="h-3 text-[8px]" style={MUTED}>
        {kind === "names" ? "Peregrine" : kind === "num" ? "1" : ""}
      </span>
      {name}
    </span>
  );
  return (
    <Stage>
      <Label>Design</Label>
      <div className="flex gap-2">
        {card(ART, "Field guide", true)}
        {card(ART_WB, "Woodblock", false)}
      </div>
      <div className="mt-3">
        <Label>Labels</Label>
        <div className="flex gap-2">
          {mini("Names", "names", true)}
          {mini("Numbers", "num", false)}
          {mini("No text", "none", false)}
        </div>
      </div>
    </Stage>
  );
}

/* ---------- Layout buttons ---------- */

const LAYOUTS: {
  id: "scatter" | "grid" | "center";
  name: string;
  desc: string;
}[] = [
  { id: "scatter", name: "Scattered", desc: "Loose and hand placed" },
  { id: "grid", name: "Grid", desc: "Straight rows" },
  { id: "center", name: "Centerpiece", desc: "One big, the rest around" },
];

export function LayoutCards() {
  return (
    <Stage>
      <div role="radiogroup" className="grid grid-cols-3 gap-2">
        {LAYOUTS.map((l, i) => (
          <span
            key={l.id}
            className="flex flex-col items-center gap-1 rounded-[var(--r-md)] border px-1 py-2 text-xs"
            style={{
              borderColor: i === 0 ? "var(--accent)" : "var(--line)",
              background: i === 0 ? SOFT : "var(--surface)",
              color: i === 0 ? "var(--accent)" : "var(--text)",
            }}
          >
            <Glyph kind={l.id} />
            {l.name}
          </span>
        ))}
      </div>
    </Stage>
  );
}

export function LayoutJoined() {
  return (
    <Stage>
      <div
        role="radiogroup"
        className="inline-flex w-full overflow-hidden rounded-[var(--r-md)] border"
        style={OUTLINE}
      >
        {LAYOUTS.map((l, i) => (
          <span
            key={l.id}
            className="flex flex-1 flex-col items-center gap-1 py-2 text-xs"
            style={{
              ...(i === 0 ? FILLED : {}),
              borderInlineStart: i ? "1px solid var(--line)" : undefined,
            }}
          >
            <Glyph kind={l.id} size={28} />
            {l.name}
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        One joined control. Smaller icons, selected segment filled.
      </p>
    </Stage>
  );
}

export function LayoutTiles() {
  return (
    <Stage>
      <div role="radiogroup" className="grid grid-cols-3 gap-2">
        {LAYOUTS.map((l, i) => (
          <span
            key={l.id}
            className="flex flex-col items-center gap-1 rounded-[var(--r-lg)] border p-2 text-center"
            style={{
              borderColor: i === 0 ? "var(--accent)" : "var(--line)",
              boxShadow: i === 0 ? "0 0 0 1px var(--accent)" : undefined,
            }}
          >
            <span style={{ color: i === 0 ? "var(--accent)" : "var(--text)" }}>
              <Glyph kind={l.id} size={44} />
            </span>
            <b className="text-xs">{l.name}</b>
            <span className="text-[10px] leading-tight" style={MUTED}>
              {l.desc}
            </span>
          </span>
        ))}
      </div>
    </Stage>
  );
}

export function LayoutHorizontal() {
  return (
    <Stage>
      <div role="radiogroup" className="flex flex-col gap-1.5">
        {LAYOUTS.map((l, i) => (
          <span
            key={l.id}
            className="flex items-center gap-2 rounded-[var(--r-pill)] border px-3 py-1.5 text-sm"
            style={i === 0 ? FILLED : OUTLINE}
          >
            <Glyph kind={l.id} size={24} />
            {l.name}
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        Icon beside the label. Stacks as rows, so it breaks the three side by
        side rule in a narrow panel.
      </p>
    </Stage>
  );
}

export function LayoutSlider() {
  return (
    <Stage>
      <div
        className="relative grid grid-cols-3 rounded-[var(--r-lg)] p-1"
        style={{
          background: "color-mix(in srgb, var(--text) 7%, var(--surface))",
        }}
      >
        <span
          aria-hidden
          className="absolute inset-y-1 start-1 w-[calc((100%-0.5rem)/3)] rounded-[var(--r-md)] border"
          style={{
            background: "var(--surface)",
            borderColor: "var(--accent)",
            boxShadow: "var(--shadow)",
          }}
        />
        {LAYOUTS.map((l, i) => (
          <span
            key={l.id}
            className="relative flex flex-col items-center gap-1 py-2 text-xs"
            style={{
              color: i === 0 ? "var(--accent)" : "var(--muted)",
              fontWeight: i === 0 ? 600 : 400,
            }}
          >
            <Glyph kind={l.id} size={30} />
            {l.name}
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        A raised highlight slides to the chosen layout, in line with the 200 ms
        reflow.
      </p>
    </Stage>
  );
}

/* ---------- Background picker ---------- */

const swatchBg = (b: (typeof BACKGROUNDS)[number]) =>
  b.kind === "image" ? `url(${b.image}) center/cover` : b.color;

export function BgCircles() {
  return (
    <Stage>
      <div role="radiogroup" className="flex flex-wrap gap-2">
        {BACKGROUNDS.map((b, i) => (
          <span
            key={b.id}
            title={b.name}
            className="size-8 rounded-full border"
            style={{
              background: swatchBg(b),
              borderColor: "var(--line)",
              outline: i === 0 ? "2px solid var(--accent)" : "none",
              outlineOffset: 2,
            }}
          />
        ))}
      </div>
      <p className="mt-3 text-sm font-semibold">Cream</p>
      <p className="text-xs" style={MUTED}>
        Round swatches in one row. The name shows below the selected one.
      </p>
    </Stage>
  );
}

export function BgGroups() {
  const colors = BACKGROUNDS.filter((b) => b.kind === "color");
  const images = BACKGROUNDS.filter((b) => b.kind === "image");
  return (
    <Stage>
      <Label>Paper</Label>
      <div className="flex gap-2">
        {colors.map((b, i) => (
          <span
            key={b.id}
            title={b.name}
            className="size-8 rounded-[var(--r-sm)] border"
            style={{
              background: b.color,
              borderColor: "var(--line)",
              outline: i === 0 ? "2px solid var(--accent)" : "none",
              outlineOffset: 2,
            }}
          />
        ))}
      </div>
      <div className="mt-3">
        <Label>Pictures</Label>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {images.map((b) => (
          <span
            key={b.id}
            className="flex flex-col items-center gap-1 text-[11px]"
          >
            <span
              className="h-12 w-full rounded-[var(--r-sm)] border"
              style={{ background: swatchBg(b), borderColor: "var(--line)" }}
            />
            {b.name}
          </span>
        ))}
      </div>
    </Stage>
  );
}

export function BgPosterTiles() {
  return (
    <Stage>
      <div className="grid grid-cols-4 gap-2">
        {BACKGROUNDS.map((b, i) => (
          <span
            key={b.id}
            className="flex flex-col items-center gap-1 text-[10px]"
          >
            <span
              className="relative aspect-[3/4] w-full rounded-[2px] border"
              style={{
                background: swatchBg(b),
                borderColor: i === 0 ? "var(--accent)" : "var(--line)",
                boxShadow: i === 0 ? "0 0 0 2px var(--accent)" : undefined,
              }}
            >
              <img
                src={ART}
                alt=""
                className="absolute inset-x-1 top-3 bottom-1 object-contain"
              />
              <span
                className="absolute inset-x-1 top-0.5 h-1 rounded-full"
                style={{ background: b.ink, opacity: 0.7 }}
              />
            </span>
            {b.name}
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        Mini posters show how the art and the ink look on each background.
      </p>
    </Stage>
  );
}

export function BgSelect() {
  const row = (b: (typeof BACKGROUNDS)[number], on?: boolean) => (
    <span
      key={b.id}
      className="flex items-center gap-2 px-3 py-1.5 text-sm"
      style={on ? { background: SOFT } : undefined}
    >
      <span
        className="size-5 rounded-full border"
        style={{ background: swatchBg(b), borderColor: "var(--line)" }}
      />
      {b.name}
    </span>
  );
  return (
    <Stage>
      <span
        className="flex items-center justify-between rounded-[var(--r-md)] border px-3 py-2 text-sm"
        style={{ ...OUTLINE, background: "var(--bg)" }}
      >
        <span className="flex items-center gap-2">
          <span
            className="size-5 rounded-full border"
            style={{
              background: BACKGROUNDS[0].color,
              borderColor: "var(--line)",
            }}
          />
          Cream
        </span>
        <Chevron />
      </span>
      <div
        className="mt-1 overflow-hidden rounded-[var(--r-md)] border shadow-[var(--shadow-hi)]"
        style={{ ...OUTLINE, background: "var(--surface)" }}
      >
        {[BACKGROUNDS[0], BACKGROUNDS[2], BACKGROUNDS[5], BACKGROUNDS[7]].map(
          (b, i) => row(b, i === 0),
        )}
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        One field that opens a list. Smallest, but you cannot see all eight at
        once.
      </p>
    </Stage>
  );
}

export function BgCustom() {
  return (
    <Stage>
      <div role="radiogroup" className="flex flex-wrap gap-2">
        {BACKGROUNDS.slice(0, 6).map((b, i) => (
          <span
            key={b.id}
            className="size-7 rounded-full border"
            style={{
              background: swatchBg(b),
              borderColor: "var(--line)",
              outline: i === 0 ? "2px solid var(--accent)" : "none",
              outlineOffset: 2,
            }}
          />
        ))}
        <span
          className="grid size-7 place-items-center rounded-full border border-dashed text-sm"
          style={MUTED}
        >
          +
        </span>
      </div>
      <div
        className="mt-3 flex items-center gap-2 rounded-[var(--r-md)] border px-2 py-1.5 text-sm"
        style={{ ...OUTLINE, background: "var(--bg)" }}
      >
        <span
          className="size-5 rounded border"
          style={{ background: "#f8f4ea", borderColor: "var(--line)" }}
        />
        #F8F4EA
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        Presets plus any color. Freedom, but a user can pick a color where the
        title is unreadable.
      </p>
    </Stage>
  );
}

/* ---------- Size picker ---------- */

const SIZES: { id: string; name: string; ratio: number; phys: string }[] = [
  { id: "3:4", name: "3:4", ratio: 3 / 4, phys: "18 x 24 in, 12 x 16 in" },
  { id: "2:3", name: "2:3", ratio: 2 / 3, phys: "24 x 36 in" },
  { id: "4:5", name: "4:5", ratio: 4 / 5, phys: "16 x 20 in" },
  { id: "a", name: "A series", ratio: 1 / Math.SQRT2, phys: "A2, A3, A4" },
];

const Shape = ({
  ratio,
  h = 36,
  on,
}: {
  ratio: number;
  h?: number;
  on?: boolean;
}) => (
  <span
    className="inline-block rounded-[2px] border-2"
    style={{
      height: h,
      width: h * ratio,
      borderColor: on ? "var(--accent)" : "var(--muted)",
      background: on ? SOFT : "transparent",
    }}
  />
);

const Orientation = () => (
  <div
    className="inline-flex overflow-hidden rounded-[var(--r-md)] border text-xs"
    style={OUTLINE}
  >
    <span className="flex items-center gap-1.5 px-2.5 py-1.5" style={FILLED}>
      <Shape ratio={0.75} h={12} />
      Portrait
    </span>
    <span className="flex items-center gap-1.5 px-2.5 py-1.5">
      <Shape ratio={1.333} h={10} />
      Landscape
    </span>
  </div>
);

export function SizeShapes() {
  return (
    <Stage>
      <div role="radiogroup" className="flex items-end justify-between">
        {SIZES.map((s, i) => (
          <span
            key={s.id}
            className="flex flex-col items-center gap-1 text-xs"
            style={
              i === 0 ? { color: "var(--accent)", fontWeight: 600 } : undefined
            }
          >
            <Shape ratio={s.ratio} on={i === 0} />
            {s.name}
          </span>
        ))}
      </div>
      <div className="mt-3">
        <Orientation />
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        Each ratio drawn to scale, plus a portrait and landscape switch.
      </p>
    </Stage>
  );
}

export function SizeSelect() {
  return (
    <Stage>
      <span
        className="flex items-center justify-between rounded-[var(--r-md)] border px-3 py-2 text-sm"
        style={{ ...OUTLINE, background: "var(--bg)" }}
      >
        3:4 portrait <Chevron />
      </span>
      <div
        className="mt-1 overflow-hidden rounded-[var(--r-md)] border shadow-[var(--shadow-hi)]"
        style={{ ...OUTLINE, background: "var(--surface)" }}
      >
        {SIZES.map((s, i) => (
          <span
            key={s.id}
            className="flex items-center gap-2 px-3 py-1.5 text-sm"
            style={i === 0 ? { background: SOFT } : undefined}
          >
            {s.name}
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        Smallest footprint. Orientation sits in a second control.
      </p>
    </Stage>
  );
}

export function SizeText() {
  return (
    <Stage>
      <div
        role="radiogroup"
        className="inline-flex overflow-hidden rounded-[var(--r-md)] border"
        style={OUTLINE}
      >
        {SIZES.map((s, i) => (
          <span
            key={s.id}
            className="px-3 py-1.5 text-sm"
            style={{
              ...(i === 0 ? FILLED : {}),
              borderInlineStart: i ? "1px solid var(--line)" : undefined,
            }}
          >
            {s.name}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-sm">
        <span
          className="inline-flex h-5 w-9 items-center rounded-full p-0.5"
          style={{ background: "var(--line)" }}
        >
          <span className="size-4 rounded-full bg-white shadow" />
        </span>
        Landscape
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        Plain text and a switch. Lightest, but 2:3 and 4:5 mean nothing to most
        people.
      </p>
    </Stage>
  );
}

export function SizeCards() {
  return (
    <Stage>
      <div role="radiogroup" className="flex flex-col gap-1.5">
        {SIZES.map((s, i) => (
          <span
            key={s.id}
            className="flex items-center gap-3 rounded-[var(--r-md)] border px-3 py-1.5"
            style={{
              borderColor: i === 0 ? "var(--accent)" : "var(--line)",
              background: i === 0 ? SOFT : "var(--surface)",
            }}
          >
            <Shape ratio={s.ratio} h={26} on={i === 0} />
            <span className="text-sm leading-tight">
              <b>{s.name}</b>
              <br />
              <span className="text-[11px]" style={MUTED}>
                {s.phys}
              </span>
            </span>
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        Shows the print sizes each shape makes. Tall, so it needs room.
      </p>
    </Stage>
  );
}

export function SizePreviews() {
  return (
    <Stage>
      <div role="radiogroup" className="flex items-end justify-between gap-2">
        {SIZES.map((s, i) => (
          <span
            key={s.id}
            className="flex flex-col items-center gap-1 text-[11px]"
          >
            <span
              className="grid place-items-center rounded-[2px] border bg-[#F8F4EA]"
              style={{
                height: 56,
                width: 56 * s.ratio,
                borderColor: i === 0 ? "var(--accent)" : "var(--line)",
                boxShadow: i === 0 ? "0 0 0 2px var(--accent)" : undefined,
              }}
            >
              <img src={ART} alt="" className="h-9 object-contain" />
            </span>
            {s.name}
          </span>
        ))}
      </div>
      <div className="mt-3">
        <Orientation />
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        Mini posters at true proportion, with a bird inside, so you see the
        shape change.
      </p>
    </Stage>
  );
}
