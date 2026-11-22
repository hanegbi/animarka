/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "animarka: illustrated bird posters, made by you",
  description:
    "Pick birds from 1,161 species, choose an illustrated style, and arrange them your way. Free, in your browser, no sign up.",
};

/** A simple landing page until the R7 round picks the real one. */
export default function Landing() {
  return (
    <main className="bg-background grid min-h-dvh place-items-center px-4 py-12">
      <div className="flex max-w-3xl flex-col items-center gap-6 text-center">
        <h1 className="font-heading text-5xl leading-tight font-semibold text-balance">
          Every bird you love, on one poster.
        </h1>
        <p className="text-muted-foreground max-w-[52ch] text-lg">
          Pick birds from 1,161 species, choose an illustrated style, and
          arrange them your way. Free, in your browser, no sign up.
        </p>
        <Link
          href="/make"
          className="bg-primary text-primary-foreground inline-flex h-12 items-center rounded-[10px] px-6 font-medium"
        >
          Make your poster
        </Link>
        <img
          src="/landing/starter-fg-sm.webp"
          alt="A poster of twelve birds in the field guide style"
          width={360}
          height={480}
          className="mt-4 w-[360px] max-w-full shadow-xl"
        />
      </div>
    </main>
  );
}
