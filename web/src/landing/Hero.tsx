/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { CSSProperties } from "react";
import { KnockoutHeadline, type KnockBird } from "./Knockout";

/**
 * R9 hero, the owner's pick H1 (knockout), with three birds: a griffon vulture behind, the scarlet
 * tanager carrying the vermilion, and an eagle owl in front. The headline turns to paper where it
 * crosses them.
 */

const SHADOW: CSSProperties = {
  filter:
    "drop-shadow(0 22px 26px rgb(var(--lp-shadow) / 0.2)) drop-shadow(0 4px 6px rgb(var(--lp-shadow) / 0.12))",
};

const KNOCK: KnockBird[] = [
  { id: "hero-owl", silhouette: "/landing/r9/owl-knock.webp" },
  { id: "hero-tanager", silhouette: "/landing/r9/tanager-knock.webp" },
  { id: "hero-vulture", silhouette: "/landing/r9/vulture-knock.webp" },
];

function Bird({
  id,
  name,
  w,
  h,
  alt,
  className,
  eager,
}: {
  id: string;
  name: string;
  w: number;
  h: number;
  alt: string;
  className: string;
  eager?: boolean;
}) {
  return (
    <img
      id={id}
      data-hero-bird
      src={`/landing/r9/${name}.webp`}
      srcSet={`/landing/r9/${name}-sm.webp 560w, /landing/r9/${name}.webp ${w}w`}
      sizes="(min-width: 1024px) 70vw, 120vw"
      alt={alt}
      width={w}
      height={h}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
      style={SHADOW}
      className={`absolute max-w-none ${className}`}
    />
  );
}

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden"
      data-hero
    >
      <div className="relative mx-auto flex max-w-[1440px] flex-col px-4 pt-8 pb-12 sm:px-8 lg:block lg:h-[clamp(720px,calc(100svh-64px),900px)] lg:px-16 lg:pt-16 lg:pb-0">
        <Bird
          id="hero-vulture"
          name="vulture"
          w={905}
          h={1023}
          alt="A griffon vulture from the field guide set"
          className="top-[40px] right-[-26%] z-0 w-[62%] sm:top-0 sm:right-[-6%] sm:w-[52%] lg:top-[-1%] lg:right-[-4%] lg:w-[46%]"
        />
        <Bird
          id="hero-tanager"
          name="tanager"
          w={1022}
          h={883}
          eager
          alt="A scarlet tanager from the field guide set"
          className="top-12 left-[40px] z-10 w-[150%] sm:left-[34%] sm:w-[100%] lg:top-[14%] lg:right-[-10%] lg:left-auto lg:w-[80%]"
        />
        <Bird
          id="hero-owl"
          name="owl"
          w={745}
          h={1022}
          alt="A Eurasian eagle owl from the field guide set"
          className="top-[300px] left-[-2%] z-20 w-[44%] sm:top-auto sm:right-[4%] sm:bottom-[-6%] sm:left-auto sm:w-[26%] lg:right-[3%] lg:bottom-[-10%] lg:w-[23%]"
        />
        <div className="relative z-30 flex min-h-[560px] flex-col sm:min-h-[640px] lg:block lg:min-h-0">
          <KnockoutHeadline
            id="hero-title"
            birds={KNOCK}
            className="max-w-[9.6ch] font-[family-name:var(--font-display)] text-[56px] leading-[0.95] font-medium text-balance text-[var(--lp-forest)] sm:text-[84px] lg:text-[clamp(112px,10vw,144px)] lg:leading-[0.92]"
          >
            Every bird you love, on one poster.
          </KnockoutHeadline>
        </div>
        <div className="relative z-30 flex flex-col gap-8 lg:mt-10">
          <p className="max-w-[36ch] text-lg leading-[1.55] text-[var(--lp-forest-muted)]">
            Pick birds from 1,161 species, choose an illustrated style, and
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
            <a href="#sets" className="lp-link text-base font-medium">
              Start from a set
            </a>
          </div>
        </div>
        <p className="relative z-30 mt-6 max-w-[44ch] text-[13px] leading-snug text-[var(--lp-forest-muted)] lg:absolute lg:bottom-8 lg:left-16 lg:mt-0">
          Plate 1. Scarlet tanager <i>Piranga olivacea</i>, Eurasian eagle owl{" "}
          <i>Bubo bubo</i> and griffon vulture <i>Gyps fulvus</i>.
        </p>
      </div>
    </section>
  );
}
