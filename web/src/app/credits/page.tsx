import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Credits · animarka" };

/**
 * The art credits, on their own page (owner: never show the credit line on the landing or in the
 * builder). The page has to exist: CC BY 4.0 requires attribution, and MIT asks for its notice.
 */
export default function CreditsPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[60ch] flex-col gap-6 px-4 py-16 text-[15px] leading-relaxed">
      <h1 className="font-heading text-3xl font-semibold">Credits</h1>
      <p>
        Field guide art by Huashu, from{" "}
        <a
          className="underline"
          href="https://github.com/alchaincyf/huashu-bird-sticker"
        >
          huashu-bird-sticker
        </a>
        , licensed{" "}
        <a
          className="underline"
          href="https://creativecommons.org/licenses/by/4.0/"
        >
          CC BY 4.0
        </a>
        . Outlines removed and images resized.
      </p>
      <p>
        Woodblock art by Adam Oberley, Teddy Warner and contributors, from{" "}
        <a
          className="underline"
          href="https://github.com/adamoberley/HABirdDashboard"
        >
          HABirdDashboard
        </a>
        , licensed{" "}
        <a className="underline" href="https://opensource.org/license/mit">
          MIT
        </a>
        .
      </p>
      <Link href="/" className="underline">
        Back to animarka
      </Link>
    </main>
  );
}
