/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState } from "react";
import { img, Poster, Primary, SETS } from "./shared";

/* ---------------- How it works (a real sequence, so numbers are information) ---------------- */

const STEPS = [
  {
    t: "Pick your birds.",
    d: "Search 1,161 species or start from a ready set.",
    img: "ui-pick",
  },
  {
    t: "Make it yours.",
    d: "Choose a style, a layout and a background. Mirror, swap and rename any bird.",
    img: "ui-style",
  },
  {
    t: "Share or print.",
    d: "Send a link, download a free preview, or get the print file (coming soon).",
    img: "ui-export",
  },
];
const H2 = ({ children }: { children: string }) => (
  <h2 className="font-heading text-[44px] leading-[1.08] font-semibold tracking-tight text-balance">
    {children}
  </h2>
);

export function W1() {
  return (
    <section className="bg-background flex flex-col gap-12 px-16 py-20">
      <H2>Three steps to your wall.</H2>
      <ol className="grid grid-cols-3 gap-8">
        {STEPS.map((s, i) => (
          <li key={s.t} className="flex flex-col gap-4">
            <div className="bg-muted h-[260px] overflow-hidden rounded-[12px] border">
              <img
                src={`/landing/${s.img}.webp`}
                alt=""
                className="w-full object-cover object-top"
              />
            </div>
            <p className="font-heading text-primary text-lg font-semibold">
              Step {i + 1}
            </p>
            <h3 className="font-heading text-2xl font-semibold">{s.t}</h3>
            <p className="text-muted-foreground leading-relaxed">{s.d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function W2() {
  return (
    <section className="bg-background flex flex-col items-center gap-12 px-16 py-20 text-center">
      <H2>Three steps to your wall.</H2>
      <ol className="relative grid w-full max-w-4xl grid-cols-3 gap-8">
        <span
          aria-hidden
          className="bg-border absolute top-6 right-[16%] left-[16%] h-px"
        />
        {STEPS.map((s, i) => (
          <li key={s.t} className="relative flex flex-col items-center gap-3">
            <span className="bg-background border-primary text-primary font-heading grid size-12 place-items-center rounded-full border-2 text-xl font-semibold">
              {i + 1}
            </span>
            <h3 className="font-heading mt-2 text-xl font-semibold">{s.t}</h3>
            <p className="text-muted-foreground max-w-[26ch] leading-relaxed">
              {s.d}
            </p>
          </li>
        ))}
      </ol>
      <Primary big>Make your poster</Primary>
    </section>
  );
}

export function W3() {
  const [at, setAt] = useState(0);
  return (
    <section className="bg-background grid grid-cols-[1fr_1.1fr] gap-16 px-16 py-20">
      <div className="flex flex-col gap-8">
        <H2>Three steps to your wall.</H2>
        <ol className="flex flex-col gap-2">
          {STEPS.map((s, i) => (
            <li key={s.t}>
              <button
                onClick={() => setAt(i)}
                className={`w-full rounded-[12px] border p-5 text-start transition-colors ${at === i ? "bg-card border-primary" : "border-transparent"}`}
              >
                <span className="font-heading text-xl font-semibold">
                  {i + 1}. {s.t}
                </span>
                <span className="text-muted-foreground mt-1 block leading-relaxed">
                  {s.d}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div className="bg-muted grid h-[480px] place-items-center overflow-hidden rounded-[16px] border p-8">
        <img
          src={`/landing/${STEPS[at].img}.webp`}
          alt={STEPS[at].t}
          className="max-h-full rounded-[10px] shadow-lg"
        />
      </div>
    </section>
  );
}

export function W4() {
  return (
    <section className="bg-background px-16 py-20">
      <div className="grid grid-cols-[280px_1fr] gap-16">
        <H2>Three steps to your wall.</H2>
        <ol className="flex flex-col divide-y border-y">
          {STEPS.map((s, i) => (
            <li
              key={s.t}
              className="grid grid-cols-[96px_1fr] items-baseline gap-6 py-7"
            >
              <span className="font-heading text-primary text-[64px] leading-none font-medium italic">
                {i + 1}
              </span>
              <div>
                <h3 className="font-heading text-2xl font-semibold">{s.t}</h3>
                <p className="text-muted-foreground mt-1 max-w-[52ch] text-lg leading-relaxed">
                  {s.d}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function W5() {
  return (
    <section className="bg-muted flex flex-col items-center gap-12 px-16 py-20">
      <H2>Three steps to your wall.</H2>
      <div className="relative h-[380px] w-[760px]">
        {STEPS.map((s, i) => (
          <div
            key={s.t}
            className="bg-card absolute flex w-[340px] flex-col gap-3 rounded-[14px] border p-5 shadow-lg"
            style={{ left: i * 210, top: i * 40, rotate: `${(i - 1) * 2}deg` }}
          >
            <div className="h-[160px] overflow-hidden rounded-[8px] border">
              <img
                src={`/landing/${s.img}.webp`}
                alt=""
                className="w-full object-cover object-top"
              />
            </div>
            <h3 className="font-heading text-xl font-semibold">
              {i + 1}. {s.t}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {s.d}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Two styles ---------------- */

const STYLES = {
  fg: {
    name: "Field guide",
    line: "Soft colour plates with every feather in place.",
  },
  wb: {
    name: "Woodblock",
    line: "Bold shapes and strong lines, like a printmaker's proof.",
  },
};

export function S1() {
  const [x, setX] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const move = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    setX(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };
  return (
    <section className="bg-background grid grid-cols-[1fr_1.1fr] items-center gap-16 px-16 py-20">
      <div className="flex flex-col gap-6">
        <H2>Two ways to see the same birds.</H2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Drag the line. One click in the builder switches the whole poster, and
          every bird keeps its place.
        </p>
        <dl className="grid grid-cols-2 gap-6">
          {Object.values(STYLES).map((s) => (
            <div key={s.name}>
              <dt className="font-heading text-xl font-semibold">{s.name}</dt>
              <dd className="text-muted-foreground mt-1">{s.line}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div
        ref={box}
        className="relative mx-auto aspect-[3/4] w-[440px] cursor-ew-resize touch-none overflow-hidden shadow-[0_24px_50px_-18px_rgb(30_27_22/0.4)] select-none"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          move(e.clientX);
        }}
        onPointerMove={(e) => e.buttons && move(e.clientX)}
      >
        <img
          src={img("starter-wb", true)}
          alt="Woodblock style"
          className="absolute inset-0 h-full w-full"
        />
        <img
          src={img("starter-fg", true)}
          alt="Field guide style"
          className="absolute inset-0 h-full w-full"
          style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }}
        />
        <div
          className="bg-card absolute inset-y-0 w-[3px]"
          style={{ left: `${x}%` }}
        >
          <span className="bg-card absolute top-1/2 left-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-sm shadow">
            ⇆
          </span>
        </div>
        <span className="bg-card/90 absolute top-3 left-3 rounded-md px-2 py-1 text-xs font-medium">
          Field guide
        </span>
        <span className="bg-card/90 absolute top-3 right-3 rounded-md px-2 py-1 text-xs font-medium">
          Woodblock
        </span>
      </div>
    </section>
  );
}

export function S2() {
  return (
    <section className="bg-background flex flex-col items-center gap-12 px-16 py-20">
      <H2>Two ways to see the same birds.</H2>
      <div className="grid grid-cols-2 gap-14">
        {(["fg", "wb"] as const).map((k) => (
          <figure key={k} className="flex w-[380px] flex-col gap-4">
            <Poster
              name={`starter-${k}`}
              small
              alt={`${STYLES[k].name} style`}
            />
            <figcaption>
              <b className="font-heading text-xl font-semibold">
                {STYLES[k].name}
              </b>
              <span className="text-muted-foreground mt-1 block">
                {STYLES[k].line}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function S3() {
  const [wb, setWb] = useState(true);
  const k = wb ? "wb" : "fg";
  return (
    <section className="bg-muted grid grid-cols-[1fr_1fr] items-center gap-16 px-16 py-20">
      <div className="flex flex-col gap-6">
        <H2>Two ways to see the same birds.</H2>
        <div className="bg-background grid h-11 w-72 grid-cols-2 gap-0.5 rounded-[10px] border p-[3px] text-sm font-medium">
          {(["fg", "wb"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setWb(s === "wb")}
              className={`rounded-[7px] ${k === s ? "bg-card shadow-sm" : "text-muted-foreground"}`}
            >
              {STYLES[s].name}
            </button>
          ))}
        </div>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {STYLES[k].line}
        </p>
      </div>
      <Poster
        name={`starter-${k}`}
        small
        className="mx-auto w-[400px]"
        alt={`${STYLES[k].name} style`}
      />
    </section>
  );
}

export function S4() {
  return (
    <section className="bg-background flex flex-col items-center gap-10 px-16 py-20">
      <H2>Two ways to see the same birds.</H2>
      <div className="relative aspect-[3/4] w-[460px] overflow-hidden shadow-[0_24px_50px_-18px_rgb(30_27_22/0.4)]">
        <img
          src={img("starter-fg", true)}
          alt="Field guide style"
          className="absolute inset-0 h-full w-full"
        />
        <img
          src={img("starter-wb", true)}
          alt="Woodblock style"
          className="absolute inset-0 h-full w-full"
          style={{ clipPath: "polygon(62% 0, 100% 0, 100% 100%, 38% 100%)" }}
        />
      </div>
      <div className="grid w-[460px] grid-cols-2 gap-6 text-sm">
        <p>
          <b className="font-heading text-base">Field guide.</b>{" "}
          <span className="text-muted-foreground">{STYLES.fg.line}</span>
        </p>
        <p className="text-end">
          <b className="font-heading text-base">Woodblock.</b>{" "}
          <span className="text-muted-foreground">{STYLES.wb.line}</span>
        </p>
      </div>
    </section>
  );
}

export function S5() {
  return (
    <section className="bg-background grid grid-cols-[320px_1fr] items-center gap-12 px-16 py-20">
      <div className="flex flex-col gap-4">
        <H2>Two ways to see the same birds.</H2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          The same eagle owl, up close.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {(["fg", "wb"] as const).map((k) => (
          <figure key={k} className="flex flex-col gap-3">
            <div className="bg-card aspect-square overflow-hidden rounded-[14px] border">
              <img
                src={`/landing/owl-${k}.webp`}
                alt={`Eurasian eagle owl, ${STYLES[k].name}`}
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption>
              <b className="font-heading text-lg font-semibold">
                {STYLES[k].name}
              </b>
              <span className="text-muted-foreground block text-sm">
                {STYLES[k].line}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Ready sets ---------------- */

const setHref = (id: string) => `/make?set=${id}`;

export function G1() {
  return (
    <section className="bg-background flex flex-col gap-10 px-16 py-20">
      <div className="flex items-end justify-between">
        <H2>Start from a set.</H2>
        <p className="text-muted-foreground">
          Or build your own from 1,161 species.
        </p>
      </div>
      <div className="columns-4 gap-6 [&>a]:mb-6">
        {SETS.slice(0, 7).map((s) => (
          <a
            key={s.id}
            href={setHref(s.id)}
            className="group block break-inside-avoid"
          >
            <Poster
              name={s.img}
              small
              alt={s.title}
              className="transition-transform group-hover:-translate-y-1"
            />
            <p className="mt-2 text-sm font-medium">
              {s.title}{" "}
              <span className="text-muted-foreground font-normal">
                {s.n} birds
              </span>
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}

export function G2() {
  return (
    <section className="bg-background flex flex-col gap-8 py-20">
      <div className="flex items-end justify-between px-16">
        <H2>Start from a set.</H2>
        <p className="text-muted-foreground">
          Or build your own from 1,161 species.
        </p>
      </div>
      <div className="flex [scrollbar-width:thin] gap-6 overflow-x-auto px-16 pb-4">
        {SETS.map((s) => (
          <a
            key={s.id}
            href={setHref(s.id)}
            className="bg-card w-[260px] shrink-0 rounded-[14px] border p-4"
          >
            <div className="h-[300px] overflow-hidden">
              <img src={img(s.img, true)} alt={s.title} className="w-full" />
            </div>
            <p className="font-heading mt-3 text-lg font-semibold">{s.title}</p>
            <p className="text-muted-foreground text-sm">{s.n} birds</p>
          </a>
        ))}
      </div>
    </section>
  );
}

export function G3() {
  return (
    <section className="bg-background flex flex-col gap-12 px-16 py-20">
      <H2>Start from a set.</H2>
      <div className="flex items-end justify-center gap-8 border-b-[10px] border-[color-mix(in_srgb,var(--foreground)_14%,transparent)] pb-0">
        {SETS.slice(0, 5).map((s, i) => (
          <a
            key={s.id}
            href={setHref(s.id)}
            className="flex flex-col items-center"
          >
            <Poster
              name={s.img}
              small
              alt={s.title}
              className={i % 2 ? "w-[170px]" : "w-[200px]"}
            />
          </a>
        ))}
      </div>
      <div className="flex justify-center gap-8 text-sm">
        {SETS.slice(0, 5).map((s) => (
          <span key={s.id} className="w-[180px] text-center font-medium">
            {s.title}
          </span>
        ))}
      </div>
    </section>
  );
}

export function G4() {
  const [at, setAt] = useState(0);
  return (
    <section className="bg-background grid grid-cols-[1fr_1fr] items-center gap-16 px-16 py-20">
      <div className="flex flex-col gap-8">
        <H2>Start from a set.</H2>
        <ul className="flex flex-col border-t">
          {SETS.map((s, i) => (
            <li key={s.id}>
              <a
                href={setHref(s.id)}
                onMouseEnter={() => setAt(i)}
                onFocus={() => setAt(i)}
                className={`flex items-baseline justify-between border-b py-3.5 transition-colors ${at === i ? "text-primary" : ""}`}
              >
                <span className="font-heading text-2xl font-semibold">
                  {s.title}
                </span>
                <span className="text-muted-foreground text-sm">
                  {s.n} birds
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground">
          Or build your own from 1,161 species.
        </p>
      </div>
      <Poster
        name={SETS[at].img}
        small
        className="mx-auto w-[380px]"
        alt={SETS[at].title}
      />
    </section>
  );
}

export function G5() {
  return (
    <section className="bg-muted grid grid-cols-[1fr_1fr] items-center gap-16 px-16 py-20">
      <div className="flex flex-col gap-6">
        <H2>Start from a set.</H2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Eleven ready sets, from owls of the world to birds of Israel. Open one
          and make it yours.
        </p>
        <div>
          <Primary big>Browse the sets</Primary>
        </div>
      </div>
      <div className="relative h-[520px]">
        {SETS.slice(0, 4).map((s, i) => (
          <div
            key={s.id}
            className="absolute top-0 left-1/2 w-[320px]"
            style={{
              transform: `translateX(calc(-50% + ${(i - 1.5) * 40}px)) rotate(${(i - 1.5) * 4}deg)`,
              zIndex: i,
            }}
          >
            <Poster name={s.img} small alt={s.title} />
          </div>
        ))}
      </div>
    </section>
  );
}
