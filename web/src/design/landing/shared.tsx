/* eslint-disable @next/next/no-img-element */
"use client";

import type { ReactNode } from "react";

/** Real posters rendered by our own pipeline (scripts in docs/prompts/landing-page.md). */
export const img = (name: string, small = false) =>
  `/landing/${name}${small ? "-sm" : ""}.webp`;

export const SETS = [
  { id: "birds-of-israel", title: "Birds of Israel", n: 44, img: "israel" },
  { id: "owls-of-the-world", title: "Owls of the world", n: 26, img: "owls" },
  {
    id: "garden-birds-north-america",
    title: "Garden birds of North America",
    n: 26,
    img: "garden-na",
  },
  { id: "raptors", title: "Birds of prey", n: 19, img: "raptors" },
  { id: "hummingbirds", title: "Hummingbirds", n: 8, img: "hummingbirds" },
  { id: "kingfishers", title: "Kingfishers", n: 10, img: "kingfishers" },
  { id: "woodpeckers", title: "Woodpeckers", n: 22, img: "woodpeckers-wb" },
];

export const FAQ = [
  [
    "Is it free?",
    "Building, sharing and the preview image are free. The print file will be paid.",
  ],
  ["Do I need an account?", "No. Open the builder and start."],
  [
    "Who made the art?",
    "Two open, AI generated art sets: field guide art by Huashu and woodblock art by Adam Oberley, Teddy Warner and contributors. Both are credited with their licences.",
  ],
  [
    "Can I use Hebrew names?",
    "Yes. 595 birds have a Hebrew name, the rest keep their English one.",
  ],
  ["Where can I print it?", "At any print shop. The print file is 300 DPI."],
  [
    "Is the art accurate?",
    "It is AI generated and can contain mistakes. Tell us if a bird looks wrong.",
  ],
] as const;

export function Primary({
  children,
  big,
}: {
  children: ReactNode;
  big?: boolean;
}) {
  return (
    <a
      href="/make"
      className={`bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-[10px] font-medium transition-colors ${
        big ? "h-12 px-6 text-base" : "h-10 px-4 text-sm"
      }`}
    >
      {children}
    </a>
  );
}

export function Secondary({
  children,
  big,
  href = "/make",
}: {
  children: ReactNode;
  big?: boolean;
  href?: string;
}) {
  return (
    <a
      href={href}
      className={`bg-card hover:bg-muted inline-flex items-center justify-center rounded-[10px] border font-medium transition-colors ${
        big ? "h-12 px-6 text-base" : "h-10 px-4 text-sm"
      }`}
    >
      {children}
    </a>
  );
}

/** A poster as a framed print: thin wood frame, white mat, soft wall shadow. */
export function Framed({
  name,
  className = "",
  small,
  alt,
}: {
  name: string;
  className?: string;
  small?: boolean;
  alt: string;
}) {
  return (
    <div
      className={`bg-foreground/85 rounded-[3px] p-[2.5%] shadow-[0_18px_40px_-12px_rgb(30_27_22/0.35)] ${className}`}
    >
      <div className="bg-card p-[5%]">
        <img src={img(name, small)} alt={alt} className="block h-auto w-full" />
      </div>
    </div>
  );
}

export function Poster({
  name,
  className = "",
  small,
  alt,
}: {
  name: string;
  className?: string;
  small?: boolean;
  alt: string;
}) {
  return (
    <img
      src={img(name, small)}
      alt={alt}
      className={`block h-auto w-full shadow-[0_10px_30px_-10px_rgb(30_27_22/0.3)] ${className}`}
    />
  );
}

export const Logo = ({ className = "" }: { className?: string }) => (
  <span
    className={`font-heading text-2xl font-semibold tracking-tight ${className}`}
  >
    animarka
  </span>
);
