/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { SPECIES, STARTER_IDS } from "@/catalog/static-m1";
import { THEMES } from "@/design/themes";

/** Shared mock parts for design rounds. Theme A, Fraunces and Inter, as chosen in R1. */

export const BY_ID = new Map(SPECIES.map((s) => [s.id, s]));
export const DISPLAY = "var(--f-fraunces), var(--f-frank), Georgia, serif";
export const BODY = "var(--f-inter), var(--f-heebo), system-ui, sans-serif";
const A = THEMES[0];

export type Tokens = {
  rSm: string;
  rMd: string;
  rLg: string;
  rPill: string;
  shadow: string;
  shadowHi: string;
};

export const BASE_TOKENS: Tokens = {
  rSm: "6px",
  rMd: "10px",
  rLg: "16px",
  rPill: "999px",
  shadow: "0 1px 2px rgb(30 27 22 / 0.08), 0 4px 12px rgb(30 27 22 / 0.06)",
  shadowHi: "0 10px 30px rgb(30 27 22 / 0.18)",
};

export function themeVars(tokens: Tokens = BASE_TOKENS): CSSProperties {
  return {
    "--bg": A.bg,
    "--surface": A.surface,
    "--text": A.text,
    "--muted": A.muted,
    "--line": A.line,
    "--accent": A.accent,
    "--on-accent": A.onAccent,
    "--ochre": A.second,
    "--r-sm": tokens.rSm,
    "--r-md": tokens.rMd,
    "--r-lg": tokens.rLg,
    "--r-pill": tokens.rPill,
    "--shadow": tokens.shadow,
    "--shadow-hi": tokens.shadowHi,
    background: "var(--bg)",
    color: "var(--text)",
    fontFamily: BODY,
  } as CSSProperties;
}

export function Poster({
  className = "",
  n = 12,
}: {
  className?: string;
  n?: number;
}) {
  return (
    <div
      className={`aspect-[3/4] rounded-[2px] bg-[#F8F4EA] p-[4%] text-[#1E1B16] shadow-[var(--shadow-hi)] ${className}`}
      aria-label="Poster preview"
    >
      <p
        className="mb-[3%] text-center leading-none font-semibold"
        style={{ fontFamily: DISPLAY, fontSize: "clamp(12px, 3.2cqw, 28px)" }}
      >
        Birds
      </p>
      <div className="grid grid-cols-4 gap-[1.5%]">
        {STARTER_IDS.slice(0, n).map((id) => (
          <div key={id} className="text-center">
            <img
              src={`/art/fg/${id}.webp`}
              alt={BY_ID.get(id)!.name}
              className="mx-auto aspect-[3/4] w-full object-contain"
            />
            <p
              className="truncate leading-tight"
              style={{ fontFamily: BODY, fontSize: "clamp(5px, 1.5cqw, 11px)" }}
            >
              {BY_ID.get(id)!.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PosterStage({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`@container flex min-h-0 items-center justify-center overflow-hidden p-4 ${className}`}
    >
      {children ?? <Poster className="h-full max-h-full w-auto" />}
    </div>
  );
}

export function Chip({
  id,
  on,
  small,
}: {
  id: string;
  on?: boolean;
  small?: boolean;
}) {
  const s = BY_ID.get(id)!;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[var(--r-pill)] border pr-2.5 pl-1 ${small ? "py-0.5 text-[11px]" : "py-1 text-sm"}`}
      style={{
        borderColor: on ? "var(--accent)" : "var(--line)",
        background: on ? "var(--accent)" : "var(--surface)",
        color: on ? "var(--on-accent)" : "var(--text)",
      }}
    >
      <img
        src={`/art/fg/${id}.webp`}
        alt=""
        className={`${small ? "size-5" : "size-7"} rounded-full bg-[#F8F4EA] object-contain`}
      />
      {s.name}
    </span>
  );
}

export function Btn({
  children,
  primary,
  small,
}: {
  children: ReactNode;
  primary?: boolean;
  small?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[var(--r-md)] border font-medium whitespace-nowrap ${small ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-2 text-sm"}`}
      style={{
        borderColor: primary ? "var(--accent)" : "var(--line)",
        background: primary ? "var(--accent)" : "var(--surface)",
        color: primary ? "var(--on-accent)" : "var(--text)",
      }}
    >
      {children}
    </span>
  );
}

export function Seg({
  items,
  active = 0,
  small,
}: {
  items: string[];
  active?: number;
  small?: boolean;
}) {
  return (
    <span
      className="inline-flex overflow-hidden rounded-[var(--r-md)] border"
      style={{ borderColor: "var(--line)", background: "var(--surface)" }}
    >
      {items.map((t, i) => (
        <span
          key={t}
          className={small ? "px-2 py-1 text-[11px]" : "px-3 py-1.5 text-sm"}
          style={
            i === active
              ? { background: "var(--accent)", color: "var(--on-accent)" }
              : undefined
          }
        >
          {t}
        </span>
      ))}
    </span>
  );
}

const DOTS: Record<string, [number, number, number][]> = {
  scatter: [
    [9, 9, 4],
    [24, 6, 3],
    [37, 12, 4.6],
    [6, 24, 3.4],
    [20, 21, 5],
    [35, 27, 3.4],
    [11, 37, 4.6],
    [25, 36, 3],
    [38, 39, 3.8],
  ],
  grid: [
    [8, 8, 3.6],
    [22, 8, 3.6],
    [36, 8, 3.6],
    [8, 22, 3.6],
    [22, 22, 3.6],
    [36, 22, 3.6],
    [8, 36, 3.6],
    [22, 36, 3.6],
    [36, 36, 3.6],
  ],
  center: [
    [22, 22, 9],
    [22, 6, 3],
    [38, 22, 3],
    [22, 38, 3],
    [6, 22, 3],
    [34, 10, 2.6],
    [34, 34, 2.6],
    [10, 34, 2.6],
    [10, 10, 2.6],
  ],
};

export function LayoutIcons({
  active = 0,
  small,
}: {
  active?: number;
  small?: boolean;
}) {
  return (
    <span className="flex gap-1.5">
      {(["scatter", "grid", "center"] as const).map((k, i) => (
        <span
          key={k}
          className="flex flex-col items-center gap-0.5 rounded-[var(--r-md)] border px-2 py-1"
          style={{
            borderColor: i === active ? "var(--accent)" : "var(--line)",
            background:
              i === active
                ? "color-mix(in srgb, var(--accent) 12%, var(--surface))"
                : "var(--surface)",
          }}
        >
          <svg
            viewBox="0 0 44 44"
            className={small ? "size-7" : "size-9"}
            aria-hidden
            fill="currentColor"
          >
            {DOTS[k].map(([x, y, r], j) => (
              <circle key={j} cx={x} cy={y} r={r} />
            ))}
          </svg>
          <span className={small ? "text-[9px]" : "text-[11px]"}>
            {k === "center"
              ? "Centerpiece"
              : k === "scatter"
                ? "Scattered"
                : "Grid"}
          </span>
        </span>
      ))}
    </span>
  );
}

export function Swatches() {
  const cols = [
    "#F8F4EA",
    "#FFFFFF",
    "#E3EADF",
    "#F6E4DF",
    "#171B22",
    "#E9DCC0",
    "#DCEBF1",
    "#1F3A2D",
  ];
  return (
    <span className="flex gap-1.5">
      {cols.map((c, i) => (
        <span
          key={c}
          className="size-6 rounded-[var(--r-sm)] border"
          style={{
            background: c,
            borderColor: i === 0 ? "var(--accent)" : "var(--line)",
            outline: i === 0 ? "2px solid var(--accent)" : "none",
            outlineOffset: 1,
          }}
        />
      ))}
    </span>
  );
}

export const FAMILIES = [
  "All 118",
  "Owls",
  "Raptors",
  "Ducks",
  "Herons",
  "Woodpeckers",
  "Parrots",
];
export const PICK = [
  "bubo-bubo",
  "falco-peregrinus",
  "alcedo-atthis",
  "ardea-cinerea",
  "tyto-alba",
  "anas-platyrhynchos",
  "cygnus-olor",
  "hirundo-rustica",
];

export function PickerPanel({ small }: { small?: boolean }) {
  return (
    <div className="flex min-h-0 flex-col gap-2 overflow-hidden">
      <div
        className={`rounded-[var(--r-md)] border px-3 ${small ? "py-1.5 text-[11px]" : "py-2 text-sm"}`}
        style={{
          borderColor: "var(--line)",
          background: "var(--surface)",
          color: "var(--muted)",
        }}
      >
        Search all birds, try kestrel or heron
      </div>
      <div className="flex flex-wrap gap-1">
        {FAMILIES.map((f, i) => (
          <span
            key={f}
            className={`rounded-[var(--r-pill)] border px-2.5 py-0.5 ${small ? "text-[10px]" : "text-xs"}`}
            style={{
              borderColor: i === 1 ? "var(--accent)" : "var(--line)",
              background: i === 1 ? "var(--accent)" : "transparent",
              color: i === 1 ? "var(--on-accent)" : "var(--text)",
            }}
          >
            {f}
            {i === 1 && <b className="ml-1">3</b>}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {PICK.slice(0, small ? 5 : 8).map((id, i) => (
          <Chip key={id} id={id} on={i % 2 === 0} small={small} />
        ))}
      </div>
    </div>
  );
}

function L({ children, small }: { children: ReactNode; small?: boolean }) {
  return (
    <p
      className={`mb-1 font-semibold tracking-wide uppercase ${small ? "text-[9px]" : "text-[11px]"}`}
      style={{ color: "var(--muted)" }}
    >
      {children}
    </p>
  );
}

export function ControlsPanel({ small }: { small?: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <L small={small}>Design</L>
        <Seg small={small} items={["Field guide", "Woodblock"]} />
      </div>
      <div>
        <L small={small}>Layout</L>
        <LayoutIcons small={small} />
      </div>
      <div>
        <L small={small}>Labels</L>
        <Seg small={small} items={["Names", "Numbers", "No text"]} />
      </div>
      <div>
        <L small={small}>Background</L>
        <Swatches />
      </div>
    </div>
  );
}

export function TopBar({ children }: { children?: ReactNode }) {
  return (
    <header
      className="flex items-center justify-between border-b px-4 py-2.5"
      style={{ borderColor: "var(--line)", background: "var(--surface)" }}
    >
      <span className="text-xl font-bold" style={{ fontFamily: DISPLAY }}>
        animarka
      </span>
      {children}
      <span className="flex gap-2">
        <Btn small>Undo</Btn>
        <Btn small>Redo</Btn>
        <Btn small primary>
          Export
        </Btn>
      </span>
    </header>
  );
}

export function Panel({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex min-h-0 flex-col gap-2.5 overflow-hidden border-r p-3 ${className}`}
      style={{ borderColor: "var(--line)", background: "var(--surface)" }}
    >
      {title && (
        <p
          className="text-[11px] font-semibold tracking-wide uppercase"
          style={{ color: "var(--muted)" }}
        >
          {title}
        </p>
      )}
      {children}
    </section>
  );
}

export function Option({
  id,
  name,
  rec,
  children,
  source,
}: {
  id: string;
  name: string;
  rec?: boolean;
  children: ReactNode;
  source: { label: string; url: string };
}) {
  return (
    <section aria-labelledby={`o-${id}`} className="space-y-2">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <h3 id={`o-${id}`} className="text-lg font-semibold">
          {id}. {name}
        </h3>
        {rec && (
          <span className="rounded bg-green-900 px-2 py-0.5 text-xs text-white">
            Recommended
          </span>
        )}
        <a className="text-xs text-neutral-600 underline" href={source.url}>
          Source: {source.label}
        </a>
      </div>
      {children}
    </section>
  );
}
