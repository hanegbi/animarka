"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

export type KnockBird = { id: string; silhouette: string };

/**
 * A headline knocked out where it crosses the birds: deep forest over the paper, paper over the
 * birds, like type cut out of the ink. Under the text it lays one ivory silhouette per bird (same
 * alpha as the art, minus the pale beak and outline, so letters there stay forest) and clips the
 * background to the glyphs. The silhouettes follow each bird's real box on every resize. Without
 * script the headline is plain deep forest.
 */
export function KnockoutHeadline({
  birds,
  className,
  id,
  children,
}: {
  birds: KnockBird[];
  className?: string;
  id?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const h = ref.current;
    const els = birds.map((b) => document.getElementById(b.id));
    if (!h || els.some((e) => !e)) return;
    const place = () => {
      const a = h.getBoundingClientRect();
      const boxes = els.map((e) => e!.getBoundingClientRect());
      const s = h.style;
      s.backgroundImage = [
        ...birds.map((b) => `url(${b.silhouette})`),
        "linear-gradient(var(--lp-forest), var(--lp-forest))",
      ].join(", ");
      s.backgroundSize = [
        ...boxes.map((b) => `${b.width}px ${b.height}px`),
        "100% 100%",
      ].join(", ");
      s.backgroundPosition = [
        ...boxes.map((b) => `${b.left - a.left}px ${b.top - a.top}px`),
        "0 0",
      ].join(", ");
      s.backgroundRepeat = "no-repeat";
      s.backgroundClip = "text";
      s.setProperty("-webkit-background-clip", "text");
      s.color = "transparent";
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(h);
    els.forEach((e) => ro.observe(e!));
    window.addEventListener("resize", place);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", place);
    };
  }, [birds]);

  return (
    <h1 ref={ref} id={id} className={className}>
      {children}
    </h1>
  );
}
