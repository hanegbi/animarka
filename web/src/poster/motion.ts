/**
 * R8 D3, hop and turn: the bird hops a little, turns in the air and settles, in 300 ms.
 * Run it on the art box right after the mirror state flips. It starts at scaleX(-1), which shows the
 * old direction, so the turn reads correctly without waiting for React.
 */
export function hopTurn(el: Element | null | undefined): void {
  if (!el || typeof el.animate !== "function") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  el.animate(
    [
      { transform: "translateY(0) scaleX(-1)" },
      { transform: "translateY(-9%) scaleX(0)", offset: 0.45 },
      { transform: "translateY(-3%) scaleX(1)", offset: 0.75 },
      { transform: "translateY(0.6%) scaleX(1)", offset: 0.9 },
      { transform: "translateY(0) scaleX(1)" },
    ],
    { duration: 300, easing: "ease-out" },
  );
}
