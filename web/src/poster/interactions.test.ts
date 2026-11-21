import { describe, expect, it } from "vitest";
import { keyToAction } from "./interactions";

describe("keyToAction", () => {
  it("Enter and Space select the bird, which shows Mirror and Remove", () => {
    expect(keyToAction("Enter")).toEqual({ type: "select" });
    expect(keyToAction(" ")).toEqual({ type: "select" });
  });

  it("Delete and Backspace remove it", () => {
    expect(keyToAction("Delete")).toEqual({ type: "remove" });
    expect(keyToAction("Backspace")).toEqual({ type: "remove" });
  });

  it("arrow keys move one place", () => {
    expect(keyToAction("ArrowRight")).toEqual({ type: "move", delta: 1 });
    expect(keyToAction("ArrowDown")).toEqual({ type: "move", delta: 1 });
    expect(keyToAction("ArrowLeft")).toEqual({ type: "move", delta: -1 });
    expect(keyToAction("ArrowUp")).toEqual({ type: "move", delta: -1 });
  });

  it("ignores other keys so Tab, Escape and shortcuts keep working", () => {
    for (const k of ["Tab", "Escape", "a", "z", "Shift", "Control"])
      expect(keyToAction(k)).toBeNull();
  });
});
