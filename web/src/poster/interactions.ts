export type KeyAction = { type: "mirror" } | { type: "move"; delta: 1 | -1 };

/**
 * Keys on a focused bird. Enter or Space mirrors it. Arrow keys move it one place through the poster order.
 * (dnd-kit's own keyboard sensor lifts with Space, which would clash with mirror, so we use these keys.)
 */
export function keyToAction(key: string): KeyAction | null {
  switch (key) {
    case "Enter":
    case " ":
      return { type: "mirror" };
    case "ArrowRight":
    case "ArrowDown":
      return { type: "move", delta: 1 };
    case "ArrowLeft":
    case "ArrowUp":
      return { type: "move", delta: -1 };
    default:
      return null;
  }
}
