import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { RadioGroup } from "./RadioGroup";

afterEach(cleanup);

const ITEMS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma" },
];

function Demo({ start = "a" }: { start?: string }) {
  const [value, setValue] = useState(start);
  return (
    <RadioGroup
      label="Letters"
      value={value}
      items={ITEMS}
      onChange={setValue}
      renderItem={(item) => item.label}
    />
  );
}

const radios = () => screen.getAllByRole("radio");

describe("RadioGroup", () => {
  it("is a named radio group with one checked item", () => {
    render(<Demo />);
    expect(screen.getByRole("radiogroup", { name: "Letters" })).toBeTruthy();
    expect(radios().map((r) => r.getAttribute("aria-checked"))).toEqual([
      "true",
      "false",
      "false",
    ]);
  });

  it("only the checked item is a tab stop", () => {
    render(<Demo start="b" />);
    expect(radios().map((r) => r.getAttribute("tabindex"))).toEqual([
      "-1",
      "0",
      "-1",
    ]);
  });

  it("clicking selects", () => {
    render(<Demo />);
    fireEvent.click(screen.getByRole("radio", { name: "Gamma" }));
    expect(radios()[2].getAttribute("aria-checked")).toBe("true");
  });

  it("arrow keys move and select, and wrap around", () => {
    render(<Demo />);
    const group = screen.getByRole("radiogroup");
    fireEvent.keyDown(group, { key: "ArrowRight" });
    expect(radios()[1].getAttribute("aria-checked")).toBe("true");
    fireEvent.keyDown(group, { key: "ArrowDown" });
    expect(radios()[2].getAttribute("aria-checked")).toBe("true");
    fireEvent.keyDown(group, { key: "ArrowRight" });
    expect(radios()[0].getAttribute("aria-checked")).toBe("true");
    fireEvent.keyDown(group, { key: "ArrowLeft" });
    expect(radios()[2].getAttribute("aria-checked")).toBe("true");
  });

  it("Home and End jump to the ends", () => {
    render(<Demo start="b" />);
    const group = screen.getByRole("radiogroup");
    fireEvent.keyDown(group, { key: "End" });
    expect(radios()[2].getAttribute("aria-checked")).toBe("true");
    fireEvent.keyDown(group, { key: "Home" });
    expect(radios()[0].getAttribute("aria-checked")).toBe("true");
  });

  it("moves focus with the selection", () => {
    render(<Demo />);
    radios()[0].focus();
    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowRight" });
    expect(document.activeElement).toBe(radios()[1]);
  });
});
