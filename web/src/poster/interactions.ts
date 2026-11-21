export type KeyAction =
  { type: "select" } | { type: "remove" } | { type: "move"; delta: 1 | -1 };

/**
 * Keys on a focused bird. Enter or Space selects it, which shows the Mirror and Remove buttons.
 * Delete or Backspace removes it. Arrow keys move it one place through the poster order.
 * Escape is handled by the poster, since it works from the buttons too.
 * (dnd-kit's own keyboard sensor lifts with Space, which would clash with select, so we use these keys.)
 */
export function keyToAction(key: string): KeyAction | null {
  switch (key) {
    case "Enter":
    case " ":
      return { type: "select" };
    case "Delete":
    case "Backspace":
      return { type: "remove" };
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
