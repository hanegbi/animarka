import { describe, expect, it } from "vitest";
import { keyToAction } from "./interactions";

describe("keyToAction", () => {
  it("Enter and Space mirror", () => {
    expect(keyToAction("Enter")).toEqual({ type: "mirror" });
    expect(keyToAction(" ")).toEqual({ type: "mirror" });
  });

  it("arrow keys move one place", () => {
    expect(keyToAction("ArrowRight")).toEqual({ type: "move", delta: 1 });
    expect(keyToAction("ArrowDown")).toEqual({ type: "move", delta: 1 });
    expect(keyToAction("ArrowLeft")).toEqual({ type: "move", delta: -1 });
    expect(keyToAction("ArrowUp")).toEqual({ type: "move", delta: -1 });
  });

  it("ignores other keys so Tab and shortcuts keep working", () => {
    for (const k of ["Tab", "Escape", "a", "z", "Shift", "Control"])
      expect(keyToAction(k)).toBeNull();
  });
});
