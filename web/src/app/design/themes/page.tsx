/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { SPECIES, STARTER_IDS } from "@/catalog/static-m1";
import { contrastRatio, grade, passesText } from "@/design/contrast";
import { FONT_VARIABLE_CLASSES, PAIRINGS, type Pairing } from "@/design/fonts";
import { THEMES, type Theme } from "@/design/themes";

const BY_ID = new Map(SPECIES.map((s) => [s.id, s]));
const FAMILIES = ["All", "Owls", "Raptors", "Ducks", "Herons", "Woodpeckers"];
const PICKER = [
  "bubo-bubo",
  "falco-peregrinus",
  "alcedo-atthis",
  "ardea-cinerea",
  "tyto-alba",
  "anas-platyrhynchos",
];
const RECOMMENDED_THEME = "A";
const RECOMMENDED_PAIRING = 1;
const DEFAULT_PAIRING = PAIRINGS[2]; // the prototype pair, so the theme choice is not mixed with a type choice
const POSTER_PAPER = "#F8F4EA";
const POSTER_INK = "#1E1B16";

function vars(t: Theme): CSSProperties {
  return {
    "--bg": t.bg,
    "--surface": t.surface,
    "--text": t.text,
    "--muted": t.muted,
    "--line": t.line,
    "--accent": t.accent,
    "--accent-strong": t.accentStrong,
    "--on-accent": t.onAccent,
    "--second": t.second,
    colorScheme: t.dark ? "dark" : "light",
  } as CSSProperties;
}

function Ratio({ a, b, label }: { a: string; b: string; label: string }) {
  const r = contrastRatio(a, b);
  const g = grade(r);
  const ok = passesText(r);
  return (
    <tr className="border-t border-black/10">
      <td className="py-1 pr-3">{label}</td>
      <td className="py-1 pr-3 whitespace-nowrap">
        <span
          className="mr-1 inline-block size-3 rounded-sm align-middle ring-1 ring-black/20"
          style={{ background: a }}
        />
        {a}
        <span className="mx-1">on</span>
        <span
          className="mr-1 inline-block size-3 rounded-sm align-middle ring-1 ring-black/20"
          style={{ background: b }}
        />
        {b}
      </td>
      <td className="py-1 pr-3 text-right tabular-nums">{r.toFixed(2)}</td>
      <td
        className={`py-1 font-medium ${ok ? "text-green-800" : g === "fail" ? "text-red-700" : "text-amber-700"}`}
      >
        {g}
      </td>
    </tr>
  );
}

function ContrastTable({ t }: { t: Theme }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-3 text-xs text-neutral-900">
      <p className="mb-1 text-sm font-semibold">
        {t.id}. {t.name}
      </p>
      <table className="w-full">
        <tbody>
          <Ratio label="Text" a={t.text} b={t.bg} />
          <Ratio label="Muted text" a={t.muted} b={t.bg} />
          <Ratio label="Muted on card" a={t.muted} b={t.surface} />
          <Ratio label={`${t.accentName} as given`} a={t.accent} b={t.bg} />
          <Ratio
            label={`Label on ${t.accentName} as given`}
            a={t.onAccent}
            b={t.accent}
          />
          {t.accentStrong !== t.accent && (
            <>
              <Ratio
                label={`${t.accentName} adjusted`}
                a={t.accentStrong}
                b={t.bg}
              />
              <Ratio
                label="Label on adjusted"
                a={t.onAccent}
                b={t.accentStrong}
              />
            </>
          )}
          {t.id !== "B" && t.id !== "C" && (
            <Ratio label={`${t.secondName} as given`} a={t.second} b={t.bg} />
          )}
        </tbody>
      </table>
      <p className="mt-2 text-neutral-600">
        AA needs 4.5 for text and 3 for large text and UI shapes.
        {t.accentStrong !== t.accent &&
          " The adjusted shade is used for text and button fills."}
        {t.id === "A" && " Ochre is decoration only, never text."}
        {t.id === "D" && " Sand is decoration only, never text."}
        {t.id === "E" && " Sky and sun are decoration only, never text."}
      </p>
    </div>
  );
}

function Chip({
  id,
  on,
  pairing,
}: {
  id: string;
  on?: boolean;
  pairing: Pairing;
}) {
  const s = BY_ID.get(id)!;
  return (
    <span
      className="flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-sm"
      style={{
        fontFamily: pairing.body,
        borderColor: on ? "var(--accent-strong)" : "var(--line)",
        background: on ? "var(--accent-strong)" : "var(--surface)",
        color: on ? "var(--on-accent)" : "var(--text)",
      }}
    >
      <img
        src={`/art/fg/${id}.webp`}
        alt=""
        className="size-8 rounded-full object-contain"
        style={{ background: POSTER_PAPER }}
      />
      {s.name}
    </span>
  );
}

function MiniPoster({ pairing }: { pairing: Pairing }) {
  return (
    <div
      className="mx-auto aspect-[3/4] w-full max-w-[300px] rounded-sm p-3 shadow-xl"
      style={{ background: POSTER_PAPER, color: POSTER_INK }}
    >
      <p
        className="mb-2 text-center text-xl leading-none font-semibold"
        style={{ fontFamily: pairing.display }}
      >
        Birds
      </p>
      <div className="grid grid-cols-4 gap-1">
        {STARTER_IDS.map((id) => (
          <div key={id} className="text-center">
            <img
              src={`/art/fg/${id}.webp`}
              alt={BY_ID.get(id)!.name}
              className="mx-auto h-[62px] object-contain"
            />
            <p
              className="truncate text-[7px] leading-tight"
              style={{ fontFamily: pairing.body }}
            >
              {BY_ID.get(id)!.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Mock({ t, pairing }: { t: Theme; pairing: Pairing }) {
  return (
    <div
      style={{
        ...vars(t),
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: pairing.body,
      }}
      className="rounded-xl border p-4"
    >
      <header className="mb-4 flex items-center justify-between">
        <span
          className="text-2xl font-bold"
          style={{ fontFamily: pairing.display }}
        >
          animarka
        </span>
        <span className="flex gap-2 text-sm">
          <span
            className="rounded-md border px-3 py-1.5"
            style={{ borderColor: "var(--line)", background: "var(--surface)" }}
          >
            Undo
          </span>
          <span
            className="rounded-md px-3 py-1.5 font-medium"
            style={{
              background: "var(--accent-strong)",
              color: "var(--on-accent)",
            }}
          >
            Export
          </span>
        </span>
      </header>
      <div className="grid gap-4 md:grid-cols-[1fr_1.1fr]">
        <section
          className="rounded-lg border p-3"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        >
          <p
            className="mb-1 text-xs font-semibold tracking-wide uppercase"
            style={{ color: "var(--muted)" }}
          >
            Add birds from any family
          </p>
          <div
            className="mb-2 rounded-md border px-3 py-2 text-sm"
            style={{ borderColor: "var(--line)", color: "var(--muted)" }}
          >
            Search all birds, try kestrel or heron
          </div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {FAMILIES.map((f, i) => (
              <span
                key={f}
                className="rounded-full border px-3 py-1 text-xs"
                style={{
                  borderColor: i === 1 ? "var(--accent-strong)" : "var(--line)",
                  background: i === 1 ? "var(--accent-strong)" : "transparent",
                  color: i === 1 ? "var(--on-accent)" : "var(--text)",
                }}
              >
                {f}
                {i === 1 && <b className="ml-1">3</b>}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PICKER.map((id, i) => (
              <Chip key={id} id={id} on={i % 2 === 0} pairing={pairing} />
            ))}
          </div>
          <p className="mt-3 text-sm">
            <span style={{ color: "var(--muted)" }}>Your poster</span> (12 birds
            from 9 families)
          </p>
          <div className="mt-2 flex gap-2 text-xs">
            <span
              className="rounded-md border px-3 py-1.5"
              style={{ borderColor: "var(--line)" }}
            >
              Surprise mix
            </span>
            <span
              className="rounded-md border px-3 py-1.5"
              style={{ borderColor: "var(--line)" }}
            >
              Clear poster
            </span>
          </div>
          <div
            className="mt-3 inline-flex overflow-hidden rounded-md border text-xs"
            style={{ borderColor: "var(--line)" }}
          >
            <span
              className="px-3 py-1.5"
              style={{
                background: "var(--accent-strong)",
                color: "var(--on-accent)",
              }}
            >
              Field guide
            </span>
            <span className="px-3 py-1.5">Woodblock</span>
          </div>
          <p className="mt-3 text-xs" style={{ color: "var(--accent-strong)" }}>
            Report a wrong bird
          </p>
          <div className="mt-3 flex gap-2" aria-hidden>
            <span
              className="size-6 rounded-full"
              style={{ background: "var(--accent)" }}
            />
            <span
              className="size-6 rounded-full"
              style={{ background: "var(--second)" }}
            />
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              brand shapes: {t.accentName} and {t.secondName}
            </span>
          </div>
        </section>
        <MiniPoster pairing={pairing} />
      </div>
    </div>
  );
}

function ThemeOption({ t }: { t: Theme }) {
  const rec = t.id === RECOMMENDED_THEME;
  return (
    <section aria-labelledby={`th-${t.id}`} className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <h3 id={`th-${t.id}`} className="text-xl font-semibold">
          {t.id}. {t.name}
        </h3>
        {rec && (
          <span className="rounded bg-green-900 px-2 py-0.5 text-xs text-white">
            Recommended
          </span>
        )}
        <span className="text-sm text-neutral-600">{t.feel}</span>
      </div>
      <p className="text-xs text-neutral-600">
        Closest 21st.dev community theme, for reference only:{" "}
        <a className="underline" href={t.reference.url}>
          {t.reference.name}
        </a>
        . The colors below are your PRD values.
      </p>
      <Mock t={t} pairing={DEFAULT_PAIRING} />
    </section>
  );
}

function PairingOption({ p }: { p: Pairing }) {
  const t = THEMES[0];
  const rec = p.id === RECOMMENDED_PAIRING;
  return (
    <section
      aria-labelledby={`pr-${p.id}`}
      className="space-y-2 rounded-xl border p-4"
      style={{ ...vars(t), background: "var(--bg)", color: "var(--text)" }}
    >
      <div className="flex flex-wrap items-baseline gap-x-3">
        <h3
          id={`pr-${p.id}`}
          className="text-base font-semibold"
          style={{ fontFamily: "system-ui" }}
        >
          {p.id}. {p.name}
        </h3>
        {rec && (
          <span className="rounded bg-green-900 px-2 py-0.5 text-xs text-white">
            Recommended
          </span>
        )}
      </div>
      <p
        className="text-4xl leading-tight font-semibold"
        style={{ fontFamily: p.display }}
      >
        Birds of the world
      </p>
      <p className="text-2xl italic" style={{ fontFamily: p.display }}>
        Eurasian Eagle-Owl, Common Kingfisher
      </p>
      <p className="text-base" style={{ fontFamily: p.body }}>
        Pick any birds you like, arrange them on a poster and switch the art
        style with one tap.
      </p>
      <p
        className="text-xs"
        style={{ fontFamily: p.body, color: "var(--muted)" }}
      >
        1 Western Barn Owl 2 Short-eared Owl 3 Little Owl 4 Long-eared Owl
      </p>
      <p
        dir="rtl"
        lang="he"
        className="text-2xl"
        style={{ fontFamily: p.display }}
      >
        בנו פוסטר חיות בר משלכם
      </p>
      <p dir="rtl" lang="he" className="text-sm" style={{ fontFamily: p.body }}>
        בחרו ציפורים, סדרו אותן על הפוסטר והחליפו סגנון בלחיצה.
      </p>
      <p
        className="text-sm"
        style={{ fontFamily: "system-ui", color: "var(--muted)" }}
      >
        {p.note} Hebrew uses {p.hebrewDisplay} for titles and {p.hebrewBody} for
        text. Strength: {p.strength} Weakness: {p.weakness}
      </p>
    </section>
  );
}

export default function ThemesRound() {
  return (
    <div
      className={`${FONT_VARIABLE_CLASSES} mx-auto max-w-6xl space-y-10 bg-neutral-100 p-4 text-neutral-900 md:p-8`}
    >
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Round R1: color theme and type</h1>
        <p className="max-w-3xl text-sm text-neutral-700">
          Dev only page. Part 1 shows your five color directions on the same
          builder screen. Part 2 shows five type pairings. All fonts are open
          source and free for commercial use, and can be embedded in the PDF.
          Hebrew has its own fonts, because the Latin fonts have no Hebrew
          letters.
        </p>
      </header>

      <section aria-labelledby="contrast" className="space-y-3">
        <h2 id="contrast" className="text-2xl font-semibold">
          Contrast check
        </h2>
        <p className="max-w-3xl text-sm text-neutral-700">
          Three of your accents fail AA when used for text or button fills:
          terracotta, heron blue and coral. For those I made a slightly darker
          adjusted shade, used only for text and buttons. Your original color
          stays for large shapes, icons and decoration.
        </p>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {THEMES.map((t) => (
            <ContrastTable key={t.id} t={t} />
          ))}
        </div>
      </section>

      <section aria-labelledby="part1" className="space-y-8">
        <h2 id="part1" className="text-2xl font-semibold">
          Part 1. Color theme
        </h2>
        {THEMES.map((t) => (
          <ThemeOption key={t.id} t={t} />
        ))}
      </section>

      <section aria-labelledby="part2" className="space-y-4">
        <h2 id="part2" className="text-2xl font-semibold">
          Part 2. Type pairing
        </h2>
        <p className="text-sm text-neutral-700">
          Shown on theme A. The poster title uses the serif. The interface uses
          the sans.
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          {PAIRINGS.map((p) => (
            <PairingOption key={p.id} p={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
