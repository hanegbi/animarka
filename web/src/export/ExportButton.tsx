"use client";

import { DownloadIcon } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { Button } from "@/components/ui/button";

const ExportDialog = lazy(() => import("./ExportDialog"));

/** Opens the export dialog. The dialog's code loads only on the first click. */
export function ExportButton({ iconOnly }: { iconOnly?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        size={iconOnly ? "icon" : "default"}
        onClick={() => setOpen(true)}
        aria-label={iconOnly ? "Export" : undefined}
        aria-haspopup="dialog"
      >
        <DownloadIcon aria-hidden />
        {!iconOnly && "Export"}
      </Button>
      {open && (
        <Suspense fallback={null}>
          <ExportDialog onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
