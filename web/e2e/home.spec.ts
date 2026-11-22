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

test("the landing page at / leads to the builder at /make", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Every bird you love, on one poster." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Make your poster" }).click();
  await expect(page).toHaveURL(/\/make$/);
  await expect(page.locator("[data-poster] [data-animal]")).toHaveCount(12);
});
