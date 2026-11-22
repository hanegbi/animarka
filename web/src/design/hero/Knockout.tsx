"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * A headline that is knocked out where it crosses the bird: over the paper it is deep forest,
 * over the bird the letters turn to paper, like a print where the type is cut out of the ink.
 * It lays an ivory silhouette of the bird (same alpha as the art) under the text and clips the
 * background to the glyphs. The silhouette follows the bird's real box on every resize.
 */
export function KnockoutHeadline({
  birdId,
  silhouette,
  className,
  children,
}: {
  birdId: string;
  silhouette: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const h = ref.current;
    const bird = document.getElementById(birdId);
    if (!h || !bird) return;
    const place = () => {
      const a = h.getBoundingClientRect();
      const b = bird.getBoundingClientRect();
      const s = h.style;
      s.backgroundImage = `url(${silhouette}), linear-gradient(var(--lp-forest), var(--lp-forest))`;
      s.backgroundSize = `${b.width}px ${b.height}px, 100% 100%`;
      s.backgroundPosition = `${b.left - a.left}px ${b.top - a.top}px, 0 0`;
      s.backgroundRepeat = "no-repeat";
      s.backgroundClip = "text";
      s.setProperty("-webkit-background-clip", "text");
      s.color = "transparent";
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(h);
    ro.observe(bird);
    window.addEventListener("resize", place);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", place);
    };
  }, [birdId, silhouette]);

  return (
    <h1 ref={ref} className={className}>
      {children}
    </h1>
  );
}
