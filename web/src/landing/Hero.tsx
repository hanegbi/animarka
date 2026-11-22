/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { CSSProperties } from "react";
import { KnockoutHeadline, type KnockBird } from "./Knockout";

/**
 * The landing hero (R9 H1, QA round L1 to L5): a southern cassowary large at the back, a shoebill
 * in front of it and a common kingfisher small in front, all from the field guide set (owner's
 * pick). They may overlap each other and pass behind the headline. No sticker outlines, only a soft natural shadow. On wide screens the
 * headline turns to paper where it crosses a bird's body, and every bill sits clear of the letters.
 * On phones the headline and buttons come first and the birds stand below them.
 */

// A soft, natural shadow under each bird, no white outline.
const SHADOW: CSSProperties = {
  filter:
    "drop-shadow(0 18px 22px rgb(var(--lp-shadow) / 0.18)) drop-shadow(0 3px 5px rgb(var(--lp-shadow) / 0.12))",
};

const KNOCK: KnockBird[] = [
  { id: "hero-kingfisher", silhouette: "/landing/r9/kingfisher-knock.webp" },
  { id: "hero-shoebill", silhouette: "/landing/r9/shoebill-knock.webp" },
  { id: "hero-cassowary", silhouette: "/landing/r9/cassowary-knock.webp" },
];

type BirdProps = {
  id: string;
  name: string;
  w: number;
  h: number;
  /** Where the bill tip is, as fractions of the image: tests keep it clear of the headline (L2). */
  bill: [number, number];
  sizes: string;
  alt: string;
  className: string;
  main?: boolean;
};

function Bird({
  id,
  name,
  w,
  h,
  bill,
  sizes,
  alt,
  className,
  main,
}: BirdProps) {
  return (
    <img
      id={id}
      data-hero-bird
      data-bill={bill.join(",")}
      src={`/landing/r9/${name}.webp`}
      srcSet={`/landing/r9/${name}-sm.webp 560w, /landing/r9/${name}.webp ${w}w`}
      sizes={sizes}
      alt={alt}
      width={w}
      height={h}
      loading="eager"
      fetchPriority={main ? "high" : "auto"}
      decoding="async"
      style={SHADOW}
      className={`absolute max-w-none ${className}`}
    />
  );
}

const BIRDS: BirdProps[] = [
  {
    id: "hero-cassowary",
    name: "cassowary",
    w: 774,
    h: 999,
    bill: [0, 0.178],
    sizes: "(min-width: 1024px) 48vw, 56vw",
    alt: "A southern cassowary from the field guide set",
    className:
      "right-[-10%] bottom-[-8%] z-0 w-[72%] sm:right-[2%] sm:w-[40%] lg:top-[6%] lg:right-[2%] lg:bottom-auto lg:w-[47%]",
    main: true,
  },
  {
    id: "hero-shoebill",
    name: "shoebill",
    w: 585,
    h: 999,
    bill: [0, 0.29],
    sizes: "(min-width: 1024px) 26vw, 40vw",
    alt: "A shoebill from the field guide set",
    className:
      "bottom-[-6%] left-[14%] z-10 w-[46%] sm:left-[28%] sm:w-[26%] lg:top-[36%] lg:bottom-auto lg:left-[39%] lg:w-[26%]",
  },
  {
    id: "hero-kingfisher",
    name: "kingfisher",
    w: 1000,
    h: 864,
    bill: [0, 0.157],
    sizes: "(min-width: 1024px) 16vw, 30vw",
    alt: "A common kingfisher from the field guide set",
    className:
      "bottom-[0%] left-[-4%] z-20 w-[36%] sm:left-[6%] sm:w-[20%] lg:right-[24%] lg:bottom-[3%] lg:left-auto lg:w-[15%]",
  },
];

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden"
      data-hero
    >
      <div className="relative mx-auto flex max-w-[1440px] flex-col px-4 pt-8 sm:px-8 lg:block lg:h-[clamp(720px,calc(100svh-64px),900px)] lg:px-16 lg:pt-16">
        <div className="relative z-30 flex flex-col gap-8 lg:block">
          <KnockoutHeadline
            id="hero-title"
            birds={KNOCK}
            className="max-w-[9.6ch] font-[family-name:var(--font-display)] text-[52px] leading-[0.95] font-medium text-balance text-[var(--lp-forest)] sm:text-[80px] lg:text-[clamp(104px,9.4vw,136px)] lg:leading-[0.92]"
          >
            Every bird you love, on one poster.
          </KnockoutHeadline>
          <div className="flex flex-col gap-8 lg:mt-10">
            <p className="max-w-[36ch] text-lg leading-[1.55] text-[var(--lp-muted)]">
              Pick birds from 11,011 species, choose an illustrated style, and
              arrange them your way. Free, in your browser, no sign up.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href="/make"
                prefetch={false}
                className="lp-btn inline-flex h-12 items-center rounded-[6px] px-6 text-base font-medium"
              >
                Make your poster
              </Link>
              <a
                href="#sets"
                className="lp-link inline-flex min-h-11 items-center text-base font-medium"
              >
                Start from a set
              </a>
            </div>
          </div>
        </div>
        {/* Phones: the birds get their own stage under the words, so none touches a letter (L1). */}
        <div
          data-hero-stage
          className="relative mt-2 h-[350px] sm:h-[440px] lg:absolute lg:inset-0 lg:mt-0 lg:h-auto"
        >
          {BIRDS.map((b) => (
            <Bird key={b.id} {...b} />
          ))}
        </div>
        <p className="relative z-30 mt-4 mb-8 max-w-[52ch] text-[13px] leading-snug text-[var(--lp-muted)] lg:absolute lg:bottom-8 lg:left-16 lg:m-0">
          Plate 1. Southern cassowary <i>Casuarius casuarius</i>, shoebill{" "}
          <i>Balaeniceps rex</i> and common kingfisher <i>Alcedo atthis</i>.
        </p>
      </div>
    </section>
  );
}
