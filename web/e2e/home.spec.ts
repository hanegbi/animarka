import { expect, test } from "@playwright/test";

test("home shows the name and tagline", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "animarka" })).toBeVisible();
  await expect(page.getByText("Build your own wildlife poster.")).toBeVisible();
});
