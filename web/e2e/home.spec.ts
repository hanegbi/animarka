import { expect, test } from "@playwright/test";

test("home opens the builder with a ready poster", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-poster]")).toBeVisible();
  await expect(
    page.getByRole("searchbox", { name: "Search birds" }),
  ).toBeVisible();
  await expect(page.getByRole("radiogroup", { name: "Layout" })).toBeVisible();
  await expect(page.locator("[data-animal]")).toHaveCount(12);
});

test("the page has a title for the browser tab", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("animarka");
});
