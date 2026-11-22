/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { CSSProperties } from "react";
import { KnockoutHeadline, type KnockBird } from "./Knockout";

/**
 * The landing hero (R9 H1, QA round L1 to L5): three common blue birds from the field guide set read
 * as one blue shape, a European roller large at the back, a blue jay in the middle and a common
 * kingfisher small in front. No sticker outlines, only a soft natural shadow. On wide screens the
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
  { id: "hero-jay", silhouette: "/landing/r9/jay-knock.webp" },
  { id: "hero-roller", silhouette: "/landing/r9/roller-knock.webp" },
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
    id: "hero-roller",
    name: "roller",
    w: 998,
    h: 651,
    bill: [0, 0.204],
    sizes: "(min-width: 1024px) 50vw, 88vw",
    alt: "A European roller from the field guide set",
    className:
      "right-[-14%] bottom-[34%] z-0 w-[92%] sm:right-[-4%] sm:w-[64%] lg:top-[11%] lg:right-[0%] lg:bottom-auto lg:w-[52%]",
    main: true,
  },
  {
    id: "hero-jay",
    name: "jay",
    w: 998,
    h: 758,
    bill: [0, 0.264],
    sizes: "(min-width: 1024px) 32vw, 58vw",
    alt: "A blue jay from the field guide set",
    className:
      "bottom-[-4%] left-[2%] z-10 w-[58%] sm:left-[10%] sm:w-[40%] lg:top-[47%] lg:bottom-auto lg:left-[50%] lg:w-[32%]",
  },
  {
    id: "hero-kingfisher",
    name: "kingfisher",
    w: 1000,
    h: 864,
    bill: [0, 0.157],
    sizes: "(min-width: 1024px) 18vw, 36vw",
    alt: "A common kingfisher from the field guide set",
    className:
      "right-[2%] bottom-[-2%] z-20 w-[36%] sm:right-[8%] sm:w-[24%] lg:right-[4%] lg:bottom-[2%] lg:w-[18%]",
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
          className="relative mt-6 h-[340px] sm:h-[420px] lg:absolute lg:inset-0 lg:mt-0 lg:h-auto"
        >
          {BIRDS.map((b) => (
            <Bird key={b.id} {...b} />
          ))}
        </div>
        <p className="relative z-30 mt-4 mb-8 max-w-[52ch] text-[13px] leading-snug text-[var(--lp-muted)] lg:absolute lg:bottom-8 lg:left-16 lg:m-0">
          Plate 1. European roller <i>Coracias garrulus</i>, blue jay{" "}
          <i>Cyanocitta cristata</i> and common kingfisher <i>Alcedo atthis</i>.
        </p>
      </div>
    </section>
  );
}
