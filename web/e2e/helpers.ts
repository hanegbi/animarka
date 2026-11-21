import type { Page } from "@playwright/test";

export type Tab = "Birds" | "Layout" | "Style";

/** On a phone the tools live in tabs. Open one. On desktop everything is already visible, so this does nothing. */
export async function openTab(page: Page, name: Tab) {
  const nav = page.getByRole("navigation", { name: "Poster tools" });
  if (!(await nav.isVisible())) return;
  const button = nav.getByRole("button", { name });
  if ((await button.getAttribute("aria-expanded")) !== "true")
    await button.click();
}

/** Which phone tab holds each radio group. */
export const GROUP_TAB: Record<string, Tab> = {
  Design: "Style",
  Labels: "Style",
  Background: "Style",
  "Bird names": "Style",
  Layout: "Layout",
  "Poster size": "Layout",
};

/** Open the "Start from a set" list in the picker, then press a preset by its title. */
export async function pickPreset(page: Page, title: string) {
  await openTab(page, "Birds");
  const sets = page.getByRole("button", { name: "Start from a set" });
  if ((await sets.getAttribute("aria-expanded")) !== "true") await sets.click();
  await page
    .getByRole("group", { name: "Start from a preset" })
    .getByRole("button", { name: title, exact: true })
    .click();
}

/** Open the family list in the picker. */
export async function openFamilies(page: Page) {
  await openTab(page, "Birds");
  const button = page.getByRole("button", { name: /^Family/ });
  if ((await button.getAttribute("aria-expanded")) !== "true")
    await button.click();
}
