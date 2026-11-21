import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { openTab, type Tab } from "./helpers";

type Rect = { x: number; y: number; w: number; h: number };

async function open(page: Page) {
  await page.goto("/");
  await expect(page.locator("[data-animal]")).toHaveCount(12);
}

const rect = async (page: Page, selector: string): Promise<Rect> => {
  const b = (await page.locator(selector).first().boundingBox())!;
  return { x: b.x, y: b.y, w: b.width, h: b.height };
};

const insideViewport = (page: Page, r: Rect) => {
  const v = page.viewportSize()!;
  return (
    r.x >= -0.5 &&
    r.y >= -0.5 &&
    r.x + r.w <= v.width + 0.5 &&
    r.y + r.h <= v.height + 0.5
  );
};

const desktopOnly = (name: string) => name !== "desktop-1280";
const phoneOnly = (name: string) => name !== "phone-390";

test.describe("phone shell (poster on top, tab bar, short sheet)", () => {
  test.beforeEach(({}, info) =>
    test.skip(phoneOnly(info.project.name), "phone only"),
  );

  test("the poster stays fully in view in every sheet state", async ({
    page,
  }) => {
    await open(page);
    const states: (Tab | null)[] = ["Birds", "Layout", "Style", null];
    for (const tab of states) {
      if (tab) await openTab(page, tab);
      else
        await page
          .getByRole("navigation", { name: "Poster tools" })
          .getByRole("button", { expanded: true })
          .click();
      const poster = await rect(page, "[data-poster]");
      expect(
        insideViewport(page, poster),
        `${tab ?? "closed"} poster in view`,
      ).toBe(true);
      expect(poster.h, `${tab ?? "closed"} poster height`).toBeGreaterThan(200);
      // Nothing covers the poster: the sheet and the tab bar start below it.
      const sheet = page.locator("#sheet");
      if (await sheet.isVisible())
        expect((await rect(page, "#sheet")).y).toBeGreaterThanOrEqual(
          poster.y + poster.h - 1,
        );
      expect(
        (await rect(page, "nav[aria-label='Poster tools']")).y,
      ).toBeGreaterThanOrEqual(poster.y + poster.h - 1);
    }
  });

  test("the sheet starts on Birds, a tab opens its tools and a second tap closes it", async ({
    page,
  }) => {
    await open(page);
    const nav = page.getByRole("navigation", { name: "Poster tools" });
    await expect(nav.getByRole("button", { name: "Birds" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(
      page.getByRole("searchbox", { name: "Search birds" }),
    ).toBeVisible();
    await nav.getByRole("button", { name: "Style" }).click();
    await expect(
      page.getByRole("radiogroup", { name: "Design" }),
    ).toBeVisible();
    await expect(
      page.getByRole("searchbox", { name: "Search birds" }),
    ).toHaveCount(0);
    await nav.getByRole("button", { name: "Style" }).click();
    await expect(page.locator("#sheet")).toBeHidden();
  });

  test("Escape closes the sheet and the poster grows", async ({ page }) => {
    await open(page);
    const small = (await rect(page, "[data-poster]")).h;
    await page.keyboard.press("Escape");
    await expect(page.locator("#sheet")).toBeHidden();
    await expect
      .poll(async () => (await rect(page, "[data-poster]")).h)
      .toBeGreaterThan(small + 50);
  });

  test("the page itself never scrolls", async ({ page }) => {
    await open(page);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollHeight <= window.innerHeight + 1,
      ),
    ).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });

  test("undo and redo are in the header, as pictures with names", async ({
    page,
  }) => {
    await open(page);
    await expect(
      page
        .getByRole("toolbar", { name: "Poster actions" })
        .getByRole("button", { name: "Undo" }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("toolbar", { name: "Poster actions" })
        .getByRole("button", { name: "Redo" }),
    ).toBeVisible();
  });

  test("the art credits are in the Birds sheet", async ({ page }) => {
    await open(page);
    await page
      .locator("#sheet")
      .evaluate((el) => el.scrollTo({ top: el.scrollHeight }));
    await expect(page.getByText("CC BY 4.0")).toBeVisible();
    await expect(page.getByText("Both sets are AI generated")).toBeVisible();
  });
});

test.describe("desktop shell (picker left, toolbar above the poster)", () => {
  test.beforeEach(({}, info) =>
    test.skip(desktopOnly(info.project.name), "desktop only"),
  );

  test("shows the picker, the toolbar with every style control, and the poster, with no tab bar", async ({
    page,
  }) => {
    await open(page);
    await expect(
      page.getByRole("navigation", { name: "Poster tools" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("searchbox", { name: "Search birds" }),
    ).toBeVisible();
    const toolbar = page.getByRole("toolbar", { name: "Poster style" });
    for (const group of [
      "Design",
      "Labels",
      "Layout",
      "Background",
      "Poster size",
    ]) {
      await expect(
        toolbar.getByRole("radiogroup", { name: group }),
      ).toBeVisible();
    }
  });

  test("the poster fits the window without scrolling, below the toolbar and beside the picker", async ({
    page,
  }) => {
    await open(page);
    const poster = await rect(page, "[data-poster]");
    const toolbar = await rect(
      page,
      "[role=toolbar][aria-label='Poster style']",
    );
    const picker = await rect(page, "aside[aria-label='Pick birds']");
    expect(insideViewport(page, poster)).toBe(true);
    expect(poster.y).toBeGreaterThanOrEqual(toolbar.y + toolbar.h - 1);
    expect(poster.x).toBeGreaterThanOrEqual(picker.x + picker.w - 1);
    expect(poster.h).toBeGreaterThan(380);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollHeight <= window.innerHeight + 1,
      ),
    ).toBe(true);
  });

  test("art credits for both sources are always visible", async ({ page }) => {
    await open(page);
    await expect(page.getByText("CC BY 4.0")).toBeVisible();
    await expect(page.getByText("MIT. Both sets")).toBeVisible();
  });

  test("at 1100 px wide the desktop shell still works, and just below it the phone shell takes over", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1100, height: 800 });
    await open(page);
    await expect(
      page.getByRole("toolbar", { name: "Poster style" }),
    ).toBeVisible();
    expect(insideViewport(page, await rect(page, "[data-poster]"))).toBe(true);
    await page.setViewportSize({ width: 1099, height: 800 });
    await expect(
      page.getByRole("navigation", { name: "Poster tools" }),
    ).toBeVisible();
    await expect(
      page.getByRole("toolbar", { name: "Poster style" }),
    ).toHaveCount(0);
  });
});

test.describe("accessibility", () => {
  test("the builder has no serious or critical axe violations in any state", async ({
    page,
  }) => {
    await open(page);
    const states: Tab[] = ["Birds", "Layout", "Style"];
    const found: string[] = [];
    for (const tab of states) {
      await openTab(page, tab);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      for (const v of result.violations) {
        if (v.impact === "serious" || v.impact === "critical") {
          found.push(
            `${tab}: ${v.id} (${v.impact}) ${v.nodes
              .slice(0, 2)
              .map((n) => n.target.join(" "))
              .join(" | ")}`,
          );
        }
      }
    }
    expect([...new Set(found)]).toEqual([]);
  });

  test("with a bird selected, the Mirror and Remove bar has no serious or critical axe violations", async ({
    page,
  }) => {
    await open(page);
    await page.locator('[data-animal="bubo-bubo"] [data-art]').click();
    await expect(page.locator("[data-bird-bar]")).toBeVisible();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    const bad = result.violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map(
        (v) =>
          `${v.id}: ${v.nodes
            .slice(0, 2)
            .map((n) => n.target.join(" "))
            .join(" | ")}`,
      );
    expect(bad).toEqual([]);
  });
});
