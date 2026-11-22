/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { ReactNode } from "react";
import "@/styles/landing-tokens.css";
import { CompareSlider } from "./CompareSlider";
import { Faq } from "./Faq";
import { frauncesDisplay } from "./fonts";
import { Hero } from "./Hero";
import { SetsCarousel, type LandingSet } from "./SetsCarousel";
import { Touches } from "./Touches";

/**
 * The landing page, round R9: a museum shop and a printed field guide. Hero H1 (knockout, three
 * birds), then sections that change tone, width and alignment so no two in a row look alike.
 * Every image is real: art from the two sets, posters from our renderer, screens from the builder.
 * Server rendered; only the hero knockout, the style slider, the set carousel and the questions
 * load JavaScript.
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
  {
    t: "Pick your birds.",
    d: "Search 1,161 species or start from a ready set.",
    img: "step-pick",
    alt: "The builder's search showing herons and bitterns after typing heron",
  },
  {
    t: "Make it yours.",
    d: "Choose a style, a layout and a background. Mirror, swap and rename any bird.",
    img: "step-style",
    alt: "A poster in the woodblock style next to the design, labels and layout controls",
  },
  {
    t: "Share or print.",
    d: "Send a link, download a free preview, or get the print file when it arrives.",
    img: "step-export",
    alt: "The export dialog with the free preview image and the print file, coming soon",
  },
] as const;

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
    "It is AI generated and can contain mistakes, so look closely at any bird you care about, and tell us if one looks wrong.",
  ],
] as const;

const REPORT =
  "https://github.com/hanegbi/animarka/issues/new?title=Wrong%20bird%3A%20&body=Which%20bird%2C%20which%20style%2C%20and%20what%20looks%20wrong%3F";

const pad = "py-16 sm:py-24 lg:py-28";
const h2 =
  "text-[40px] leading-[1.02] text-balance sm:text-[52px] lg:text-[60px]";

function Cta({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <Link
      href="/make"
      prefetch={false}
      className={`inline-flex h-12 items-center rounded-[6px] px-6 text-base font-medium ${
        light
          ? "bg-[var(--lp-on-forest)] text-[var(--lp-forest)] transition-colors duration-200 hover:bg-[var(--lp-paper-2)]"
          : "lp-btn"
      }`}
    >
      {children}
    </Link>
  );
}

/**
 * An outside link. Inline in running text it gets transparent padding, so the hit area is 44 px
 * tall on phones and 32 px on desktop (L7) while the line looks the same.
 */
const Ext = ({
  href,
  children,
  className = "py-3.5 sm:py-2",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) => (
  <a
    href={href}
    className={`lp-link ${className}`}
    target="_blank"
    rel="noopener noreferrer"
  >
    {children}
  </a>
);

export function Landing() {
  return (
    <div
      data-landing
      className={`${frauncesDisplay.variable} min-h-dvh overflow-x-clip`}
    >
      <header className="sticky top-0 z-40 border-b border-[rgb(var(--lp-shadow)/0.12)] bg-[color-mix(in_srgb,var(--lp-ivory)_92%,transparent)] backdrop-blur-sm">
        <div className="lp-wrap flex h-16 items-center justify-between gap-6">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center font-[family-name:var(--font-display)] text-[26px] font-medium tracking-[-0.01em] transition-opacity duration-150 hover:opacity-75"
          >
            animarka
          </Link>
          <nav
            aria-label="Sections"
            className="lp-nav hidden gap-8 text-[15px] text-[var(--lp-muted)] md:flex"
          >
            <a href="#how">How it works</a>
            <a href="#styles">Styles</a>
            <a href="#sets">Sets</a>
            <a href="#print">Print</a>
          </nav>
          <Link
            href="/make"
            prefetch={false}
            className="lp-btn inline-flex h-11 items-center rounded-[6px] px-4 text-sm font-medium sm:h-10"
          >
            Make your poster
          </Link>
        </div>
      </header>

      <main>
        <Hero />

        {/* Steps: a full bleed band in the second paper tone, three plates with real screens. */}
        <section aria-labelledby="how" className="lp-paper2 scroll-mt-16">
          <div className={`lp-wrap ${pad} flex flex-col gap-12 lg:gap-16`}>
            <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-4">
              <h2 id="how" className={h2}>
                Three steps to a poster.
              </h2>
              <p className="max-w-[34ch] text-lg text-[var(--lp-muted)]">
                From a search box to a poster you can share, in one place.
              </p>
            </div>
            <ol className="grid gap-12 md:grid-cols-3 md:gap-8">
              {STEPS.map((s, i) => (
                <li key={s.t} className="flex flex-col gap-6">
                  <div className="lp-plate aspect-square overflow-hidden rounded-[6px] bg-[var(--lp-paper)]">
                    <img
                      src={`/landing/r9/${s.img}.webp`}
                      alt={s.alt}
                      width={720}
                      height={720}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-[48px_1fr] gap-x-4">
                    <span
                      aria-hidden
                      className="font-[family-name:var(--font-display)] text-[44px] leading-[0.9] font-medium"
                    >
                      {i + 1}
                    </span>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-2xl leading-tight">{s.t}</h3>
                      <p className="text-[var(--lp-muted)]">{s.d}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Styles: the picture leads on the left this time, the words follow on the right. */}
        <section aria-labelledby="styles" className="lp-paper scroll-mt-16">
          <div
            className={`lp-wrap ${pad} grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-24`}
          >
            <div className="flex justify-center lg:justify-start">
              <CompareSlider />
            </div>
            <div className="flex flex-col gap-8 lg:max-w-[520px]">
              <h2 id="styles" className={h2}>
                Two ways to see the same birds.
              </h2>
              <p className="text-lg text-[var(--lp-muted)]">
                Drag the line. In the builder one click switches the whole
                poster, and every bird keeps its place.
              </p>
              <dl className="grid gap-8 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <dt className="font-[family-name:var(--font-display)] text-2xl">
                    Field guide
                  </dt>
                  <dd className="text-[var(--lp-muted)]">
                    Soft colour plates with every feather in place.
                  </dd>
                </div>
                <div className="flex flex-col gap-2">
                  <dt className="font-[family-name:var(--font-display)] text-2xl">
                    Woodblock
                  </dt>
                  <dd className="text-[var(--lp-muted)]">
                    Bold shapes and strong lines, like a printmaker&apos;s
                    proof.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* Sets: centred heading, then a row that runs to both edges of the page. */}
        <section aria-labelledby="sets" className={`scroll-mt-16 ${pad}`}>
          <div className="lp-wrap mb-10 flex flex-col items-center gap-4 text-center">
            <h2 id="sets" className={h2}>
              Start from a set.
            </h2>
            <p className="text-lg text-[var(--lp-muted)]">
              Or build your own from 1,161 species.
            </p>
          </div>
          <SetsCarousel sets={SETS} />
        </section>

        {/* Small touches: five live demos on the second paper tone. */}
        <section aria-labelledby="yours" className="lp-paper2 scroll-mt-16">
          <div className={`lp-wrap ${pad} flex flex-col gap-12`}>
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-24">
              <h2 id="yours" className={h2}>
                Make it yours, bird by bird.
              </h2>
              <p className="max-w-[44ch] text-lg text-[var(--lp-muted)]">
                Tap, drag and type right on the poster. Then choose Scattered,
                Grid or Centerpiece, one of eight backgrounds and three shapes,
                and write your own title.
              </p>
            </div>
            <Touches />
          </div>
        </section>

        {/* Print: the dark band, full bleed. What works today comes first. */}
        <section aria-labelledby="print" className="lp-dark scroll-mt-16">
          <div
            className={`lp-wrap ${pad} grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16`}
          >
            <div className="flex flex-col gap-10">
              <h2 id="print" className={h2}>
                Share it today. Print it soon.
              </h2>
              <dl className="flex flex-col gap-6 text-lg">
                <div className="flex flex-col gap-1">
                  <dt className="font-medium">Free preview, ready today</dt>
                  <dd className="text-[var(--lp-on-forest-muted)]">
                    A 1,600 px image with a light watermark. Free, always.
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="font-medium">A link to share, ready today</dt>
                  <dd className="text-[var(--lp-on-forest-muted)]">
                    Every poster has its own link.
                  </dd>
                </div>
                <div className="flex flex-col gap-1 border-t border-[color-mix(in_srgb,var(--lp-on-forest)_20%,transparent)] pt-6">
                  <dt className="font-medium">Print file coming soon</dt>
                  <dd className="text-[var(--lp-on-forest-muted)]">
                    300 DPI PDF and PNG, no watermark, for 18 x 24 in, 12 x 16
                    in, A2 and A3.
                  </dd>
                </div>
              </dl>
              <div>
                <Cta light>Make your poster</Cta>
              </div>
            </div>
            <figure className="flex flex-col items-center gap-4">
              <img
                src="/landing/r9/owl-wb.webp"
                alt="A Eurasian eagle owl from the woodblock set"
                width={564}
                height={833}
                loading="lazy"
                className="h-auto w-[62%] max-w-[360px] drop-shadow-[0_28px_32px_rgb(var(--lp-shadow)/0.55)]"
              />
              <figcaption className="text-[13px] text-[var(--lp-on-forest-muted)]">
                Eurasian eagle owl <i>Bubo bubo</i>, woodblock
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Questions: one narrow centred column. */}
        <section aria-labelledby="questions" className={`lp-paper ${pad}`}>
          <div className="lp-wrap flex max-w-[880px] flex-col gap-10">
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 id="questions" className={h2}>
                Questions.
              </h2>
              <p className="text-lg text-[var(--lp-muted)]">
                The builder is free, so the quickest answer is often to try it.
              </p>
            </div>
            <Faq items={FAQ} />
          </div>
        </section>

        {/* Final call: words left, a real poster shown whole on the right (L6). */}
        <section aria-labelledby="final" className="lp-paper2" data-final>
          <div className="lp-wrap grid items-center gap-12 py-16 sm:py-24 md:grid-cols-[1fr_auto] lg:py-28">
            <div className="flex flex-col gap-8">
              <h2
                id="final"
                className="text-[44px] leading-[1] text-balance sm:text-[64px] lg:text-[80px]"
              >
                Your wall is waiting.
              </h2>
              <p className="text-lg text-[var(--lp-muted)]">
                Free, in your browser, no sign up.
              </p>
              <div>
                <Cta>Make your poster</Cta>
              </div>
            </div>
            <img
              src="/landing/raptors-sm.webp"
              alt="A Birds of prey poster made in the builder"
              width={600}
              height={800}
              loading="lazy"
              data-final-poster
              className="mx-auto w-[260px] rounded-[3px] sm:w-[320px] md:me-8"
              style={{ boxShadow: "var(--lp-shadow-print)" }}
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-[rgb(var(--lp-shadow)/0.12)]">
        <div className="lp-wrap flex flex-col gap-8 py-12">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <span className="font-[family-name:var(--font-display)] text-2xl font-medium">
              animarka
            </span>
            <span className="text-[var(--lp-muted)]">
              Illustrated bird posters, made by you.
            </span>
            <Link
              href="/make"
              prefetch={false}
              className="lp-link inline-flex min-h-11 items-center font-medium sm:min-h-8"
            >
              Make your poster
            </Link>
          </div>
          <div className="grid gap-4 border-t border-[rgb(var(--lp-shadow)/0.12)] pt-8 text-sm leading-relaxed text-[var(--lp-muted)] md:grid-cols-[2fr_1fr] md:gap-12">
            <p>
              Field guide art by Huashu, from{" "}
              <Ext href="https://github.com/alchaincyf/huashu-bird-sticker">
                huashu-bird-sticker
              </Ext>
              ,{" "}
              <Ext href="https://creativecommons.org/licenses/by/4.0/">
                CC BY 4.0
              </Ext>
              . Woodblock art by Adam Oberley, Teddy Warner and contributors,
              from{" "}
              <Ext href="https://github.com/adamoberley/HABirdDashboard">
                HABirdDashboard
              </Ext>
              , <Ext href="https://opensource.org/license/mit">MIT</Ext>.
            </p>
            <p className="flex flex-col gap-2 md:items-end md:text-end">
              <span>AI generated, may contain errors.</span>
              <Ext
                href={REPORT}
                className="inline-flex min-h-11 items-center sm:min-h-8 md:self-end"
              >
                Report a wrong bird
              </Ext>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
