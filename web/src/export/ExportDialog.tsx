/* eslint-disable @next/next/no-img-element */
"use client";

import { DownloadIcon, ImageIcon, PrinterIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { sharePoster } from "@/lib/shared-poster";
import { usePosterState } from "@/poster/state/provider";
import { ShareButton } from "./ShareButton";

type Job = {
  id: string;
  status: string;
  progress: number;
  result?: { png?: string } | null;
};
type Phase =
  | { kind: "idle" }
  | { kind: "working"; progress: number }
  | { kind: "done"; png: string }
  | { kind: "error" };

const POLL_MS = 800;
const GIVE_UP_MS = 120_000;

/**
 * R6. Export in a native <dialog>: a free preview image (watermarked, long edge 1600 px) made by the
 * render worker, with progress, then a download. Print files come with a purchase (M5).
 * Loaded on demand, so it costs the first page nothing.
 */
export default function ExportDialog({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const state = usePosterState();
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    d.showModal();
    const close = () => onClose();
    d.addEventListener("close", close);
    return () => d.removeEventListener("close", close);
  }, [onClose]);

  const makePreview = useCallback(async () => {
    setPhase({ kind: "working", progress: 0.05 });
    try {
      const posterUrl = await sharePoster(state);
      const posterId = posterUrl.split("/p/")[1];
      const start = await fetch("/api/v1/renders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poster_id: posterId, kind: "preview" }),
      });
      if (!start.ok) throw new Error(String(start.status));
      const { job_id } = (await start.json()) as { job_id: string };
      const began = Date.now();
      for (;;) {
        const job = (await (
          await fetch(`/api/v1/jobs/${job_id}`)
        ).json()) as Job;
        if (job.status === "done" && job.result?.png) {
          setPhase({ kind: "done", png: job.result.png });
          return;
        }
        if (job.status === "failed" || Date.now() - began > GIVE_UP_MS)
          throw new Error("render");
        setPhase({ kind: "working", progress: Math.max(0.1, job.progress) });
        await new Promise((r) => setTimeout(r, POLL_MS));
      }
    } catch {
      setPhase({ kind: "error" });
    }
  }, [state]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="export-title"
      className="bg-card text-card-foreground m-auto w-[min(520px,calc(100vw-32px))] rounded-xl border p-0 shadow-xl backdrop:bg-black/40"
    >
      <div className="flex flex-col gap-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="export-title"
              className="font-heading text-xl font-semibold"
            >
              Export your poster
            </h2>
            <p className="text-muted-foreground text-sm">
              {state.order.length} birds, {state.size} poster.
            </p>
          </div>
          <form method="dialog">
            <Button variant="ghost" size="sm">
              Close
            </Button>
          </form>
        </div>

        <section
          className="flex flex-col gap-3 rounded-[10px] border p-4"
          aria-labelledby="preview-h"
        >
          <div className="flex items-center gap-2">
            <ImageIcon aria-hidden className="text-primary size-5" />
            <h3 id="preview-h" className="font-sans text-sm font-semibold">
              Preview image, free
            </h3>
          </div>
          <p className="text-muted-foreground text-[13px]">
            A PNG 1,600 px tall with a light watermark. Good for sharing and
            checking the layout.
          </p>
          {phase.kind === "idle" && (
            <Button onClick={makePreview} className="self-start">
              Make the preview
            </Button>
          )}
          {phase.kind === "working" && (
            <div className="flex flex-col gap-1.5" aria-live="polite">
              <div
                role="progressbar"
                aria-label="Making the preview"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(phase.progress * 100)}
                className="bg-muted h-2 overflow-hidden rounded-full"
              >
                <div
                  className="bg-primary h-full rounded-full transition-[width] duration-300"
                  style={{ width: `${Math.round(phase.progress * 100)}%` }}
                />
              </div>
              <p className="text-muted-foreground text-[13px]">
                Making the preview. This takes a few seconds.
              </p>
            </div>
          )}
          {phase.kind === "done" && (
            <div className="flex items-center gap-3">
              <img
                src={phase.png}
                alt="Preview of your poster"
                className="h-24 w-auto rounded border object-contain"
              />
              <a
                href={phase.png}
                download="animarka-poster-preview.png"
                className="bg-primary text-primary-foreground inline-flex h-10 items-center gap-1.5 rounded-[10px] px-3.5 text-sm font-medium"
              >
                <DownloadIcon aria-hidden className="size-4" /> Download PNG
              </a>
            </div>
          )}
          {phase.kind === "error" && (
            <div className="flex flex-col items-start gap-2" role="alert">
              <p className="text-[13px]">
                The preview did not finish. Try again.
              </p>
              <Button variant="outline" onClick={makePreview}>
                Try again
              </Button>
            </div>
          )}
        </section>

        <section
          className="flex flex-col gap-3 rounded-[10px] border p-4"
          aria-labelledby="print-h"
        >
          <div className="flex items-center gap-2">
            <PrinterIcon aria-hidden className="text-primary size-5" />
            <h3 id="print-h" className="font-sans text-sm font-semibold">
              Print file
            </h3>
          </div>
          <p className="text-muted-foreground text-[13px]">
            300 DPI PDF and PNG with no watermark, for 18 x 24 in, 12 x 16 in,
            A2 and A3. Coming soon.
          </p>
          <Button variant="outline" disabled className="self-start">
            Buy the print file
          </Button>
        </section>

        <div className="flex items-center justify-between gap-3 border-t pt-4">
          <p className="text-muted-foreground text-[13px]">
            Or send a link to this poster.
          </p>
          <ShareButton />
        </div>
      </div>
    </dialog>
  );
}
