"use client";

import { useEffect, type CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { toasterMounted } from "@/lib/notify";

/** T1. One toast at the bottom. Colors come from our tokens, and the theme follows the system. */
export function Toaster(props: ToasterProps) {
  useEffect(() => {
    toasterMounted();
  }, []);
  return (
    <Sonner
      theme="system"
      position="bottom-center"
      duration={5000}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as CSSProperties
      }
      {...props}
    />
  );
}
