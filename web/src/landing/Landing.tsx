/* eslint-disable @next/next/no-img-element */
import {
  ArrowLeftRightIcon,
  FlipHorizontal2Icon,
  LanguagesIcon,
  MinusCircleIcon,
  PencilIcon,
  ShuffleIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { CompareSlider } from "./CompareSlider";
import { Faq } from "./Faq";
import { SetsCarousel, type LandingSet } from "./SetsCarousel";

/**
 * The landing page, round R7 picks: N1 H3 W4 S1 G2 F3 P4 Q3 C3 Z3.
 * Every image is a real poster from our own renderer. The page is server rendered; only the style
 * slider, the set carousel and the questions load JavaScript.
 */

const SETS: LandingSet[] = [
  { id: "birds-of-israel", title: "Birds of Israel", n: 44, img: "israel" },
  { id: "owls-of-the-world", title: "Owls of the world", n: 26, img: "owls" },
  {
    id: "garden-birds-north-america",
    title: "Garden birds of North America",
    n: 26,
    img: "garden-na",
  },
  { id: "raptors", title: "Birds of prey", n: 19, img: "raptors" },
  { id: "woodpeckers", title: "Woodpeckers", n: 22, img: "woodpeckers-wb" },
  { id: "kingfishers", title: "Kingfishers", n: 10, img: "kingfishers" },
  { id: "hummingbirds", title: "Hummingbirds", n: 8, img: "hummingbirds" },
];

const STEPS = [
  ["Pick your birds.", "Search 1,161 species or start from a ready set."],
  [
    "Make it yours.",
    "Choose a style, a layout and a background. Mirror, swap and rename any bird.",
  ],
  [
    "Share or print.",
    "Send a link, download a free preview, or get the print file when it arrives.",
  ],
] as const;

const TOUCHES = [
  {
    icon: FlipHorizontal2Icon,
    t: "Tap to mirror",
    d: "Turn any bird to face the other way, or all of them at once.",
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

const FAQ = [
  [
    "Is it free?",
    "Building, sharing and the preview image are free. The print file will be paid.",
  ],
  ["Do I need an account?", "No. Open the builder and start."],
  [
    "Who made the art?",
    "Two open, AI generated sets: field guide art by Huashu (huashu-bird-sticker, CC BY 4.0) and woodblock art by Adam Oberley, Teddy Warner and contributors (HABirdDashboard, MIT).",
  ],
  [
    "Can I use Hebrew names?",
    "Yes. 595 birds have a Hebrew name, the rest keep their English one.",
  ],
  ["Where can I print it?", "At any print shop. The print file is 300 DPI."],
  [
    "Is the art accurate?",
    "It is AI generated and can contain mistakes, so look closely at any bird you care about.",
  ],
] as const;

function Primary({
  children,
  big,
  href = "/make",
}: {
  children: ReactNode;
  big?: boolean;
  href?: string;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={`bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/50 inline-flex items-center justify-center rounded-[10px] font-medium transition-colors outline-none focus-visible:ring-3 ${
        big ? "h-12 px-6 text-base" : "h-10 px-4 text-sm"
      }`}
    >
      {children}
    </Link>
  );
}

function Secondary({ children, href }: { children: ReactNode; href: string }) {
  return (
    <a
      href={href}
      className="bg-card hover:bg-muted focus-visible:ring-ring/50 inline-flex h-12 items-center justify-center rounded-[10px] border px-6 text-base font-medium transition-colors outline-none focus-visible:ring-3"
    >
      {children}
    </a>
  );
}

/** A poster as a framed print: dark frame, white mat, wall shadow. */
function Framed({
  name,
  alt,
  className = "",
  eager,
}: {
  name: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  return (
    <div
      className={`bg-foreground/85 rounded-[3px] p-[2.5%] shadow-[0_18px_40px_-12px_rgb(30_27_22/0.35)] ${className}`}
    >
      <div className="bg-card p-[5%]">
        <img
          src={`/landing/${name}-sm.webp`}
          alt={alt}
          width={600}
          height={800}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : undefined}
          className="block h-auto w-full"
        />
      </div>
    </div>
  );
}

const H2 = ({
  children,
  id,
  className = "",
}: {
  children: string;
  id: string;
  className?: string;
}) => (
  <h2
    id={id}
    className={`font-heading text-[34px] leading-[1.08] font-semibold tracking-tight text-balance sm:text-[44px] ${className}`}
  >
    {children}
  </h2>
);

const wrap = "mx-auto w-full max-w-[1280px] px-4 sm:px-8 lg:px-16";

export function Landing() {
  return (
    <div className="bg-background text-foreground min-h-dvh overflow-x-clip">
      {/* N1. Quiet bar */}
      <header className="bg-background/95 sticky top-0 z-30 border-b backdrop-blur">
        <div className={`${wrap} flex h-16 items-center justify-between gap-6`}>
          <Link
            href="/"
            className="font-heading text-2xl font-semibold tracking-tight"
          >
            animarka
          </Link>
          <nav
            aria-label="Sections"
            className="text-muted-foreground hidden gap-7 text-sm md:flex"
          >
            <a href="#how" className="hover:text-foreground">
              How it works
            </a>
            <a href="#styles" className="hover:text-foreground">
              Styles
            </a>
            <a href="#sets" className="hover:text-foreground">
              Sets
            </a>
            <a href="#print" className="hover:text-foreground">
              Print
            </a>
          </nav>
          <Primary>Make your poster</Primary>
        </div>
      </header>

      <main>
        {/* H3. Gallery wall */}
        <section
          aria-labelledby="hero-title"
          className={`${wrap} grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-[1fr_1.15fr] lg:py-20`}
        >
          <div className="flex flex-col gap-6 sm:gap-7">
            <h1
              id="hero-title"
              className="font-heading text-[44px] leading-[1.04] font-semibold tracking-tight text-balance sm:text-[60px]"
            >
              Every bird you love, on one poster.
            </h1>
            <p className="text-muted-foreground max-w-[36ch] text-lg leading-relaxed">
              Pick birds from 1,161 species, choose an illustrated style, and
              arrange them your way. Free, in your browser, no sign up.
            </p>
            <div className="flex flex-wrap gap-3">
              <Primary big>Make your poster</Primary>
              <Secondary href="#sets">Start from a set</Secondary>
            </div>
          </div>
          <div
            className="relative mx-auto aspect-[10/9] w-full max-w-[640px]"
            data-gallery-wall
          >
            <Framed
              name="owls"
              eager
              alt="An Owls of the world poster in a grid"
              className="absolute top-0 left-[8%] w-[42%]"
            />
            <Framed
              name="woodpeckers-wb"
              eager
              alt="A woodpeckers poster in the woodblock style on green"
              className="absolute top-[6%] right-[2%] w-[36%]"
            />
            <Framed
              name="kingfishers"
              alt="A kingfishers poster on a sky background"
              className="absolute bottom-0 left-[30%] w-[34%]"
            />
          </div>
        </section>

        {/* W4. Field notes: a real sequence, so the numbers carry meaning */}
        <section
          aria-labelledby="how"
          className={`${wrap} scroll-mt-20 py-14 sm:py-20`}
        >
          <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-16">
            <H2 id="how">Three steps to your wall.</H2>
            <ol className="flex flex-col divide-y border-y">
              {STEPS.map(([t, d], i) => (
                <li
                  key={t}
                  className="grid grid-cols-[56px_1fr] items-baseline gap-4 py-6 sm:grid-cols-[96px_1fr] sm:gap-6 sm:py-7"
                >
                  <span
                    aria-hidden
                    className="font-heading text-primary text-[44px] leading-none font-medium italic sm:text-[64px]"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-heading text-2xl font-semibold">{t}</h3>
                    <p className="text-muted-foreground mt-1 max-w-[52ch] text-lg leading-relaxed">
                      {d}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* S1. Drag to compare */}
        <section
          aria-labelledby="styles"
          className={`${wrap} grid scroll-mt-20 items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_1.1fr] lg:gap-16`}
        >
          <div className="flex flex-col gap-6">
            <H2 id="styles">Two ways to see the same birds.</H2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Drag the line. In the builder one click switches the whole poster,
              and every bird keeps its place.
            </p>
            <dl className="grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="font-heading text-xl font-semibold">
                  Field guide
                </dt>
                <dd className="text-muted-foreground mt-1">
                  Soft colour plates with every feather in place.
                </dd>
              </div>
              <div>
                <dt className="font-heading text-xl font-semibold">
                  Woodblock
                </dt>
                <dd className="text-muted-foreground mt-1">
                  Bold shapes and strong lines, like a printmaker&apos;s proof.
                </dd>
              </div>
            </dl>
          </div>
          <div className="flex justify-center">
            <CompareSlider />
          </div>
        </section>

        {/* G2. Carousel */}
        <section
          aria-labelledby="sets"
          className={`${wrap} scroll-mt-20 py-14 sm:py-20`}
        >
          <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
            <H2 id="sets">Start from a set.</H2>
            <p className="text-muted-foreground">
              Or build your own from 1,161 species.
            </p>
          </div>
          <SetsCarousel sets={SETS} />
        </section>

        {/* F3. Icon list */}
        <section
          aria-labelledby="yours"
          className={`${wrap} grid gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_1.4fr] lg:gap-16`}
        >
          <div className="flex flex-col gap-4">
            <H2 id="yours">Small touches, big difference.</H2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Every poster ends up different, because every choice is yours.
              Eight backgrounds, three shapes and a title you write.
            </p>
          </div>
          <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {TOUCHES.map(({ icon: Icon, t, d }) => (
              <li key={t} className="flex gap-4">
                <span className="bg-accent text-primary grid size-11 shrink-0 place-items-center rounded-[10px]">
                  <Icon aria-hidden className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold">{t}</h3>
                  <p className="text-muted-foreground">{d}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* P4. Loupe on a dark band */}
        <section
          aria-labelledby="print"
          className="bg-foreground text-background scroll-mt-16"
        >
          <div
            className={`${wrap} grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_1fr] lg:gap-16`}
          >
            <div className="flex flex-col gap-6">
              <H2 id="print">Made for your wall.</H2>
              <dl className="flex flex-col gap-4 text-lg leading-relaxed">
                <div>
                  <dt className="font-semibold">Print file, coming soon</dt>
                  <dd className="opacity-80">
                    300 DPI PDF and PNG, no watermark, for 18 x 24 in, 12 x 16
                    in, A2 and A3.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">Free preview, ready today</dt>
                  <dd className="opacity-80">
                    A 1,600 px image with a light watermark.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">Share</dt>
                  <dd className="opacity-80">Every poster has its own link.</dd>
                </div>
              </dl>
              <div>
                <Link
                  href="/make"
                  prefetch={false}
                  className="bg-background text-foreground focus-visible:ring-background/50 inline-flex h-12 items-center rounded-[10px] px-6 font-medium outline-none focus-visible:ring-3"
                >
                  Make your poster
                </Link>
              </div>
            </div>
            <div className="mx-auto aspect-square w-full max-w-[380px] overflow-hidden rounded-full border-4 border-current shadow-2xl">
              <img
                src="/landing/owl-fg.webp"
                alt="A close look at the eagle owl, the detail a print keeps"
                width={600}
                height={600}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Q3. Heading and accordion */}
        <section
          aria-labelledby="questions"
          className={`${wrap} grid gap-8 py-14 sm:py-20 lg:grid-cols-[1fr_1.6fr] lg:gap-16`}
        >
          <div className="flex flex-col gap-4">
            <H2 id="questions">Questions.</H2>
            <p className="text-muted-foreground">
              The builder is free, so the quickest answer is often to try it.
            </p>
          </div>
          <Faq items={FAQ} />
        </section>

        {/* C3. Poster peek */}
        <section aria-labelledby="final" className="bg-muted overflow-hidden">
          <div
            className={`${wrap} grid items-center gap-10 py-14 sm:py-16 md:grid-cols-[1fr_auto]`}
          >
            <div className="flex flex-col gap-6">
              <H2 id="final" className="sm:text-[56px]">
                Your wall is waiting.
              </H2>
              <p className="text-muted-foreground text-lg">
                Free, in your browser, no sign up.
              </p>
              <div>
                <Primary big>Make your poster</Primary>
              </div>
            </div>
            <Framed
              name="raptors"
              alt="A framed Birds of prey poster"
              className="mx-auto w-[240px] rotate-[-3deg] sm:w-[300px] md:me-8"
            />
          </div>
        </section>
      </main>

      {/* Z3. One line, no credits on the landing (the builder keeps them) */}
      <footer className="border-t">
        <div
          className={`${wrap} text-muted-foreground flex flex-col items-center justify-between gap-3 py-6 text-sm sm:flex-row`}
        >
          <span className="font-heading text-foreground text-lg font-semibold">
            animarka
          </span>
          <span>Illustrated bird posters, made by you.</span>
          <Link
            href="/make"
            prefetch={false}
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Make your poster
          </Link>
        </div>
      </footer>
    </div>
  );
}
