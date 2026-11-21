"use client";

import { useEffect } from "react";

/** Marks the page ready for the screenshot once fonts are loaded and every image has decoded. */
export function RenderReady() {
  useEffect(() => {
    let alive = true;
    const imgs = [...document.querySelectorAll("img")];
    Promise.all([
      document.fonts.ready,
      ...imgs.map((img) => img.decode().catch(() => undefined)),
    ]).then(() => {
      if (alive) document.body.dataset.renderReady = "true";
    });
    return () => {
      alive = false;
    };
  }, []);
  return null;
}
