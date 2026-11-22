import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./test";

test.describe("landing page", () => {
  test("the hero says what it is and both buttons lead into the tool", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Every bird you love, on one poster.",
      }),
    ).toBeVisible();
    await expect(page.locator("[data-gallery-wall] img")).toHaveCount(3);
    await page.getByRole("link", { name: "Start from a set" }).click();
    await expect(page).toHaveURL(/#sets$/);
    await expect(
      page.getByRole("list", { name: "Ready sets" }),
    ).toBeInViewport();
    await page
      .getByRole("main")
      .getByRole("link", { name: "Make your poster" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/make$/);
    await expect(page.locator("[data-poster] [data-animal]")).toHaveCount(12);
  });

  test("a set card opens the builder with that set, named after it", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Owls of the world/ }).click();
    await expect(page).toHaveURL(/\/make$/);
    await expect(page.locator("[data-poster-title]")).toHaveValue(
      "Owls of the world",
    );
    await expect(page.locator("[data-poster] [data-animal]")).not.toHaveCount(
      12,
    );
  });

  test("the style slider works from the keyboard", async ({ page }) => {
    await page.goto("/");
    const range = page.getByRole("slider", { name: "Compare the two styles" });
    await range.focus();
    await page.keyboard.press("End");
    await expect(range).toHaveValue("100");
    const clip = await page
      .locator("[data-compare] img")
      .nth(1)
      .evaluate((el) => (el as HTMLElement).style.clipPath);
    expect(clip).toBe("inset(0px 0% 0px 0px)");
  });

  test("questions open one at a time", async ({ page }) => {
    await page.goto("/");
    const free = page.getByRole("button", { name: "Is it free?" });
    const account = page.getByRole("button", { name: "Do I need an account?" });
    await expect(free).toHaveAttribute("aria-expanded", "true");
    await account.click();
    await expect(account).toHaveAttribute("aria-expanded", "true");
    await expect(free).toHaveAttribute("aria-expanded", "false");
    await expect(
      page.getByText("No. Open the builder and start."),
    ).toBeVisible();
  });

  test("no credits paragraph on the landing, and the page never scrolls sideways", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("footer")).not.toContainText("CC BY");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });

  test("no serious or critical accessibility problems", async ({ page }) => {
    await page.goto("/");
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

  test("share preview and description are set", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /\/landing\/og\.jpg$/,
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /1,161 species/,
    );
  });
});
