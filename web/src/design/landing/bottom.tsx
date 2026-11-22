/* eslint-disable @next/next/no-img-element */
"use client";

import {
  ArrowLeftRightIcon,
  FlipHorizontal2Icon,
  ImageIcon,
  LanguagesIcon,
  LinkIcon,
  MinusCircleIcon,
  PencilIcon,
  PrinterIcon,
  ShuffleIcon,
} from "lucide-react";
import { useState } from "react";
import { FAQ, Framed, img, Logo, Poster, Primary } from "./shared";

const H2 = ({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) => (
  <h2
    className={`font-heading text-[44px] leading-[1.08] font-semibold tracking-tight text-balance ${className}`}
  >
    {children}
  </h2>
);

/* ---------------- Make it yours ---------------- */

const TOUCHES = [
  {
    icon: FlipHorizontal2Icon,
    t: "Tap to mirror",
    d: "Turn any bird to face the other way.",
  },
  {
    icon: ArrowLeftRightIcon,
    t: "Drag to swap",
    d: "Drop one bird on another to trade places.",
  },
  {
    icon: MinusCircleIcon,
    t: "Drag off to remove",
    d: "Pull a bird off the poster and let go.",
  },
  {
    icon: PencilIcon,
    t: "Rename any bird",
    d: "Click a name and type your own.",
  },
  {
    icon: ShuffleIcon,
    t: "Three layouts",
    d: "Scattered, Grid or Centerpiece. Shuffle for a new mix.",
  },
  {
    icon: LanguagesIcon,
    t: "English or Hebrew",
    d: "Names in either language, right to left when needed.",
  },
];

export function F1() {
  return (
    <section className="bg-background flex flex-col gap-10 px-16 py-20">
      <H2>Small touches, big difference.</H2>
      <div className="grid grid-cols-3 grid-rows-[220px_220px] gap-4">
        <div className="bg-card row-span-2 overflow-hidden rounded-[14px] border p-6">
          <p className="font-heading text-xl font-semibold">
            Eight backgrounds
          </p>
          <img
            src={img("woodpeckers-wb", true)}
            alt="Woodpeckers on forest green"
            className="mx-auto mt-4 w-[75%] shadow-lg"
          />
        </div>
        {TOUCHES.slice(0, 4).map(({ icon: Icon, t, d }) => (
          <div
            key={t}
            className="bg-card flex flex-col justify-end gap-2 rounded-[14px] border p-6"
          >
            <Icon aria-hidden className="text-primary size-7" />
            <p className="font-heading text-xl font-semibold">{t}</p>
            <p className="text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const NOTES: { t: string; x: string; y: string; side: "l" | "r" }[] = [
  { t: "Tap a bird to mirror it", x: "18%", y: "18%", side: "l" },
  { t: "Drag onto another bird to swap", x: "60%", y: "15%", side: "r" },
  { t: "Click a name to rename it", x: "40%", y: "62%", side: "l" },
  { t: "Drag off the poster to remove", x: "75%", y: "72%", side: "r" },
];

export function F2() {
  return (
    <section className="bg-background flex flex-col items-center gap-10 px-16 py-20">
      <div className="text-center">
        <H2>Small touches, big difference.</H2>
        <p className="text-muted-foreground mt-3 text-lg">
          Everything happens right on the poster.
        </p>
      </div>
      <div className="relative w-[900px]">
        <Poster
          name="starter-fg"
          small
          className="mx-auto w-[420px]"
          alt="A poster with notes on how to edit it"
        />
        {NOTES.map((n) => (
          <div
            key={n.t}
            className={`absolute flex items-center gap-2 ${n.side === "l" ? "right-[calc(50%+150px)] flex-row" : "left-[calc(50%+150px)] flex-row-reverse"}`}
            style={{ top: n.y }}
          >
            <span className="font-heading text-lg whitespace-nowrap italic">
              {n.t}
            </span>
            <span aria-hidden className="bg-foreground/50 h-px w-24" />
            <span
              aria-hidden
              className="border-primary bg-background size-3 rounded-full border-2"
            />
          </div>
        ))}
      </div>
      <p className="text-muted-foreground">
        Plus three layouts, eight backgrounds, three shapes, and names in
        English or Hebrew.
      </p>
    </section>
  );
}

export function F3() {
  return (
    <section className="bg-background grid grid-cols-[1fr_1.4fr] gap-16 px-16 py-20">
      <div className="flex flex-col gap-4">
        <H2>Small touches, big difference.</H2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Every poster ends up different, because every choice is yours.
        </p>
      </div>
      <ul className="grid grid-cols-2 gap-x-10 gap-y-8">
        {TOUCHES.map(({ icon: Icon, t, d }) => (
          <li key={t} className="flex gap-4">
            <span className="bg-accent text-primary grid size-11 shrink-0 place-items-center rounded-[10px]">
              <Icon aria-hidden className="size-5" />
            </span>
            <div>
              <p className="font-semibold">{t}</p>
              <p className="text-muted-foreground">{d}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function F4() {
  return (
    <section className="bg-background flex flex-col gap-10 px-16 py-20">
      <div className="flex items-end justify-between">
        <H2>Small touches, big difference.</H2>
        <p className="text-muted-foreground max-w-sm">
          Eight backgrounds, three layouts, three shapes. Here are four of the
          looks.
        </p>
      </div>
      <div className="grid grid-cols-4 items-end gap-6">
        {[
          ["starter-fg", "Cream, scattered"],
          ["hummingbirds", "Night, grid"],
          ["kingfishers", "Sky, 4:5"],
          ["woodpeckers-wb", "Forest, woodblock"],
        ].map(([n, c]) => (
          <figure key={n}>
            <Poster name={n} small alt={c} />
            <figcaption className="text-muted-foreground mt-2 text-sm">
              {c}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function F5() {
  return (
    <section className="bg-muted grid grid-cols-[1fr_auto_1fr] items-center gap-10 px-16 py-20">
      <figure className="flex flex-col gap-3">
        <Poster
          name="starter-fg"
          small
          alt="The starter poster"
          className="mx-auto w-[300px]"
        />
        <figcaption className="text-muted-foreground text-center text-sm">
          Where you start
        </figcaption>
      </figure>
      <div className="flex max-w-[280px] flex-col gap-4 text-center">
        <H2 className="text-[36px]">A few taps later.</H2>
        <p className="text-muted-foreground">
          Woodblock style, forest background, a taller shape, and the birds you
          care about.
        </p>
      </div>
      <figure className="flex flex-col gap-3">
        <Poster
          name="woodpeckers-wb"
          small
          alt="A finished woodblock poster"
          className="mx-auto w-[280px]"
        />
        <figcaption className="text-muted-foreground text-center text-sm">
          Where you end up
        </figcaption>
      </figure>
    </section>
  );
}

/* ---------------- Print and share ---------------- */

const PRINT_LINE =
  "300 DPI PDF and PNG, no watermark, for 18 x 24 in, 12 x 16 in, A2 and A3.";

export function P1() {
  return (
    <section className="bg-background flex flex-col items-center gap-10 px-16 py-20">
      <H2>Made for your wall.</H2>
      <div className="grid w-full max-w-4xl grid-cols-2 gap-6">
        <div className="bg-card flex flex-col gap-4 rounded-[14px] border p-8">
          <p className="font-heading text-2xl font-semibold">Preview image</p>
          <p className="font-heading text-4xl font-semibold">Free</p>
          <p className="text-muted-foreground">
            A 1,600 px image with a light watermark. Plus a link to share every
            poster.
          </p>
          <div className="mt-auto">
            <Primary>Make your poster</Primary>
          </div>
        </div>
        <div className="border-primary bg-card flex flex-col gap-4 rounded-[14px] border-2 p-8">
          <p className="font-heading text-2xl font-semibold">Print file</p>
          <p className="font-heading text-muted-foreground text-4xl font-semibold">
            Coming soon
          </p>
          <p className="text-muted-foreground">{PRINT_LINE}</p>
        </div>
      </div>
    </section>
  );
}

/** Frames drawn to scale against a 30 x 40 in wall patch, so the sizes are honest. */
const SIZES = [
  { n: "18 x 24 in", w: 18, h: 24 },
  { n: "A2", w: 16.5, h: 23.4 },
  { n: "12 x 16 in", w: 12, h: 16 },
  { n: "A3", w: 11.7, h: 16.5 },
];

export function P2() {
  return (
    <section className="bg-background grid grid-cols-[1fr_1.2fr] items-center gap-16 px-16 py-20">
      <div className="flex flex-col gap-6">
        <H2>Made for your wall.</H2>
        <dl className="flex flex-col gap-5">
          <div>
            <dt className="font-semibold">Free preview</dt>
            <dd className="text-muted-foreground">
              A 1,600 px image with a light watermark. Free, always.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Print file, coming soon</dt>
            <dd className="text-muted-foreground">{PRINT_LINE}</dd>
          </div>
          <div>
            <dt className="font-semibold">Share</dt>
            <dd className="text-muted-foreground">
              Every poster has its own link.
            </dd>
          </div>
        </dl>
      </div>
      <div className="bg-muted flex h-[440px] items-end justify-center gap-6 rounded-[16px] px-8 pb-12">
        {SIZES.map((s) => (
          <figure key={s.n} className="flex flex-col items-center gap-2">
            <div
              className="bg-foreground/80 p-[3px] shadow-lg"
              style={{ width: s.w * 11, height: s.h * 11 }}
            >
              <img
                src={img("starter-fg", true)}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className="text-sm font-medium">{s.n}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function P3() {
  const rows = [
    ["Format", "PDF and PNG"],
    ["Resolution", "300 DPI"],
    ["Sizes", "18 x 24 in, 12 x 16 in, A2, A3"],
    ["Watermark", "None"],
    ["Preview", "1,600 px, free, light watermark"],
    ["Availability", "Print file coming soon"],
  ];
  return (
    <section className="bg-background grid grid-cols-[1fr_1fr] gap-16 px-16 py-20">
      <div className="flex flex-col gap-4">
        <H2>Made for your wall.</H2>
        <p className="text-muted-foreground text-lg">
          The file is ready for any print shop.
        </p>
      </div>
      <table className="w-full text-start">
        <tbody className="divide-y border-y">
          {rows.map(([k, v]) => (
            <tr key={k}>
              <th className="py-3.5 text-start font-medium">{k}</th>
              <td className="text-muted-foreground py-3.5">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function P4() {
  return (
    <section className="bg-foreground text-background grid grid-cols-[1fr_1fr] items-center gap-16 px-16 py-20">
      <div className="flex flex-col gap-6">
        <H2>Made for your wall.</H2>
        <p className="text-lg leading-relaxed opacity-80">
          {PRINT_LINE} Coming soon. The free preview is ready today.
        </p>
        <div>
          <a
            href="/make"
            className="bg-background text-foreground inline-flex h-12 items-center rounded-[10px] px-6 font-medium"
          >
            Make your poster
          </a>
        </div>
      </div>
      <div className="relative mx-auto size-[380px] overflow-hidden rounded-full border-4 border-current shadow-2xl">
        <img
          src="/landing/owl-fg.webp"
          alt="A close look at the eagle owl in the field guide style"
          className="h-full w-full object-cover"
        />
      </div>
    </section>
  );
}

export function P5() {
  const cols = [
    {
      icon: ImageIcon,
      t: "Free preview",
      d: "A 1,600 px image with a light watermark.",
    },
    { icon: PrinterIcon, t: "Print file", d: `${PRINT_LINE} Coming soon.` },
    { icon: LinkIcon, t: "Share a link", d: "Every poster has its own link." },
  ];
  return (
    <section className="bg-background flex flex-col gap-12 px-16 py-20">
      <H2>Made for your wall.</H2>
      <div className="grid grid-cols-3 gap-10">
        {cols.map(({ icon: Icon, t, d }) => (
          <div key={t} className="flex flex-col gap-3 border-t pt-6">
            <Icon aria-hidden className="text-primary size-7" />
            <p className="font-heading text-xl font-semibold">{t}</p>
            <p className="text-muted-foreground leading-relaxed">{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */

function Acc({
  q,
  a,
  open,
  onClick,
}: {
  q: string;
  a: string;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b">
      <button
        onClick={onClick}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-5 text-start text-lg font-medium"
      >
        {q}
        <span
          aria-hidden
          className={`text-primary text-2xl transition-transform ${open ? "rotate-45" : ""}`}
        >
          +
        </span>
      </button>
      {open && (
        <p className="text-muted-foreground max-w-[64ch] pb-5 leading-relaxed">
          {a}
        </p>
      )}
    </div>
  );
}

export function Q1() {
  const [o, setO] = useState(0);
  return (
    <section className="bg-background mx-auto flex max-w-3xl flex-col gap-8 px-16 py-20">
      <H2>Questions.</H2>
      <div className="border-t">
        {FAQ.map(([q, a], i) => (
          <Acc
            key={q}
            q={q}
            a={a}
            open={o === i}
            onClick={() => setO(o === i ? -1 : i)}
          />
        ))}
      </div>
    </section>
  );
}

export function Q2() {
  return (
    <section className="bg-background flex flex-col gap-10 px-16 py-20">
      <H2>Questions.</H2>
      <dl className="grid grid-cols-2 gap-x-16 gap-y-10">
        {FAQ.map(([q, a]) => (
          <div key={q}>
            <dt className="font-heading text-xl font-semibold">{q}</dt>
            <dd className="text-muted-foreground mt-2 leading-relaxed">{a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function Q3() {
  const [o, setO] = useState(0);
  return (
    <section className="bg-background grid grid-cols-[1fr_1.6fr] gap-16 px-16 py-20">
      <div className="flex flex-col gap-4">
        <H2>Questions.</H2>
        <p className="text-muted-foreground">
          Something else? Tell us if a bird looks wrong, or ask anything.
        </p>
      </div>
      <div className="border-t">
        {FAQ.map(([q, a], i) => (
          <Acc
            key={q}
            q={q}
            a={a}
            open={o === i}
            onClick={() => setO(o === i ? -1 : i)}
          />
        ))}
      </div>
    </section>
  );
}

export function Q4() {
  return (
    <section className="bg-muted flex flex-col gap-10 px-16 py-20">
      <H2>Questions.</H2>
      <div className="grid grid-cols-3 gap-5">
        {FAQ.map(([q, a]) => (
          <div key={q} className="bg-card rounded-[14px] border p-6">
            <p className="font-semibold">{q}</p>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {a}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Q5() {
  return (
    <section className="bg-background mx-auto max-w-4xl px-16 py-20">
      <H2>Questions.</H2>
      <dl className="mt-8 divide-y border-y">
        {FAQ.map(([q, a]) => (
          <div key={q} className="grid grid-cols-[260px_1fr] gap-8 py-5">
            <dt className="font-heading text-lg font-semibold">{q}</dt>
            <dd className="text-muted-foreground leading-relaxed">{a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ---------------- Final call ---------------- */

const CTA = "Your wall is waiting.";

export function C1() {
  return (
    <section className="bg-background flex flex-col items-center gap-6 px-16 py-24 text-center">
      <H2 className="text-[56px]">{CTA}</H2>
      <p className="text-muted-foreground text-lg">
        Free, in your browser, no sign up.
      </p>
      <Primary big>Make your poster</Primary>
    </section>
  );
}

export function C2() {
  return (
    <section className="bg-primary text-primary-foreground flex flex-col items-center gap-6 px-16 py-24 text-center">
      <H2 className="text-[56px]">{CTA}</H2>
      <p className="text-lg opacity-85">
        1,161 birds, two styles, one poster that is yours.
      </p>
      <a
        href="/make"
        className="bg-background text-foreground inline-flex h-12 items-center rounded-[10px] px-6 font-medium"
      >
        Make your poster
      </a>
    </section>
  );
}

export function C3() {
  return (
    <section className="bg-muted relative h-[380px] overflow-hidden px-16">
      <div className="flex h-full max-w-lg flex-col justify-center gap-6">
        <H2 className="text-[56px]">{CTA}</H2>
        <p className="text-muted-foreground text-lg">
          Free, in your browser, no sign up.
        </p>
        <div>
          <Primary big>Make your poster</Primary>
        </div>
      </div>
      <Framed
        name="raptors"
        small
        alt="A framed poster of birds of prey"
        className="absolute top-14 right-24 w-[300px] rotate-[-3deg]"
      />
    </section>
  );
}

export function C4() {
  const row = [
    "owls",
    "israel",
    "kingfishers",
    "garden-na",
    "hummingbirds",
    "raptors",
    "woodpeckers-wb",
  ];
  return (
    <section className="bg-background relative overflow-hidden py-16">
      <div className="flex gap-6 opacity-35" aria-hidden>
        {[...row, ...row].map((n, i) => (
          <img key={i} src={img(n, true)} alt="" className="h-[300px] w-auto" />
        ))}
      </div>
      <div className="absolute inset-0 grid place-items-center">
        <div className="bg-background/90 flex flex-col items-center gap-5 rounded-[16px] border px-12 py-10 text-center shadow-xl">
          <H2 className="text-[52px]">{CTA}</H2>
          <Primary big>Make your poster</Primary>
        </div>
      </div>
    </section>
  );
}

export function C5() {
  return (
    <section className="bg-accent grid grid-cols-[1fr_1fr] items-center gap-12 px-16 py-20">
      <Framed
        name="garden-na"
        small
        alt="A framed poster on a wall"
        className="mx-auto w-[300px]"
      />
      <div className="flex flex-col gap-6">
        <H2 className="text-[56px]">{CTA}</H2>
        <p className="text-muted-foreground text-lg">
          Pick the birds, pick the style, hang it up.
        </p>
        <div>
          <Primary big>Make your poster</Primary>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */

const CREDITS = (
  <>
    Field guide art by Huashu, from{" "}
    <a
      className="underline"
      href="https://github.com/alchaincyf/huashu-bird-sticker"
    >
      huashu-bird-sticker
    </a>
    , CC BY 4.0. Woodblock art by Adam Oberley, Teddy Warner and contributors,
    from{" "}
    <a
      className="underline"
      href="https://github.com/adamoberley/HABirdDashboard"
    >
      HABirdDashboard
    </a>
    , MIT. Both sets are AI generated and may contain errors.
  </>
);

export function Z1() {
  return (
    <footer className="bg-background grid grid-cols-[1fr_2fr] gap-16 border-t px-16 py-12 text-sm">
      <div className="flex flex-col gap-3">
        <Logo />
        <a href="/make" className="text-primary font-medium">
          Make your poster
        </a>
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-muted-foreground leading-relaxed">{CREDITS}</p>
        <a className="text-foreground font-medium underline">
          Report a wrong bird
        </a>
      </div>
    </footer>
  );
}

export function Z2() {
  return (
    <footer className="bg-background overflow-hidden border-t px-16 pt-10">
      <div className="text-muted-foreground flex justify-between gap-10 text-sm">
        <p className="max-w-2xl leading-relaxed">{CREDITS}</p>
        <a className="text-foreground shrink-0 font-medium underline">
          Report a wrong bird
        </a>
      </div>
      <p className="font-heading text-foreground/90 mt-6 text-[200px] leading-[0.8] font-semibold tracking-[-0.04em]">
        animarka
      </p>
    </footer>
  );
}

export function Z3() {
  return (
    <footer className="bg-background text-muted-foreground flex items-center justify-between gap-6 border-t px-16 py-6 text-xs">
      <Logo className="text-foreground text-lg" />
      <p className="max-w-3xl text-center">{CREDITS}</p>
      <a className="text-foreground shrink-0 underline">Report a wrong bird</a>
    </footer>
  );
}

export function Z4() {
  return (
    <footer className="bg-foreground text-background grid grid-cols-[1fr_1fr_1fr] gap-12 px-16 py-14 text-sm">
      <div className="flex flex-col gap-3">
        <Logo />
        <p className="opacity-70">Illustrated bird posters, made by you.</p>
      </div>
      <div className="flex flex-col gap-2 opacity-80">
        <a href="/make">Make your poster</a>
        <a>Ready sets</a>
        <a>Report a wrong bird</a>
      </div>
      <p className="leading-relaxed opacity-70">{CREDITS}</p>
    </footer>
  );
}

export function Z5() {
  return (
    <footer className="bg-background flex flex-col items-center gap-4 border-t px-16 py-14 text-center">
      <Logo />
      <p className="text-muted-foreground font-heading max-w-2xl text-[15px] leading-relaxed italic">
        Set in Fraunces and Inter. {CREDITS}
      </p>
      <a className="text-sm font-medium underline">Report a wrong bird</a>
    </footer>
  );
}
