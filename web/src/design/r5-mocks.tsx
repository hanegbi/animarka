/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, type ReactNode } from "react";
import { Stage } from "./picker-mocks";

/** Mock-ups for round R5. Real data, our tokens. Nothing here ships. */

const MUTED = { color: "var(--muted)" };
const OUTLINE = { borderColor: "var(--line)" };
const SOFT = "color-mix(in srgb, var(--accent) 12%, var(--surface))";
const IDS = [
  "bubo-bubo",
  "alcedo-atthis",
  "falco-peregrinus",
  "ardea-cinerea",
  "anas-platyrhynchos",
  "cygnus-olor",
];
const art = (id: string) => `/art/fg/${id}.webp`;

const Btn = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-[var(--r-md)] border px-3 py-2 text-sm"
    style={{ ...OUTLINE, background: "var(--surface)" }}
  >
    {children}
  </button>
);

/* ---------- Motion (interactive) ---------- */

type Motion = "ease" | "spring" | "stagger" | "pop" | "none";

// Two arrangements of six birds. Percent of the box.
const A: [number, number][] = [
  [18, 28],
  [50, 28],
  [82, 28],
  [18, 74],
  [50, 74],
  [82, 74],
];
const B: [number, number][] = [
  [50, 50],
  [20, 22],
  [80, 24],
  [20, 78],
  [80, 76],
  [50, 18],
];

function positionTransition(kind: Motion, i: number): string {
  switch (kind) {
    case "ease":
      return "left .2s cubic-bezier(.2,.8,.2,1), top .2s cubic-bezier(.2,.8,.2,1)";
    case "spring":
      return "left .5s cubic-bezier(.34,1.56,.64,1), top .5s cubic-bezier(.34,1.56,.64,1)";
    case "stagger":
      return `left .2s cubic-bezier(.2,.8,.2,1) ${i * 35}ms, top .2s cubic-bezier(.2,.8,.2,1) ${i * 35}ms`;
    default:
      return "";
  }
}

function flipTransition(kind: Motion): string {
  if (kind === "none" || kind === "pop") return "";
  return kind === "spring"
    ? "transform .35s cubic-bezier(.34,1.56,.64,1)"
    : "transform .18s ease";
}

export function MotionDemo({ kind }: { kind: Motion }) {
  const [alt, setAlt] = useState(false);
  const [flip, setFlip] = useState(false);
  const [tick, setTick] = useState(0);
  const pos = alt ? B : A;
  return (
    <Stage>
      <div
        className="relative mb-3 aspect-[3/2] w-full overflow-hidden rounded-[var(--r-md)]"
        style={{ background: "#F8F4EA" }}
      >
        {IDS.map((id, i) => (
          <img
            key={`${id}-${kind === "pop" ? tick : 0}`}
            src={art(id)}
            alt=""
            className="absolute h-[34%] w-[22%] -translate-x-1/2 -translate-y-1/2 object-contain motion-reduce:transition-none"
            style={{
              left: `${pos[i][0]}%`,
              top: `${pos[i][1]}%`,
              transition: [
                positionTransition(kind, i),
                i === 0 ? flipTransition(kind) : "",
              ]
                .filter(Boolean)
                .join(", "),
              ...(kind === "pop"
                ? { animation: "r5pop .22s ease-out both" }
                : {}),
              transform: `translate(-50%, -50%) scaleX(${i === 0 && flip ? -1 : 1})`,
            }}
          />
        ))}
        <style>{`@keyframes r5pop { from { opacity: 0; scale: .8 } to { opacity: 1; scale: 1 } } @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }`}</style>
      </div>
      <div className="flex gap-2">
        <Btn
          onClick={() => {
            setAlt((v) => !v);
            setTick((t) => t + 1);
          }}
        >
          Rearrange
        </Btn>
        <Btn onClick={() => setFlip((v) => !v)}>Flip the owl</Btn>
      </div>
    </Stage>
  );
}

/* ---------- Drag and drop (diagrams) ---------- */

function Cell({
  id,
  ghost,
  ring,
  drag,
}: {
  id?: string;
  ghost?: boolean;
  ring?: boolean;
  drag?: boolean;
}) {
  return (
    <span
      className="relative grid aspect-square place-items-center rounded-[var(--r-md)] border"
      style={{
        ...OUTLINE,
        background: ghost ? "transparent" : "var(--surface)",
        borderStyle: ghost ? "dashed" : "solid",
        boxShadow: ring ? "0 0 0 2px var(--accent)" : undefined,
        transform: drag ? "translate(14px,-10px) rotate(4deg)" : undefined,
        zIndex: drag ? 2 : 0,
      }}
    >
      {id && <img src={art(id)} alt="" className="h-9 object-contain" />}
    </span>
  );
}

export function DnDKit() {
  return (
    <Stage>
      <div className="grid grid-cols-3 gap-2">
        <Cell id={IDS[1]} />
        <Cell id={IDS[0]} drag />
        <Cell id={IDS[2]} ring />
        <Cell id={IDS[3]} />
        <Cell id={IDS[4]} />
        <Cell id={IDS[5]} />
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        The bird follows your finger. The target glows. On drop, the two swap.
        Space picks up, arrow keys move, Space drops, with spoken hints.
      </p>
    </Stage>
  );
}

export function DnDPointer() {
  return (
    <Stage>
      <div className="grid grid-cols-3 gap-2">
        <Cell id={IDS[1]} />
        <Cell id={IDS[0]} drag />
        <Cell id={IDS[2]} ring />
        <Cell id={IDS[3]} />
        <Cell id={IDS[4]} />
        <Cell id={IDS[5]} />
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        Looks the same to a user. Our own small code on pointer events, as in
        the prototype. Arrow keys move a focused bird. No library to update.
      </p>
    </Stage>
  );
}

export function DnDSwapy() {
  return (
    <Stage>
      <div className="grid grid-cols-3 gap-2">
        <Cell id={IDS[1]} />
        <Cell ghost ring />
        <Cell id={IDS[2]} />
        <Cell id={IDS[3]} />
        <Cell id={IDS[4]} />
        <Cell id={IDS[5]} />
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        A swap library. The dragged bird leaves a dashed slot, and the one
        underneath slides into it as you pass. Touch works, keyboard support is
        limited.
      </p>
    </Stage>
  );
}

export function DnDTap() {
  return (
    <Stage>
      <div className="grid grid-cols-3 gap-2">
        <Cell id={IDS[1]} />
        <Cell id={IDS[0]} ring />
        <Cell id={IDS[2]} />
        <Cell id={IDS[3]} />
        <Cell id={IDS[4]} />
        <Cell id={IDS[5]} />
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        No dragging. Tap one bird, it gets a ring, tap another, they swap. But
        the PRD says tap mirrors, so a second gesture is needed to choose swap,
        such as a Swap mode button.
      </p>
    </Stage>
  );
}

export function DnDTray() {
  return (
    <Stage>
      <div className="grid grid-cols-6 gap-1">
        {IDS.map((id, i) => (
          <span
            key={id}
            className="relative grid place-items-center rounded-[var(--r-sm)] border py-1 text-[8px]"
            style={OUTLINE}
          >
            <img src={art(id)} alt="" className="h-7 object-contain" />
            <span style={MUTED}>{i + 1} ⠿</span>
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        The poster only mirrors on tap. Reordering happens in the tray with grip
        handles, as a list. No dragging over a busy poster.
      </p>
    </Stage>
  );
}

/* ---------- Toasts ---------- */

const toastBox =
  "flex items-center gap-3 rounded-[var(--r-md)] border px-3 py-2 text-sm shadow-[var(--shadow-hi)]";

export function ToastSonner() {
  return (
    <Stage>
      <div
        className={toastBox}
        style={{ ...OUTLINE, background: "var(--surface)" }}
      >
        <span>Mute Swan removed</span>
        <button
          type="button"
          className="ms-auto text-sm font-semibold"
          style={{ color: "var(--accent)" }}
        >
          Undo
        </button>
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        One toast at a time, bottom center, gone after 5 seconds. The shadcn
        default. Small and well tested.
      </p>
    </Stage>
  );
}

export function ToastStack() {
  return (
    <Stage>
      <div className="relative h-24">
        {["Link copied", "Poster saved", "Mute Swan removed"].map((t, i) => (
          <div
            key={t}
            className={`${toastBox} absolute inset-x-0`}
            style={{
              ...OUTLINE,
              background: "var(--surface)",
              bottom: i * 8,
              transform: `scale(${1 - (2 - i) * 0.04})`,
              zIndex: i,
              opacity: 1 - (2 - i) * 0.15,
            }}
          >
            {t}
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        Several toasts stack and fan out on hover. Built on Base UI, the same
        library as our components.
      </p>
    </Stage>
  );
}

export function ToastMorph() {
  return (
    <Stage>
      <div
        className="mx-auto flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm shadow-[var(--shadow-hi)]"
        style={{ ...OUTLINE, background: "var(--surface)" }}
      >
        <span
          className="grid size-5 place-items-center rounded-full text-xs"
          style={{ background: "var(--accent)", color: "var(--on-accent)" }}
        >
          ✓
        </span>
        Link copied
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        One pill. A new message morphs it in place with a spring. Playful, but
        only one message at a time, so Undo has no room.
      </p>
    </Stage>
  );
}

export function ToastUndo() {
  return (
    <Stage>
      <div
        className={`${toastBox} flex-col items-stretch`}
        style={{ ...OUTLINE, background: "var(--surface)" }}
      >
        <span>Cleared 12 birds</span>
        <span className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-[var(--r-sm)] border px-2 py-1 text-xs font-semibold"
            style={OUTLINE}
          >
            Undo
          </button>
          <span
            className="h-1 flex-1 rounded-full"
            style={{ background: "var(--line)" }}
          >
            <span
              className="block h-full w-2/3 rounded-full"
              style={{ background: "var(--accent)" }}
            />
          </span>
        </span>
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        A toast with an Undo button and a countdown bar, for anything
        destructive. The Undo toast the PRD asks for.
      </p>
    </Stage>
  );
}

export function ToastInline() {
  return (
    <Stage>
      <div
        className="flex items-center gap-2 rounded-[var(--r-md)] border-s-4 px-3 py-2 text-sm"
        style={{ borderColor: "var(--accent)", background: SOFT }}
      >
        Link copied. Anyone with it can open this poster.
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        No floating toast. A message bar inside the panel, read aloud by screen
        readers. Never covers the poster, but easy to miss.
      </p>
    </Stage>
  );
}

/* ---------- Tooltips ---------- */

const bubble =
  "rounded-[var(--r-sm)] px-2 py-1 text-xs shadow-[var(--shadow-hi)]";
const dark = { background: "var(--text)", color: "var(--bg)" };

export function TipShadcn() {
  return (
    <Stage>
      <div className="flex items-end gap-6 pt-8">
        <span className="relative">
          <img
            src={art(IDS[5])}
            alt=""
            className="size-11 rounded-full border bg-[#F8F4EA] object-contain"
            style={OUTLINE}
          />
          <span
            className={`${bubble} absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap`}
            style={dark}
          >
            Mute Swan
          </span>
        </span>
        <span className="relative">
          <span
            className="grid size-11 place-items-center rounded-[var(--r-md)] border text-sm"
            style={OUTLINE}
          >
            ↶
          </span>
          <span
            className={`${bubble} absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap`}
            style={dark}
          >
            Undo
          </span>
        </span>
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        Plain dark label on hover and focus. The shadcn default.
      </p>
    </Stage>
  );
}

export function TipShortcut() {
  return (
    <Stage>
      <div className="flex items-end gap-6 pt-8">
        <span className="relative">
          <span
            className="grid size-11 place-items-center rounded-[var(--r-md)] border text-sm"
            style={OUTLINE}
          >
            ↶
          </span>
          <span
            className={`${bubble} absolute -top-9 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap`}
            style={dark}
          >
            Undo{" "}
            <kbd
              className="rounded border px-1 text-[10px]"
              style={{ borderColor: "rgb(255 255 255 / .35)" }}
            >
              Ctrl Z
            </kbd>
          </span>
        </span>
        <span className="relative">
          <img
            src={art(IDS[0])}
            alt=""
            className="size-11 rounded-full border bg-[#F8F4EA] object-contain"
            style={OUTLINE}
          />
          <span
            className={`${bubble} absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap`}
            style={dark}
          >
            Eurasian Eagle-Owl
            <br />
            <i className="opacity-70">Bubo bubo</i>
          </span>
        </span>
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        Same label plus the keyboard shortcut and the scientific name. Teaches
        the shortcuts.
      </p>
    </Stage>
  );
}

export function TipCard() {
  return (
    <Stage>
      <div className="flex items-end pt-24">
        <span className="relative">
          <img
            src={art(IDS[0])}
            alt=""
            className="size-11 rounded-full border bg-[#F8F4EA] object-contain"
            style={OUTLINE}
          />
          <span
            className="absolute -top-[88px] left-0 flex w-44 items-center gap-2 rounded-[var(--r-md)] border p-2 shadow-[var(--shadow-hi)]"
            style={{ ...OUTLINE, background: "var(--surface)" }}
          >
            <img src={art(IDS[0])} alt="" className="h-12 object-contain" />
            <span className="text-xs leading-tight">
              <b>Eurasian Eagle-Owl</b>
              <br />
              <i style={MUTED}>Bubo bubo</i>
              <br />
              <span style={MUTED}>Owls · 2.7 kg</span>
            </span>
          </span>
        </span>
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        A small card with a larger picture, the family and the weight. Rich, but
        heavy for every thumbnail, and hover only.
      </p>
    </Stage>
  );
}

export function TipDelay() {
  return (
    <Stage>
      <div className="flex items-end gap-6 pt-8">
        <span className="relative">
          <span
            className="grid size-11 place-items-center rounded-[var(--r-md)] border text-sm"
            style={OUTLINE}
          >
            ⇄
          </span>
          <span
            className={`${bubble} absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap`}
            style={dark}
          >
            Shuffle layout
          </span>
        </span>
        <span className="text-xs" style={MUTED}>
          Shows after 600 ms, so it does not flash as the pointer passes by.
        </span>
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        The same plain label with an open delay. Calmer for a toolbar people
        move across.
      </p>
    </Stage>
  );
}

export function TipNative() {
  return (
    <Stage>
      <div className="flex items-end gap-4 pt-2">
        <span
          title="Mute Swan"
          className="grid size-11 place-items-center rounded-full border"
          style={OUTLINE}
        >
          <img src={art(IDS[5])} alt="" className="size-9 object-contain" />
        </span>
        <span
          className="rounded border px-2 py-1 text-xs"
          style={{ ...OUTLINE, background: "#ffffe1", color: "#000" }}
        >
          Mute Swan
        </span>
      </div>
      <p className="mt-3 text-xs" style={MUTED}>
        The browser&apos;s own title tooltip. Zero code and zero weight, but it
        looks different in every browser, never shows on touch and cannot show a
        shortcut.
      </p>
    </Stage>
  );
}

/* ---------- Empty states ---------- */

export function EmptyCard() {
  return (
    <Stage>
      <div
        className="rounded-[var(--r-lg)] border border-dashed p-5 text-center"
        style={OUTLINE}
      >
        <p className="font-heading text-base font-semibold">
          Your poster is empty
        </p>
        <p className="mt-1 text-xs" style={MUTED}>
          Pick birds on the left, or start with a mix.
        </p>
        <div className="mt-3 flex justify-center gap-2">
          <Btn>Surprise mix</Btn>
          <Btn>Owls of the world</Btn>
        </div>
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        Text and two buttons on the empty poster. Clear and quick.
      </p>
    </Stage>
  );
}

export function EmptyGhost() {
  return (
    <Stage>
      <div
        className="mx-auto grid aspect-[3/4] w-32 grid-cols-3 gap-1 rounded-[2px] border border-dashed p-2"
        style={{ ...OUTLINE, background: "#F8F4EA" }}
      >
        {Array.from({ length: 12 }, (_, i) => (
          <span
            key={i}
            className="rounded-full"
            style={{
              background: "color-mix(in srgb, var(--muted) 14%, transparent)",
              aspectRatio: "3/4",
            }}
          />
        ))}
      </div>
      <p className="mt-2 text-center text-xs font-semibold">
        Tap a bird to place it
      </p>
      <p className="text-center text-xs" style={MUTED}>
        A ghost poster with faint slots shows where the birds will go.
      </p>
    </Stage>
  );
}

export function EmptySearch() {
  return (
    <Stage>
      <p className="text-sm font-semibold">No bird matches &ldquo;zzz&rdquo;</p>
      <p className="mt-1 text-xs" style={MUTED}>
        Try a name, a family or a Latin name.
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {["kestrel", "heron", "owl", "swan"].map((t) => (
          <span
            key={t}
            className="rounded-[var(--r-pill)] border px-2.5 py-1 text-xs"
            style={OUTLINE}
          >
            {t}
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        For a search with no results. Suggests words to try.
      </p>
    </Stage>
  );
}

export function EmptyMarquee() {
  return (
    <Stage>
      <div
        className="relative h-24 overflow-hidden rounded-[var(--r-md)]"
        style={{ background: SOFT }}
      >
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="mx-3 mt-3 flex items-center gap-2">
            <span
              className="size-6 rounded-full"
              style={{ background: "var(--line)" }}
            />
            <span
              className="h-2 flex-1 rounded-full"
              style={{ background: "var(--line)" }}
            />
          </span>
        ))}
        <span
          className="absolute inset-x-0 bottom-0 h-12"
          style={{ background: "linear-gradient(transparent, var(--surface))" }}
        />
      </div>
      <p className="mt-2 text-sm font-semibold">Nothing here yet</p>
      <p className="text-xs" style={MUTED}>
        Faded placeholder rows with a short line. Pretty, but it says nothing
        about what to do.
      </p>
    </Stage>
  );
}

export function EmptyIcon() {
  return (
    <Stage>
      <div className="grid place-items-center gap-1 py-3 text-center">
        <span
          className="grid size-12 place-items-center rounded-full border text-xl"
          style={OUTLINE}
        >
          🪶
        </span>
        <p className="text-sm font-semibold">No birds yet</p>
        <p className="text-xs" style={MUTED}>
          Search or tap a card to add one.
        </p>
      </div>
      <p className="text-xs" style={MUTED}>
        A small icon, one line and one hint. The quietest option.
      </p>
    </Stage>
  );
}

/* ---------- Loading states ---------- */

const pulse = "animate-pulse motion-reduce:animate-none";

export function LoadShimmer() {
  return (
    <Stage>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <span
            key={i}
            className={`${pulse} h-24 rounded-[var(--r-md)] border`}
            style={{
              ...OUTLINE,
              background:
                "linear-gradient(90deg, var(--line), color-mix(in srgb, var(--line) 40%, var(--surface)), var(--line))",
            }}
          />
        ))}
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        Gray card shapes with a moving shine, where the bird cards will be.
      </p>
    </Stage>
  );
}

export function LoadPoster() {
  return (
    <Stage>
      <div
        className="mx-auto aspect-[3/4] w-32 rounded-[2px] p-2"
        style={{ background: "#F8F4EA" }}
      >
        <span
          className={`${pulse} mx-auto mb-2 block h-3 w-16 rounded-full`}
          style={{ background: "var(--line)" }}
        />
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 9 }, (_, i) => (
            <span
              key={i}
              className={`${pulse} aspect-[3/4] rounded-[var(--r-sm)]`}
              style={{
                background: "var(--line)",
                animationDelay: `${i * 80}ms`,
              }}
            />
          ))}
        </div>
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        The poster shape with soft blocks, so the page does not jump when the
        real poster arrives.
      </p>
    </Stage>
  );
}

export function LoadSwap() {
  return (
    <Stage>
      <div className="grid grid-cols-3 gap-2">
        {IDS.slice(0, 3).map((id) => (
          <span
            key={id}
            className="relative h-24 overflow-hidden rounded-[var(--r-md)] border"
            style={OUTLINE}
          >
            <span
              className="absolute inset-0"
              style={{ background: "var(--line)", opacity: 0.45 }}
            />
            <img
              src={art(id)}
              alt=""
              className="relative h-full w-full object-contain p-1"
              style={{ opacity: 0.7 }}
            />
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs" style={MUTED}>
        Each card holds its size and the picture fades in over the gray block.
        No layout shift, which matters for the speed budget.
      </p>
    </Stage>
  );
}

export function LoadProgress() {
  return (
    <Stage>
      <div className="grid place-items-center gap-2 py-4">
        <span
          className="h-1.5 w-40 overflow-hidden rounded-full"
          style={{ background: "var(--line)" }}
        >
          <span
            className="block h-full w-1/3 rounded-full"
            style={{ background: "var(--accent)" }}
          />
        </span>
        <p className="text-sm">Loading your poster</p>
      </div>
      <p className="text-xs" style={MUTED}>
        A thin bar and one line of text. Honest, and cheap, but it hides the
        layout.
      </p>
    </Stage>
  );
}

export function LoadBirds() {
  return (
    <Stage>
      <div className="mx-auto flex w-fit items-end gap-1 py-4">
        {IDS.slice(0, 4).map((id, i) => (
          <img
            key={id}
            src={art(id)}
            alt=""
            className={`h-12 object-contain ${pulse}`}
            style={{ opacity: 0.35 + i * 0.2, animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      <p className="text-center text-sm">Gathering your birds</p>
      <p className="mt-2 text-xs" style={MUTED}>
        Four real birds fade in one after another. On brand, but it is a
        decoration that has to load images to work.
      </p>
    </Stage>
  );
}
