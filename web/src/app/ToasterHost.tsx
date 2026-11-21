"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { subscribeToaster, toasterArmed } from "@/lib/notify";

const LazyToaster = dynamic(
  () => import("@/components/ui/sonner").then((m) => m.Toaster),
  { ssr: false },
);

/** Mounts the toaster the first time a message is requested. On a phone, messages sit above the tab bar. */
export function ToasterHost() {
  const armed = useSyncExternalStore(
    subscribeToaster,
    toasterArmed,
    () => false,
  );
  return armed ? <LazyToaster mobileOffset={{ bottom: 72 }} /> : null;
}
