/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Framed, img, Logo, Poster, Primary, Secondary } from "./shared";

const LINKS = ["How it works", "Styles", "Sets", "Print"];

/* ---------------- Top bar ---------------- */

export function N1() {
  return (
    <header className="bg-background flex h-16 items-center justify-between border-b px-8">
      <Logo />
      <nav className="text-muted-foreground flex gap-7 text-sm">
        {LINKS.map((l) => (
          <a key={l} className="hover:text-foreground">
            {l}
          </a>
        ))}
      </nav>
      <Primary>Make your poster</Primary>
    </header>
  );
}

export function N2() {
  return (
    <div className="bg-muted px-8 py-5">
      <header className="bg-card/80 mx-auto flex h-14 max-w-4xl items-center justify-between rounded-full border px-3 ps-6 shadow-sm backdrop-blur">
        <Logo className="text-xl" />
        <nav className="text-muted-foreground flex gap-6 text-sm">
          {LINKS.map((l) => (
            <a key={l}>{l}</a>
          ))}
        </nav>
        <a
          href="/make"
          className="bg-primary text-primary-foreground inline-flex h-10 items-center rounded-full px-4 text-sm font-medium"
        >
          Make your poster
        </a>
      </header>
    </div>
  );
}

export function N3() {
  return (
    <header className="bg-background flex h-16 items-center justify-between px-8">
      <Logo />
      <Primary>Make your poster</Primary>
    </header>
  );
}

export function N4() {
  return (
    <header className="bg-background flex flex-col items-center gap-3 border-b px-8 pt-6 pb-4">
      <Logo className="text-4xl" />
      <div className="flex w-full items-center justify-between">
        <span className="w-40" />
        <nav className="text-muted-foreground flex gap-8 text-sm">
          {LINKS.map((l) => (
            <a key={l}>{l}</a>
          ))}
        </nav>
        <span className="flex w-40 justify-end">
          <Primary>Make your poster</Primary>
        </span>
      </div>
    </header>
  );
}

export function N5() {
  return (
    <header className="bg-foreground text-background flex h-16 items-center justify-between px-8">
      <Logo />
      <nav className="flex gap-7 text-sm opacity-80">
        {LINKS.map((l) => (
          <a key={l}>{l}</a>
        ))}
      </nav>
      <a
        href="/make"
        className="bg-background text-foreground inline-flex h-10 items-center rounded-[10px] px-4 text-sm font-medium"
      >
        Make your poster
      </a>
    </header>
  );
}

/* ---------------- Hero ---------------- */

const SUB =
  "Pick birds from 1,161 species, choose an illustrated style, and arrange them your way. Free, in your browser, no sign up.";

export function H1() {
  return (
    <section className="bg-background grid grid-cols-[1.05fr_1fr] items-center gap-16 px-16 py-20">
      <div className="flex flex-col gap-7">
        <h1 className="font-heading text-[64px] leading-[1.02] font-semibold tracking-tight text-balance">
          Every bird you love, on one poster.
        </h1>
        <p className="text-muted-foreground max-w-[34ch] text-lg leading-relaxed">
          {SUB}
        </p>
        <div className="flex gap-3">
          <Primary big>Make your poster</Primary>
          <Secondary big>Start from a set</Secondary>
        </div>
      </div>
      <Framed
        name="starter-fg"
        small
        className="mx-auto w-[78%] rotate-[1.5deg]"
        alt="A poster of twelve birds in the field guide style"
      />
    </section>
  );
}

export function H2() {
  const [wb, setWb] = useState(false);
  return (
    <section className="bg-background relative overflow-hidden px-16 pt-16 pb-0">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
        <h1 className="font-heading text-[72px] leading-[1] font-semibold tracking-tight text-balance">
          Every bird you love, on one poster.
        </h1>
        <p className="text-muted-foreground max-w-[52ch] text-lg leading-relaxed">
          {SUB}
        </p>
        <div className="flex gap-3">
          <Primary big>Make your poster</Primary>
          <Secondary big>Start from a set</Secondary>
        </div>
        <div
          role="radiogroup"
          aria-label="Art style"
          className="bg-muted mt-4 grid h-10 grid-cols-2 gap-0.5 rounded-[10px] border p-[3px] text-[13px] font-medium"
        >
          {["Field guide", "Woodblock"].map((l, i) => (
            <button
              key={l}
              role="radio"
              aria-checked={(i === 1) === wb}
              onClick={() => setWb(i === 1)}
              className={`rounded-[7px] px-5 ${(i === 1) === wb ? "bg-card shadow-sm" : "text-muted-foreground"}`}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="relative mt-2 w-[440px]">
          <img
            src={img("starter-fg", true)}
            alt="Twelve birds in the field guide style"
            className={`block w-full shadow-[0_24px_50px_-18px_rgb(30_27_22/0.4)] transition-opacity duration-500 ${wb ? "opacity-0" : "opacity-100"}`}
          />
          <img
            src={img("starter-wb", true)}
            alt="The same twelve birds in the woodblock style"
            className={`absolute inset-0 block w-full transition-opacity duration-500 ${wb ? "opacity-100" : "opacity-0"}`}
          />
        </div>
      </div>
    </section>
  );
}

export function H3() {
  return (
    <section className="bg-background grid grid-cols-[1fr_1.15fr] items-center gap-12 px-16 py-20">
      <div className="flex flex-col gap-7">
        <h1 className="font-heading text-[60px] leading-[1.04] font-semibold tracking-tight text-balance">
          Every bird you love, on one poster.
        </h1>
        <p className="text-muted-foreground max-w-[36ch] text-lg leading-relaxed">
          {SUB}
        </p>
        <div className="flex gap-3">
          <Primary big>Make your poster</Primary>
          <Secondary big>Start from a set</Secondary>
        </div>
      </div>
      <div className="relative h-[520px]">
        <Framed
          name="owls"
          small
          className="absolute top-0 left-[8%] w-[42%]"
          alt="Owls of the world in a grid"
        />
        <Framed
          name="woodpeckers-wb"
          small
          className="absolute top-[6%] right-[2%] w-[36%]"
          alt="Woodpeckers in the woodblock style on green"
        />
        <Framed
          name="kingfishers"
          small
          className="absolute bottom-0 left-[30%] w-[34%]"
          alt="Kingfishers on a sky background"
        />
      </div>
    </section>
  );
}

export function H4() {
  return (
    <section className="relative h-[620px] overflow-hidden">
      <img
        src={img("israel")}
        alt="Birds of Israel poster"
        className="absolute inset-0 h-full w-full object-cover object-[50%_30%]"
      />
      <div className="bg-card/95 absolute bottom-12 left-16 flex max-w-xl flex-col gap-5 rounded-[14px] border p-9 shadow-xl">
        <h1 className="font-heading text-[48px] leading-[1.05] font-semibold tracking-tight text-balance">
          Every bird you love, on one poster.
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed">{SUB}</p>
        <div className="flex gap-3">
          <Primary big>Make your poster</Primary>
          <Secondary big>Start from a set</Secondary>
        </div>
      </div>
    </section>
  );
}

export function H5() {
  return (
    <section className="bg-background overflow-hidden px-16 pt-16">
      <h1 className="font-heading text-[128px] leading-[0.92] font-semibold tracking-[-0.03em]">
        1,161 birds.
        <br />
        One wall.
      </h1>
      <div className="mt-8 flex items-end justify-between gap-10">
        <div className="flex max-w-md flex-col gap-6 pb-10">
          <p className="text-muted-foreground text-lg leading-relaxed">{SUB}</p>
          <div className="flex gap-3">
            <Primary big>Make your poster</Primary>
            <Secondary big>Start from a set</Secondary>
          </div>
        </div>
        <div className="flex h-[300px] shrink-0 items-start gap-5 overflow-hidden">
          {[
            ["garden-na", "translate-y-6", "Garden birds of North America"],
            ["starter-wb", "", "Twelve birds in the woodblock style"],
            [
              "raptors",
              "translate-y-10",
              "Birds of prey with an eagle in the centre",
            ],
          ].map(([n, shift, alt]) => (
            <div key={n} className={`w-[180px] shrink-0 ${shift}`}>
              <Poster name={n} small alt={alt} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
