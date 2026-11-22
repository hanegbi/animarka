import { expect, test } from "./test";
import { openTab } from "./helpers";

test("home opens the builder with a ready poster", async ({ page }) => {
  await page.goto("/make");
  await expect(page.locator("[data-poster]")).toBeVisible();
  await expect(page.locator("[data-animal]")).toHaveCount(12);
  await expect(
    page.getByRole("searchbox", { name: "Search birds" }),
  ).toBeVisible();
  await openTab(page, "Layout");
  await expect(page.getByRole("radiogroup", { name: "Layout" })).toBeVisible();
});

test("the page has a title for the browser tab", async ({ page }) => {
  await page.goto("/make");
  await expect(page).toHaveTitle("animarka");
});
