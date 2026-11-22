/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";

/**
 * Five short looping demos of what you can do on the poster, drawn with CSS and the real art (a
 * few KB each, no video). Each move takes under 300 ms, then the bird rests. With reduced motion
 * every demo stands still on its first frame. The keyframes live in landing-tokens.css.
 */

function Bird({
  name,
  className = "",
  w,
  h,
}: {
  name: string;
  className?: string;
  w: number;
  h: number;
}) {
  return (
    <img
      src={`/landing/r9/t-${name}.webp`}
      alt=""
      width={w}
      height={h}
      loading="lazy"
      className={`absolute h-auto ${className}`}
    />
  );
}

function Plate({
  title,
  line,
  wide,
  children,
}: {
  title: string;
  line: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <li
      className={`flex flex-col gap-4 ${wide ? "col-span-2 lg:col-span-1" : ""}`}
    >
      <div
        aria-hidden
        className={`relative ${wide ? "aspect-[2/1] lg:aspect-square" : "aspect-square"} lp-plate overflow-hidden rounded-[6px] bg-[var(--lp-paper)]`}
      >
        {children}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-lg leading-tight sm:text-xl">{title}</h3>
        <p className="text-[15px] text-[var(--lp-forest-muted)] sm:text-base">
          {line}
        </p>
      </div>
    </li>
  );
}

const label =
  "absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[13px] text-[var(--lp-forest)]";

export function Touches() {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-5">
      <Plate
        title="Tap to mirror"
        line="Turn any bird to face the other way, or all of them at once."
      >
        <div className="lp-demo-mirror absolute top-[22%] left-1/2 w-[58%] -translate-x-1/2">
          <img
            src="/landing/r9/t-kingfisher.webp"
            alt=""
            width={240}
            height={209}
            loading="lazy"
            className="w-full"
          />
        </div>
        <span className="lp-demo-tap absolute top-[44%] left-1/2 size-12 -translate-x-1/2 rounded-full border-2 border-[var(--lp-vermilion)]" />
        <span className={`${label} bottom-[12%]`}>Common Kingfisher</span>
      </Plate>

      <Plate
        title="Drag to swap"
        line="Drop one bird on another to trade places."
      >
        <Bird
          name="goldfinch"
          w={240}
          h={205}
          className="lp-demo-swap-a top-[30%] left-[8%] w-[38%]"
        />
        <Bird
          name="swallow"
          w={240}
          h={138}
          className="lp-demo-swap-b top-[36%] left-[54%] w-[38%]"
        />
      </Plate>

      <Plate
        title="Drag off to remove"
        line="Pull a bird off the poster and let go."
      >
        <div className="absolute inset-[14%_22%_14%_8%] rounded-[3px] border border-dashed border-[rgb(var(--lp-shadow)/0.35)]" />
        <div className="lp-demo-off absolute top-[32%] left-[20%] w-[42%]">
          <img
            src="/landing/r9/t-mallard.webp"
            alt=""
            width={240}
            height={222}
            loading="lazy"
            className="w-full"
          />
          <span className="lp-demo-bin absolute -top-2 -right-2 grid size-7 place-items-center rounded-full bg-[var(--lp-vermilion)] text-[var(--lp-paper)]">
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
            </svg>
          </span>
        </div>
      </Plate>

      <Plate title="Rename any bird" line="Click a name and type your own.">
        <Bird
          name="heron"
          w={210}
          h={240}
          className="top-[12%] left-1/2 w-[44%] -translate-x-1/2"
        />
        <span className={`${label} lp-demo-name-a bottom-[14%]`}>
          Grey Heron
        </span>
        <span
          className={`${label} lp-demo-name-b bottom-[14%] rounded-[3px] px-1 ring-1 ring-[var(--lp-forest)]`}
        >
          Our heron
          <span className="lp-demo-caret ms-px inline-block h-[1em] w-px translate-y-[2px] bg-[var(--lp-forest)]" />
        </span>
      </Plate>

      <Plate
        title="English or Hebrew"
        line="Names in either language, right to left when needed."
        wide
      >
        <Bird
          name="hoopoe"
          w={240}
          h={166}
          className="top-[18%] left-1/2 w-[30%] -translate-x-1/2 lg:top-[26%] lg:w-[62%]"
        />
        <span className={`${label} lp-demo-name-a bottom-[16%]`}>
          Common Hoopoe
        </span>
        <span
          dir="rtl"
          lang="he"
          className={`${label} lp-demo-name-b bottom-[16%] font-[system-ui]`}
        >
          דוכיפת
        </span>
      </Plate>
    </ul>
  );
}
