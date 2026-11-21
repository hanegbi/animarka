/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { BODY, BY_ID, themeVars } from "./mock";

/** Static mock-ups for round R3. Real data, our tokens. Nothing here ships. */

const OWLS = [
  "tyto-alba",
  "asio-flammeus",
  "athene-noctua",
  "asio-otus",
  "bubo-bubo",
  "otus-scops",
];
const ON = new Set(["tyto-alba", "athene-noctua", "bubo-bubo"]);
const KESTRELS = ["falco-tinnunculus", "falco-naumanni", "falco-sparverius"];
const TRAY = [
  "bubo-bubo",
  "alcedo-atthis",
  "falco-peregrinus",
  "haliaeetus-albicilla",
  "anas-platyrhynchos",
  "ardea-cinerea",
  "dendrocopos-major",
  "psittacula-krameri",
  "hirundo-rustica",
  "carduelis-carduelis",
  "tyto-alba",
  "cygnus-olor",
];
const FAMS: [string, number, number][] = [
  ["All", 118, 12],
  ["Owls", 12, 3],
  ["Kingfishers", 10, 1],
  ["Falcons", 12, 1],
  ["Eagles and hawks", 12, 1],
  ["Ducks, swans and geese", 12, 2],
  ["Herons and egrets", 12, 1],
  ["Woodpeckers", 12, 1],
  ["Parrots and cockatoos", 12, 1],
  ["Swallows", 12, 1],
  ["Finches", 12, 1],
];

const sp = (id: string) => BY_ID.get(id)!;
const MUTED = { color: "var(--muted)" };

export function Stage({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-[var(--r-lg)] border p-3"
      style={{
        ...themeVars(),
        borderColor: "var(--line)",
        background: "var(--surface)",
        fontFamily: BODY,
      }}
    >
      {children}
    </div>
  );
}

const Thumb = ({ id, size = 28 }: { id: string; size?: number }) => (
  <img
    src={`/art/fg/${id}.webp`}
    alt=""
    className="rounded-full bg-[#F8F4EA] object-contain"
    style={{ width: size, height: size }}
  />
);

const Icon = ({ d }: { d: string }) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d={d} />
  </svg>
);
const SEARCH = "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.3-4.3";
const CHECK = "M20 6 9 17l-5-5";
const X = "M18 6 6 18M6 6l12 12";
const PLUS = "M12 5v14M5 12h14";
const CHEVRON = "m6 9 6 6 6-6";

const FILLED = {
  background: "var(--accent)",
  color: "var(--on-accent)",
  borderColor: "var(--accent)",
};
const OUTLINE = { borderColor: "var(--line)" };
const field =
  "flex items-center gap-2 rounded-[var(--r-md)] border px-3 py-2 text-sm";
const fieldStyle = { borderColor: "var(--line)", background: "var(--bg)" };
const SOFT = "color-mix(in srgb, var(--accent) 14%, var(--surface))";

/* ---------- Search input ---------- */

export function SearchInline() {
  return (
    <Stage>
      <div className={field} style={fieldStyle}>
        <Icon d={SEARCH} /> <span>kest</span>
        <span className="ms-auto text-xs" style={MUTED}>
          3 found
        </span>
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        The list below filters as you type.
      </p>
      <div className="mt-2 flex flex-col gap-1">
        {KESTRELS.map((id) => (
          <span key={id} className="flex items-center gap-2 text-sm">
            <Thumb id={id} />
            {sp(id).name}
          </span>
        ))}
      </div>
    </Stage>
  );
}

export function SearchAutocomplete() {
  return (
    <Stage>
      <div
        className={field}
        style={{ ...fieldStyle, borderColor: "var(--accent)" }}
      >
        <Icon d={SEARCH} /> <span>kest</span>
      </div>
      <ul
        className="mt-1 overflow-hidden rounded-[var(--r-md)] border shadow-[var(--shadow-hi)]"
        style={{ borderColor: "var(--line)", background: "var(--surface)" }}
      >
        {KESTRELS.map((id, i) => (
          <li
            key={id}
            className="flex items-center gap-2 px-3 py-2 text-sm"
            style={i === 0 ? { background: SOFT } : undefined}
          >
            <Thumb id={id} />
            <span>
              {sp(id).name}
              <br />
              <i className="text-xs" style={MUTED}>
                {sp(id).sci}
              </i>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs" style={MUTED}>
        Arrow keys pick, Enter adds to the poster.
      </p>
    </Stage>
  );
}

export function SearchCategory() {
  return (
    <Stage>
      <div
        className="flex overflow-hidden rounded-[var(--r-md)] border"
        style={OUTLINE}
      >
        <span
          className="flex items-center gap-1 border-e px-3 py-2 text-sm"
          style={{ ...fieldStyle }}
        >
          Falcons <Icon d={CHEVRON} />
        </span>
        <span
          className="flex-1 px-3 py-2 text-sm"
          style={{ background: "var(--bg)" }}
        >
          kest
        </span>
        <span className="flex items-center px-3" style={FILLED}>
          <Icon d={SEARCH} />
        </span>
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        The family menu and the search field work together. One control, no chip
        row.
      </p>
    </Stage>
  );
}

export function SearchPalette() {
  return (
    <Stage>
      <div
        className="rounded-[var(--r-lg)] border shadow-[var(--shadow-hi)]"
        style={{ ...OUTLINE, background: "var(--surface)" }}
      >
        <div
          className="flex items-center gap-2 border-b px-3 py-2 text-sm"
          style={OUTLINE}
        >
          <Icon d={SEARCH} /> kest{" "}
          <kbd
            className="ms-auto rounded border px-1 text-[10px]"
            style={OUTLINE}
          >
            Esc
          </kbd>
        </div>
        <p
          className="px-3 pt-2 text-[10px] font-semibold tracking-wide uppercase"
          style={MUTED}
        >
          Birds
        </p>
        {KESTRELS.map((id) => {
          const name = sp(id).name;
          const i = name.toLowerCase().indexOf("kest");
          return (
            <p key={id} className="flex items-center gap-2 px-3 py-1.5 text-sm">
              <Thumb id={id} size={22} />
              <span>
                {name.slice(0, i)}
                <u
                  className="decoration-2"
                  style={{ textDecorationColor: "var(--accent)" }}
                >
                  {name.slice(i, i + 4)}
                </u>
                {name.slice(i + 4)}
              </span>
            </p>
          );
        })}
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        Opens on Ctrl K or the search button. Fuzzy match.
      </p>
    </Stage>
  );
}

export function SearchSuggest() {
  return (
    <Stage>
      <div className={field} style={fieldStyle}>
        <Icon d={SEARCH} /> <span style={MUTED}>Search all birds</span>
      </div>
      <p className="mt-3 text-xs font-semibold" style={MUTED}>
        Try
      </p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {["kestrel", "heron", "owl", "peregrine", "parrot", "swan"].map((t) => (
          <span
            key={t}
            className="rounded-[var(--r-pill)] border px-2.5 py-1 text-xs"
            style={OUTLINE}
          >
            {t}
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs" style={MUTED}>
        Suggestions show while the field is empty. Good for first time visitors.
      </p>
    </Stage>
  );
}

/* ---------- Family chips ---------- */

const pill =
  "inline-flex items-center gap-1.5 rounded-[var(--r-pill)] border px-2.5 py-1 text-xs";

export function FamilyWrap() {
  return (
    <Stage>
      <div className="flex flex-wrap gap-1.5">
        {FAMS.slice(0, 8).map(([name, total, on], i) => (
          <span key={name} className={pill} style={i === 1 ? FILLED : OUTLINE}>
            {name}
            <b
              className="rounded-full px-1.5 text-[10px]"
              style={{ background: i === 1 ? "rgb(255 255 255 / 0.25)" : SOFT }}
            >
              {on}
            </b>
            <span className="sr-only">{total}</span>
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        Wraps to as many rows as it needs. The badge counts birds on the poster.
      </p>
    </Stage>
  );
}

export function FamilyRing() {
  return (
    <Stage>
      <div className="flex flex-wrap gap-1.5">
        {FAMS.slice(0, 8).map(([name, , on], i) => (
          <span
            key={name}
            className={pill}
            style={{
              borderColor: i === 1 ? "var(--accent)" : "var(--line)",
              boxShadow:
                i === 1
                  ? "0 0 0 2px color-mix(in srgb, var(--accent) 30%, transparent)"
                  : undefined,
              fontWeight: i === 1 ? 600 : 400,
            }}
          >
            {name}
            {on > 0 && i > 0 && (
              <span style={{ color: "var(--accent)" }}>· {on}</span>
            )}
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        Selected chip gets an accent ring, not a fill. Quieter, counts as plain
        text.
      </p>
    </Stage>
  );
}

export function FamilyScroll() {
  return (
    <Stage>
      <div className="flex gap-1.5 overflow-hidden">
        {FAMS.slice(0, 5).map(([name, , on], i) => (
          <span
            key={name}
            className={`${pill} shrink-0`}
            style={i === 1 ? FILLED : OUTLINE}
          >
            {name}
            {on > 0 && i > 0 && <b>{on}</b>}
          </span>
        ))}
        <span className={`${pill} shrink-0`} style={{ ...OUTLINE, ...MUTED }}>
          +5 more
        </span>
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        One row only. A plus 5 more chip opens the rest. Saves height on a
        phone.
      </p>
    </Stage>
  );
}

export function FamilyTabs() {
  return (
    <Stage>
      <div
        className="flex gap-4 overflow-hidden border-b text-sm"
        style={OUTLINE}
      >
        {FAMS.slice(0, 5).map(([name, total], i) => (
          <span
            key={name}
            className="shrink-0 pb-2"
            style={
              i === 1
                ? { borderBottom: "2px solid var(--accent)", fontWeight: 600 }
                : MUTED
            }
          >
            {name}{" "}
            <span className="rounded border px-1 text-[10px]" style={OUTLINE}>
              {total}
            </span>
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        Tabs with the family size. Reads as navigation, not as filters. Counts
        on poster are lost.
      </p>
    </Stage>
  );
}

export function FamilyBars() {
  return (
    <Stage>
      <ul className="flex flex-col gap-1.5">
        {FAMS.slice(1, 7).map(([name, total, on], i) => (
          <li
            key={name}
            className="text-xs"
            style={i === 0 ? { fontWeight: 600 } : undefined}
          >
            <span className="flex justify-between">
              <span>{name}</span>
              <span style={MUTED}>
                {on} of {total}
              </span>
            </span>
            <span
              className="mt-0.5 block h-1.5 rounded-full"
              style={{ background: "var(--line)" }}
            >
              <span
                className="block h-full rounded-full"
                style={{
                  width: `${(on / total) * 100}%`,
                  background: "var(--accent)",
                }}
              />
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs" style={MUTED}>
        A vertical list with a fill bar. Shows coverage at a glance. Needs a
        column, not a row.
      </p>
    </Stage>
  );
}

/* ---------- Species chip and list ---------- */

export function SpeciesPills() {
  return (
    <Stage>
      <div className="flex flex-wrap gap-1.5">
        {OWLS.map((id) => (
          <span
            key={id}
            className="inline-flex items-center gap-1.5 rounded-[var(--r-pill)] border py-0.5 ps-0.5 pe-2.5 text-xs"
            style={ON.has(id) ? FILLED : OUTLINE}
          >
            <Thumb id={id} size={24} />
            {sp(id).name}
          </span>
        ))}
      </div>
    </Stage>
  );
}

export function SpeciesCards() {
  return (
    <Stage>
      <div className="grid grid-cols-3 gap-2">
        {OWLS.map((id) => (
          <span
            key={id}
            className="relative flex flex-col items-center gap-1 rounded-[var(--r-md)] border p-1.5 text-center text-[11px]"
            style={{
              borderColor: ON.has(id) ? "var(--accent)" : "var(--line)",
              boxShadow: ON.has(id) ? "0 0 0 1px var(--accent)" : undefined,
            }}
          >
            <img
              src={`/art/fg/${id}.webp`}
              alt=""
              className="h-14 w-full object-contain"
            />
            {sp(id).name}
            {ON.has(id) && (
              <span
                className="absolute end-1 top-1 grid size-4 place-items-center rounded-full"
                style={FILLED}
              >
                <Icon d={CHECK} />
              </span>
            )}
          </span>
        ))}
      </div>
    </Stage>
  );
}

export function SpeciesRows() {
  return (
    <Stage>
      <ul className="flex flex-col">
        {OWLS.slice(0, 5).map((id) => (
          <li
            key={id}
            className="flex items-center gap-2 border-b py-1.5 last:border-0"
            style={OUTLINE}
          >
            <Thumb id={id} size={32} />
            <span className="text-sm leading-tight">
              {sp(id).name}
              <br />
              <i className="text-[11px]" style={MUTED}>
                {sp(id).sci}
              </i>
            </span>
            <span
              className="ms-auto grid size-5 place-items-center rounded border"
              style={ON.has(id) ? FILLED : OUTLINE}
            >
              {ON.has(id) && <Icon d={CHECK} />}
            </span>
          </li>
        ))}
      </ul>
    </Stage>
  );
}

export function SpeciesTiles() {
  return (
    <Stage>
      <div className="grid grid-cols-2 gap-2">
        {OWLS.slice(0, 4).map((id) => (
          <span
            key={id}
            className="relative overflow-hidden rounded-[var(--r-md)] border text-center text-xs"
            style={{
              borderColor: ON.has(id) ? "var(--accent)" : "var(--line)",
              background: "#F8F4EA",
            }}
          >
            <img
              src={`/art/fg/${id}.webp`}
              alt=""
              className="mx-auto h-24 object-contain p-1"
            />
            <span
              className="block px-1 py-1"
              style={
                ON.has(id)
                  ? { background: "var(--accent)", color: "var(--on-accent)" }
                  : { background: "var(--surface)" }
              }
            >
              {sp(id).name}
            </span>
          </span>
        ))}
      </div>
    </Stage>
  );
}

export function SpeciesAddTags() {
  return (
    <Stage>
      <div className="flex flex-wrap gap-1.5">
        {OWLS.map((id) => (
          <span
            key={id}
            className="inline-flex items-center gap-1 rounded-[var(--r-md)] border px-2 py-1 text-xs"
            style={
              ON.has(id)
                ? {
                    background: SOFT,
                    borderColor: "var(--accent)",
                    fontWeight: 600,
                  }
                : OUTLINE
            }
          >
            <Icon d={ON.has(id) ? CHECK : PLUS} />
            {sp(id).name}
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        No pictures, so the list is compact and loads instantly. Plus and check
        show the state.
      </p>
    </Stage>
  );
}

/* ---------- Selected tray ---------- */

export function TrayChips() {
  return (
    <Stage>
      <p className="mb-2 text-xs font-semibold" style={MUTED}>
        Your poster (12 birds from 9 families)
      </p>
      <div className="flex flex-wrap gap-1.5">
        {TRAY.slice(0, 8).map((id) => (
          <span
            key={id}
            className="inline-flex items-center gap-1 rounded-[var(--r-pill)] border py-0.5 ps-2.5 pe-1.5 text-xs"
            style={OUTLINE}
          >
            {sp(id).name}
            <Icon d={X} />
          </span>
        ))}
        <span className="text-xs" style={MUTED}>
          +4 more
        </span>
      </div>
    </Stage>
  );
}

export function TrayThumbs() {
  return (
    <Stage>
      <p className="mb-2 text-xs font-semibold" style={MUTED}>
        Your poster (12 birds from 9 families)
      </p>
      <div className="flex flex-wrap gap-1.5">
        {TRAY.map((id) => (
          <span key={id} className="relative">
            <Thumb id={id} size={34} />
            <span
              className="absolute -end-1 -top-1 grid size-3.5 place-items-center rounded-full border text-[8px]"
              style={{
                background: "var(--surface)",
                borderColor: "var(--line)",
              }}
            >
              ×
            </span>
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        Pictures only. Densest. Names show on long press or hover.
      </p>
    </Stage>
  );
}

export function TraySummary() {
  return (
    <Stage>
      <div
        className="flex items-center gap-2 rounded-[var(--r-md)] border px-3 py-2 text-sm"
        style={OUTLINE}
      >
        <span className="flex -space-x-2">
          {TRAY.slice(0, 4).map((id) => (
            <Thumb key={id} id={id} size={26} />
          ))}
        </span>
        <span>
          <b>12 birds</b> from 9 families
        </span>
        <span className="ms-auto">
          <Icon d={CHEVRON} />
        </span>
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        Collapsed by default. Tap to open the full list. Best on a phone, where
        the picker has little height.
      </p>
    </Stage>
  );
}

export function TrayGrouped() {
  const groups: [string, string[]][] = [
    ["Owls", ["bubo-bubo", "tyto-alba"]],
    ["Falcons", ["falco-peregrinus"]],
    ["Ducks, swans and geese", ["anas-platyrhynchos", "cygnus-olor"]],
    ["Herons and egrets", ["ardea-cinerea"]],
  ];
  return (
    <Stage>
      {groups.map(([g, ids]) => (
        <div key={g} className="mb-2 last:mb-0">
          <p className="mb-1 text-[11px] font-semibold" style={MUTED}>
            {g} · {ids.length}
          </p>
          <div className="flex gap-1.5">
            {ids.map((id) => (
              <Thumb key={id} id={id} size={30} />
            ))}
          </div>
        </div>
      ))}
      <p className="mt-2 text-xs" style={MUTED}>
        Grouped by family, so you see the mix. Taller, and it hides the poster
        order.
      </p>
    </Stage>
  );
}

export function TrayNumbered() {
  return (
    <Stage>
      <p className="mb-2 text-xs font-semibold" style={MUTED}>
        Poster order. Drag to reorder.
      </p>
      <div className="grid grid-cols-4 gap-1.5">
        {TRAY.slice(0, 8).map((id, i) => (
          <span
            key={id}
            className="relative flex flex-col items-center rounded-[var(--r-md)] border p-1"
            style={OUTLINE}
          >
            <span className="absolute start-1 top-0.5 text-[10px] font-semibold">
              {i + 1}
            </span>
            <img
              src={`/art/fg/${id}.webp`}
              alt=""
              className="h-10 object-contain"
            />
            <span className="text-[8px]" style={MUTED} aria-hidden>
              ⠿
            </span>
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        Numbers match the legend. Reordering here works for keyboard users and
        phones.
      </p>
    </Stage>
  );
}
