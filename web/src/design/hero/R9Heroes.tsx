/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { KnockoutHeadline } from "./Knockout";

/**
 * Round R9: five hero options for the landing page. Every option is the real first screen:
 * the top bar plus the hero, on ivory paper grain, one big real subject, vermilion only where it
 * belongs to the subject (15 to 30% of the hero, measured). Tokens live in
 * src/styles/landing-tokens.css under [data-landing].
 */

export const FIELD: CSSProperties = {
  backgroundColor: "var(--lp-ivory)",
  backgroundImage: "var(--lp-grain)",
};
const SHADOW_BIRD: CSSProperties = {
  filter:
    "drop-shadow(0 22px 26px rgb(var(--lp-shadow) / 0.2)) drop-shadow(0 4px 6px rgb(var(--lp-shadow) / 0.12))",
};
const SUB =
  "Pick birds from 1,161 species, choose an illustrated style, and arrange them your way. Free, in your browser, no sign up.";

const display =
  "font-[family-name:var(--font-display)] font-medium tracking-[-0.025em] text-[var(--lp-forest)] text-balance";
const V = ({ children }: { children: ReactNode }) => (
  <span className="text-[var(--lp-vermilion)]">{children}</span>
);

function TopBar() {
  return (
    <header className="relative z-40">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-4 sm:px-8 lg:px-16">
        <span className={`${display} text-[26px] tracking-[-0.02em]`}>
          animarka
        </span>
        <nav className="hidden gap-8 text-[15px] text-[var(--lp-forest-muted)] md:flex">
          <a className="hover:text-[var(--lp-forest)]">How it works</a>
          <a className="hover:text-[var(--lp-forest)]">Styles</a>
          <a className="hover:text-[var(--lp-forest)]">Sets</a>
          <a className="hover:text-[var(--lp-forest)]">Print</a>
        </nav>
        <a className="inline-flex h-10 items-center rounded-[6px] bg-[var(--lp-forest)] px-4 text-sm font-medium text-[var(--lp-on-forest)]">
          Make your poster
        </a>
      </div>
    </header>
  );
}

function Actions() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <a className="inline-flex h-12 items-center rounded-[6px] bg-[var(--lp-forest)] px-6 text-base font-medium text-[var(--lp-on-forest)] transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--lp-forest)_88%,black)]">
        Make your poster
      </a>
      <a className="text-base font-medium text-[var(--lp-forest)] underline decoration-[var(--lp-forest)]/30 underline-offset-[6px] hover:decoration-[var(--lp-forest)]">
        Start from a set
      </a>
    </div>
  );
}

function Sub({ className = "" }: { className?: string }) {
  return (
    <p
      className={`max-w-[36ch] text-lg leading-[1.55] text-[var(--lp-forest-muted)] ${className}`}
    >
      {SUB}
    </p>
  );
}

function Plate({
  n,
  name,
  latin,
  className = "",
}: {
  n: number;
  name: string;
  latin: string;
  className?: string;
}) {
  return (
    <p
      className={`text-[13px] leading-snug text-[var(--lp-forest-muted)] ${className}`}
    >
      Plate {n}. {name}, <i>{latin}</i>
    </p>
  );
}

function Shell({ children, label }: { children: ReactNode; label: string }) {
  return (
    <section
      aria-label={label}
      className="relative isolate overflow-hidden"
      style={FIELD}
    >
      <TopBar />
      {children}
    </section>
  );
}

const STAGE =
  "relative mx-auto flex max-w-[1440px] flex-col px-4 pt-8 pb-12 sm:px-8 lg:block lg:h-[clamp(720px,calc(100svh-64px),900px)] lg:px-16 lg:pt-16 lg:pb-0";

/** 1. Knockout: the tanager sits under the headline, and the letters turn to paper over it. */
export function Hero1() {
  return (
    <Shell label="Option 1, knockout">
      <div className={STAGE}>
        <img
          id="h1-bird"
          src="/landing/r9/tanager.webp"
          alt="A scarlet tanager from the field guide set"
          width={1022}
          height={883}
          style={SHADOW_BIRD}
          className="absolute top-2 left-[40px] z-10 w-[160%] max-w-none sm:left-[38%] sm:w-[110%] lg:top-[5%] lg:right-[-16%] lg:left-auto lg:w-[90%]"
        />
        <div className="relative z-20 flex min-h-[520px] flex-col sm:min-h-[640px] lg:block lg:min-h-0">
          <KnockoutHeadline
            birdId="h1-bird"
            silhouette="/landing/r9/tanager-knock.webp"
            className={`${display} max-w-[9.6ch] text-[56px] leading-[0.95] sm:text-[84px] lg:text-[clamp(112px,10vw,144px)] lg:leading-[0.92]`}
          >
            Every bird you love, on one poster.
          </KnockoutHeadline>
        </div>
        <div className="relative z-20 flex flex-col gap-8 lg:mt-10">
          <Sub />
          <Actions />
        </div>
        <Plate
          n={1}
          name="Scarlet tanager"
          latin="Piranga olivacea"
          className="relative z-20 mt-6 lg:absolute lg:bottom-8 lg:left-16 lg:mt-0"
        />
      </div>
    </Shell>
  );
}

/** 2. Gaze: the cardinal, turned with the app's mirror, looks at the word it is about. */
export function Hero2() {
  return (
    <Shell label="Option 2, gaze">
      <div className={STAGE}>
        <img
          src="/landing/r9/cardinal.webp"
          alt="A northern cardinal from the field guide set, turned to face right"
          width={1023}
          height={953}
          style={SHADOW_BIRD}
          className="order-2 mt-6 -mb-40 -ml-[66%] w-[165%] max-w-none -scale-x-100 sm:-ml-[30%] sm:w-[110%] lg:absolute lg:bottom-[-17%] lg:left-[-19%] lg:m-0 lg:w-[73%]"
        />
        <div className="relative z-10 order-1 flex flex-col gap-8 lg:ms-auto lg:w-[44%] lg:pt-14">
          <h1
            className={`${display} text-[56px] leading-[0.96] sm:text-[80px] lg:text-[clamp(84px,6.94vw,100px)]`}
          >
            Every bird you love, on one <V>poster.</V>
          </h1>
          <Sub />
          <Actions />
        </div>
        <Plate
          n={2}
          name="Northern cardinal"
          latin="Cardinalis cardinalis"
          className="order-3 mt-4 hidden lg:absolute lg:right-16 lg:bottom-8 lg:mt-0 lg:block"
        />
      </div>
    </Shell>
  );
}

/** 3. Framed print: one real poster in a thin oak frame with a vermilion mat. */
export function Hero3() {
  return (
    <Shell label="Option 3, framed print">
      <div className={STAGE}>
        <div className="relative z-10 flex flex-col gap-8 lg:w-[46%] lg:pt-10">
          <h1
            className={`${display} text-[56px] leading-[0.96] sm:text-[80px] lg:text-[clamp(88px,7.22vw,104px)]`}
          >
            Every bird you love, on <V>one</V> poster.
          </h1>
          <Sub />
          <Actions />
        </div>
        <figure className="relative mx-auto mt-10 w-full max-w-[560px] lg:absolute lg:top-[5%] lg:right-[5%] lg:mt-0 lg:w-[46%] lg:max-w-none">
          <div
            className="p-[1.4%]"
            style={{
              background:
                "linear-gradient(135deg, var(--lp-oak), var(--lp-oak-dark) 55%, var(--lp-oak))",
              boxShadow: "var(--lp-shadow-print)",
            }}
          >
            <div className="bg-[var(--lp-vermilion)] p-[14%] shadow-[inset_0_2px_6px_rgb(var(--lp-shadow)/0.35)] sm:p-[12%]">
              <img
                src="/landing/r9/red-poster.webp"
                alt="A real Birds in red poster made in the builder, with a scarlet tanager in the centre"
                width={1600}
                height={2134}
                className="block h-auto w-full shadow-[0_1px_2px_rgb(var(--lp-shadow)/0.4)]"
              />
            </div>
          </div>
        </figure>
      </div>
    </Shell>
  );
}

/**
 * 4. Masthead: the headline runs across the top like a field guide title, and the cardinal
 * rises into it; its crest stops just under "love", in the same red.
 */
export function Hero4() {
  return (
    <Shell label="Option 4, masthead">
      <div className={STAGE}>
        <h1
          className={`${display} relative z-10 text-[56px] leading-[0.95] sm:text-[88px] lg:text-[clamp(112px,9.72vw,140px)] lg:leading-[0.92]`}
        >
          <span className="lg:block">
            Every bird you <V>love,</V>
          </span>{" "}
          <span className="relative lg:block">
            on one{" "}
            <span className="relative">
              poster.
              <img
                aria-hidden
                alt=""
                src="/landing/r9/cardinal.webp"
                width={1023}
                height={953}
                style={SHADOW_BIRD}
                className="pointer-events-none absolute top-[0.02em] left-[calc(100%-0.96em)] hidden w-[11.2em] max-w-none lg:block"
              />
            </span>
          </span>
        </h1>
        <div className="relative z-10 mt-8 flex flex-col gap-8 lg:mt-14 lg:max-w-[480px]">
          <Sub />
          <Actions />
        </div>
        <img
          src="/landing/r9/cardinal.webp"
          alt="A northern cardinal from the field guide set"
          width={1023}
          height={953}
          style={SHADOW_BIRD}
          className="mt-8 -mb-44 ml-[4%] w-[165%] max-w-none lg:hidden"
        />
        <Plate
          n={4}
          name="Northern cardinal"
          latin="Cardinalis cardinalis"
          className="relative z-10 mt-6 hidden lg:absolute lg:bottom-8 lg:left-16 lg:mt-0 lg:block"
        />
      </div>
    </Shell>
  );
}

/** 5. Spread: the hero is an open field guide; the tanager crosses the gutter and leaves the page. */
export function Hero5() {
  return (
    <section
      aria-label="Option 5, field guide spread"
      className="relative isolate overflow-hidden bg-[var(--lp-paper-2)]"
    >
      <div className="absolute inset-x-0 top-0 h-16" style={FIELD} />
      <TopBar />
      <div className="relative mx-auto max-w-[1440px] px-3 pt-6 sm:px-8 lg:h-[clamp(720px,calc(100svh-64px),900px)] lg:px-12 lg:pt-10">
        <div
          className="relative mx-2 grid min-h-[760px] grid-cols-1 rounded-t-[3px] lg:mx-3 lg:h-full lg:grid-cols-2"
          style={{
            ...FIELD,
            // The page block sits on a stack of pages: thin offset edges on both outer sides.
            boxShadow:
              "-3px 2px 0 var(--lp-paper), -4px 3px 0 rgb(var(--lp-shadow) / 0.18), -7px 5px 0 var(--lp-paper), -8px 6px 0 rgb(var(--lp-shadow) / 0.16), 3px 2px 0 var(--lp-paper), 4px 3px 0 rgb(var(--lp-shadow) / 0.18), 7px 5px 0 var(--lp-paper), 8px 6px 0 rgb(var(--lp-shadow) / 0.16), var(--lp-shadow-print)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-1/2 z-10 hidden w-40 -translate-x-1/2 lg:block"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgb(var(--lp-shadow) / 0.06) 30%, rgb(var(--lp-shadow) / 0.2) 48%, rgb(var(--lp-shadow) / 0.3) 50%, rgb(var(--lp-shadow) / 0.2) 52%, rgb(var(--lp-shadow) / 0.06) 70%, transparent)",
            }}
          />
          <div className="relative z-10 flex flex-col gap-8 px-5 pt-10 pb-6 sm:px-10 lg:px-14 lg:pt-16">
            <h1
              className={`${display} text-[52px] leading-[0.96] sm:text-[76px] lg:text-[clamp(72px,6.4vw,92px)]`}
            >
              Every <V>bird</V> you love, on one poster.
            </h1>
            <Sub />
            <Actions />
          </div>
          <div className="relative h-[340px] lg:h-auto">
            <img
              src="/landing/r9/tanager.webp"
              alt="A scarlet tanager from the field guide set"
              width={1022}
              height={883}
              style={SHADOW_BIRD}
              className="absolute top-0 left-[-10%] z-20 w-[200%] max-w-none lg:top-[-4%] lg:right-[-34%] lg:left-auto lg:w-[167%]"
            />
            <Plate
              n={1}
              name="Scarlet tanager"
              latin="Piranga olivacea"
              className="absolute top-10 right-14 z-30 hidden lg:block"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export const HEROES = [Hero1, Hero2, Hero3, Hero4, Hero5];
