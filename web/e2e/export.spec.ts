import { LIVE, expect, test } from "./test";

const poster = "[data-poster] [data-animal]";

test.describe("share and export", () => {
  test.skip(LIVE, "Uses the mocked backend so the render is instant");

  test("Share saves the poster and copies a link that opens the same poster", async ({
    page,
    context,
    browserName,
  }, info) => {
    test.skip(
      info.project.name.startsWith("phone"),
      "Share sits in the desktop header; phones share from Export",
    );
    if (browserName === "chromium")
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/make");
    await expect(page.locator(poster)).toHaveCount(12);
    await page.locator("[data-poster-title]").fill("Our garden");
    await page.getByRole("button", { name: "Share" }).first().click();
    await expect(
      page.getByRole("button", { name: "Link copied" }),
    ).toBeVisible();
    const link = await page.evaluate(() => navigator.clipboard.readText());
    expect(link).toMatch(/\/p\/t\d{7}$/);

    await page.evaluate(() => localStorage.clear());
    await page.goto(new URL(link).pathname);
    await expect(page.locator(poster)).toHaveCount(12);
    await expect(page.locator("[data-poster-title]")).toHaveValue("Our garden");
  });

  test("a broken share link says so and offers a fresh start", async ({
    page,
  }) => {
    await page.goto("/p/nope0000");
    await expect(
      page.getByRole("alert").filter({ hasText: "This poster link" }),
    ).toContainText("This poster link does not work");
    await page.getByRole("link", { name: "Start a poster" }).click();
    await expect(page.locator(poster)).toHaveCount(12);
  });

  test("Export makes a preview with progress, then offers the download", async ({
    page,
  }) => {
    await page.goto("/make");
    await expect(page.locator(poster)).toHaveCount(12);
    await page.getByRole("button", { name: "Export" }).click();
    const dialog = page.getByRole("dialog", { name: "Export your poster" });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: "Buy the print file" }),
    ).toBeDisabled();
    await dialog.getByRole("button", { name: "Make the preview" }).click();
    const download = dialog.getByRole("link", { name: "Download PNG" });
    await expect(download).toBeVisible();
    await expect(download).toHaveAttribute(
      "href",
      "/api/v1/files/renders/job1.png",
    );
    await expect(download).toHaveAttribute(
      "download",
      "animarka-poster-preview.png",
    );
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });

  test("the Close button closes the export dialog", async ({ page }) => {
    await page.goto("/make");
    await expect(page.locator(poster)).toHaveCount(12);
    await page.getByRole("button", { name: "Export" }).click();
    const dialog = page.getByRole("dialog", { name: "Export your poster" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Close" }).click();
    await expect(dialog).toHaveCount(0);
  });

  test("the export code loads only when Export is pressed", async ({
    page,
  }) => {
    const scripts: string[] = [];
    page.on(
      "request",
      (r) => r.resourceType() === "script" && scripts.push(r.url()),
    );
    await page.goto("/make");
    await expect(page.locator(poster)).toHaveCount(12);
    const before = scripts.length;
    await page.getByRole("button", { name: "Export" }).click();
    await expect(
      page.getByRole("dialog", { name: "Export your poster" }),
    ).toBeVisible();
    expect(scripts.length).toBeGreaterThan(before);
  });
});
