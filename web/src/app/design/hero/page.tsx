import { Suspense } from "react";
import { HEROES } from "@/design/hero/R9Heroes";
import { frauncesDisplay } from "@/landing/fonts";

/** Round R9 hero options, one at a time: /design/hero?o=1 to 5. Dev only. */
async function Option({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const q = await searchParams;
  const i = Math.min(5, Math.max(1, Number(q.o) || 1));
  const Hero = HEROES[i - 1];
  return (
    <div
      data-landing
      className={`${frauncesDisplay.variable} min-h-dvh`}
      style={{ backgroundColor: "var(--lp-ivory)" }}
    >
      <Hero />
    </div>
  );
}

export default function HeroRound({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  return (
    <Suspense fallback={null}>
      <Option searchParams={searchParams} />
    </Suspense>
  );
}
