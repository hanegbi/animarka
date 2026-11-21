import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BuilderFallback } from "./Builder";

afterEach(cleanup);

describe("loading state", () => {
  it("is announced as busy and says what is loading", () => {
    render(<BuilderFallback />);
    const status = screen.getByRole("status", { name: "Loading your poster" });
    expect(status.getAttribute("aria-busy")).toBe("true");
  });

  it("keeps the poster shape, so nothing jumps when the poster arrives", () => {
    const { container } = render(<BuilderFallback />);
    expect(container.querySelector(".aspect-\\[3\\/4\\]")).toBeTruthy();
  });

  it("stops pulsing under reduced motion", () => {
    const { container } = render(<BuilderFallback />);
    const pulsing = [...container.querySelectorAll(".animate-pulse")];
    expect(pulsing.length).toBeGreaterThan(5);
    expect(
      pulsing.every((el) =>
        el.className.includes("motion-reduce:animate-none"),
      ),
    ).toBe(true);
  });
});
