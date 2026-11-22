import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { LIVE, expect, test } from "./test";
import { openTab, type Tab } from "./helpers";

type Rect = { x: number; y: number; w: number; h: number };

async function open(page: Page) {
  await page.goto("/make");
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

  test("the art credits open from the header", async ({ page }) => {
    await open(page);
    await expect(page.getByText("CC BY 4.0")).toHaveCount(0);
    await page.getByRole("button", { name: "Credits" }).click();
    await expect(page.getByText("CC BY 4.0")).toBeVisible();
    await expect(page.getByText("Both sets are AI generated")).toBeVisible();
  });
});

test.describe("desktop shell (birds left, poster centre, style right)", () => {
  test.beforeEach(({}, info) =>
    test.skip(desktopOnly(info.project.name), "desktop only"),
  );

  test("shows the picker, the style column with every control, names first, and no tab bar", async ({
    page,
  }) => {
    await open(page);
    await expect(
      page.getByRole("navigation", { name: "Poster tools" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("searchbox", { name: "Search birds" }),
    ).toBeVisible();
    const inspector = page.getByRole("complementary", { name: "Poster style" });
    const groups = await inspector
      .getByRole("radiogroup")
      .evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
    expect(groups[0]).toBe("Bird names");
    for (const group of [
      "Bird names",
      "Design",
      "Labels",
      "Layout",
      "Background",
      "Poster size",
    ]) {
      await expect(
        inspector.getByRole("radiogroup", { name: group }),
      ).toBeVisible();
    }
  });

  test("the poster fits the window without scrolling, between the picker and the style column, and uses the full height", async ({
    page,
  }) => {
    await open(page);
    const poster = await rect(page, "[data-poster]");
    const inspector = await rect(page, "aside[aria-label='Poster style']");
    const picker = await rect(page, "aside[aria-label='Pick birds']");
    expect(insideViewport(page, poster)).toBe(true);
    expect(poster.x).toBeGreaterThanOrEqual(picker.x + picker.w - 1);
    expect(poster.x + poster.w).toBeLessThanOrEqual(inspector.x + 1);
    // With no toolbar above it, the poster takes most of the window height.
    expect(poster.h).toBeGreaterThan(page.viewportSize()!.height * 0.75);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollHeight <= window.innerHeight + 1,
      ),
    ).toBe(true);
  });

  test("art credits for both sources open from the header", async ({
    page,
  }) => {
    await open(page);
    await page.getByRole("button", { name: "Credits" }).click();
    await expect(page.getByText("CC BY 4.0")).toBeVisible();
    await expect(page.getByText("MIT. Both sets")).toBeVisible();
  });

  test("at 1100 px wide the desktop shell still works, and just below it the phone shell takes over", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1100, height: 800 });
    await open(page);
    await expect(
      page.getByRole("complementary", { name: "Poster style" }),
    ).toBeVisible();
    expect(insideViewport(page, await rect(page, "[data-poster]"))).toBe(true);
    await page.setViewportSize({ width: 1099, height: 800 });
    await expect(
      page.getByRole("navigation", { name: "Poster tools" }),
    ).toBeVisible();
    await expect(
      page.getByRole("complementary", { name: "Poster style" }),
    ).toHaveCount(0);
  });
});

test.describe("accessibility", () => {
  // On the full live catalog axe walks well over a hundred family chips, about a minute a scan.
  test.slow(LIVE);
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
});
