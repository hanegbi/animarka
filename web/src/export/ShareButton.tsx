"use client";

import { CheckIcon, LinkIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { copyWithin, sharePoster } from "@/lib/shared-poster";
import { usePosterState } from "@/poster/state/provider";

type Status = "idle" | "working" | "copied" | "show" | "error";

/** Save the poster and copy its link. If the browser refuses the clipboard, the link shows to select. */
export function ShareButton({ iconOnly }: { iconOnly?: boolean }) {
  const state = usePosterState();
  const [status, setStatus] = useState<Status>("idle");
  const [url, setUrl] = useState("");

  const share = async () => {
    setStatus("working");
    let link: string;
    try {
      link = await sharePoster(state);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
      return;
    }
    setUrl(link);
    // The clipboard gets 1.5 s. If it says no or never answers, the link shows to copy by hand.
    if (await copyWithin(link)) {
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2000);
    } else {
      setStatus("show");
    }
  };

  const label =
    status === "copied"
      ? "Link copied"
      : status === "working"
        ? "Saving"
        : status === "error"
          ? "Could not share"
          : "Share";

  return (
    <div className="relative">
      <Button
        variant="outline"
        size={iconOnly ? "icon" : "default"}
        onClick={share}
        disabled={status === "working" || !state.order.length}
        aria-label={iconOnly ? label : undefined}
        aria-live="polite"
      >
        {status === "copied" ? (
          <CheckIcon aria-hidden />
        ) : (
          <LinkIcon aria-hidden />
        )}
        {!iconOnly && label}
      </Button>
      {status === "show" && (
        <div className="bg-popover absolute end-0 top-full z-50 mt-2 flex w-80 flex-col gap-2 rounded-[10px] border p-3 shadow-lg">
          <label htmlFor="share-url" className="text-[13px] font-medium">
            Copy this link
          </label>
          <input
            id="share-url"
            readOnly
            value={url}
            autoFocus
            onFocus={(e) => e.currentTarget.select()}
            className="h-8 rounded-[8px] border bg-transparent px-2 text-[13px]"
          />
          <Button variant="ghost" size="sm" onClick={() => setStatus("idle")}>
            Done
          </Button>
        </div>
      )}
    </div>
  );
}
