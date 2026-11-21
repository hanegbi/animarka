"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { sharedPoster } from "@/lib/shared-poster";
import { PosterProvider } from "@/poster/state/provider";
import { Builder, BuilderFallback } from "../../Builder";

/** Opens a shared poster in the builder. From here it is the visitor's own poster to change. */
export function SharedPoster({ id }: { id: string }) {
  const subscribe = useMemo(() => sharedPoster.subscribe(id), [id]);
  const get = useMemo(() => sharedPoster.get(id), [id]);
  const shared = useSyncExternalStore(subscribe, get, sharedPoster.server);

  if (shared.status === "loading") return <BuilderFallback />;
  if (shared.status === "missing")
    return (
      <main className="grid min-h-dvh place-items-center p-4">
        <div
          role="alert"
          className="bg-card flex max-w-sm flex-col items-center gap-3 rounded-xl border p-6 text-center shadow-sm"
        >
          <h1 className="font-heading text-xl font-semibold">
            This poster link does not work
          </h1>
          <p className="text-muted-foreground text-sm">
            It may be mistyped. You can start a new poster instead.
          </p>
          <Link
            href="/"
            className="bg-primary text-primary-foreground inline-flex h-10 items-center rounded-[10px] px-4 text-sm font-medium"
          >
            Start a poster
          </Link>
        </div>
      </main>
    );
  return (
    <PosterProvider fallback={<BuilderFallback />} shared={shared.state}>
      <Builder />
    </PosterProvider>
  );
}
