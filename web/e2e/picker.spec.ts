import { expect, test, type Page } from "@playwright/test";

/** A fresh visitor: no saved poster, so the 12 bird starter poster shows. */
async function open(page: Page) {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Your poster/ }),
  ).toBeVisible();
}

const trayText = (page: Page) => page.locator("#tray-title");
const onPoster = (page: Page) => page.locator("[data-animal]");
const card = (page: Page, name: string) =>
  page.getByRole("option", { name, exact: true });

test("starts with the 12 bird starter poster", async ({ page }) => {
  await open(page);
  await expect(onPoster(page)).toHaveCount(12);
  await expect(trayText(page)).toContainText("12 birds from 10 families");
  await expect(page.locator("[data-title]")).toHaveValue("Birds");
});

test("tapping a card adds a bird to the poster and tapping again removes it", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: /^Clear poster$/ }).click();
  await expect(onPoster(page)).toHaveCount(0);
  await card(page, "Western Barn Owl").click();
  await expect(onPoster(page)).toHaveCount(1);
  await expect(card(page, "Western Barn Owl")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(trayText(page)).toContainText("1 bird from 1 family");
  await card(page, "Western Barn Owl").click();
  await expect(onPoster(page)).toHaveCount(0);
});

test("the tray removes a bird", async ({ page }) => {
  await open(page);
  await page
    .getByRole("button", { name: "Remove Mute Swan from poster" })
    .click();
  await expect(onPoster(page)).toHaveCount(11);
  await expect(
    page.getByRole("button", { name: "Remove Mute Swan from poster" }),
  ).toHaveCount(0);
});

test("a family chip only filters the list and never resets the poster", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: /^Owls(,|$)/ }).click();
  await expect(page.getByRole("status")).toContainText("Owls, 12 birds");
  await expect(onPoster(page)).toHaveCount(12);
  await expect(trayText(page)).toContainText("12 birds");
});

test("family chips show how many birds are on the poster", async ({ page }) => {
  await open(page);
  await expect(
    page.getByRole("button", { name: "Ducks, swans and geese, 2 on poster" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Owls, 2 on poster" }),
  ).toBeVisible();
});

test("add all, then remove these", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: /^Owls(,|$)/ }).click();
  await page.getByRole("button", { name: "Add all 12" }).click();
  await expect(onPoster(page)).toHaveCount(22);
  await page.getByRole("button", { name: "Remove these 12" }).click();
  await expect(onPoster(page)).toHaveCount(10);
});

test("only this family replaces the poster, and the title follows", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: /^Woodpeckers(,|$)/ }).click();
  await page.getByRole("button", { name: "Only woodpeckers" }).click();
  await expect(onPoster(page)).toHaveCount(12);
  await expect(page.locator("[data-title]")).toHaveValue("Woodpeckers");
  await expect(
    page.getByRole("button", { name: "Only woodpeckers" }),
  ).toBeDisabled();
});

test("search finds by common name, scientific name and family", async ({
  page,
}) => {
  await open(page);
  const search = page.getByRole("searchbox", { name: "Search birds" });
  await search.fill("kestrel");
  await expect(page.getByRole("status")).toContainText("3 found");
  await search.fill("tyto alba");
  await expect(page.getByRole("status")).toContainText("1 found");
  await search.fill("woodpeckers");
  await expect(page.getByRole("status")).toContainText("12 found");
  await search.fill("zzzz");
  await expect(page.getByRole("status")).toContainText(
    "No bird matches that search.",
  );
});

test("only these N after a search replaces the poster with the results", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("searchbox", { name: "Search birds" }).fill("kestrel");
  await page.getByRole("button", { name: "Only these 3" }).click();
  await expect(onPoster(page)).toHaveCount(3);
});

test("clear search brings the whole list back", async ({ page }) => {
  await open(page);
  await page.getByRole("searchbox", { name: "Search birds" }).fill("kestrel");
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(page.getByRole("status")).toContainText("All 118 birds");
});

test("surprise mix builds 12 to 16 birds and clear empties the poster", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: "Surprise mix" }).click();
  const n = await onPoster(page).count();
  expect(n).toBeGreaterThanOrEqual(12);
  expect(n).toBeLessThanOrEqual(16);
  await page.getByRole("button", { name: "Clear poster" }).click();
  await expect(onPoster(page)).toHaveCount(0);
  await expect(
    page.getByText("Empty. Pick birds above, or try Surprise mix."),
  ).toBeVisible();
});

test("presets replace the poster", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Owls of the world" }).click();
  await expect(onPoster(page)).toHaveCount(12);
  await expect(page.locator("[data-title]")).toHaveValue("Owls");
});

test("keyboard: arrow keys move through the cards and space toggles", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: /^Owls(,|$)/ }).click();
  await page.getByRole("button", { name: /^Clear poster$/ }).click();
  await card(page, "Western Barn Owl").focus();
  await page.keyboard.press("Space");
  await expect(onPoster(page)).toHaveCount(1);
  await page.keyboard.press("ArrowRight");
  await expect(card(page, "Short-eared Owl")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(onPoster(page)).toHaveCount(2);
  await page.keyboard.press("End");
  await expect(card(page, "Great Horned Owl")).toBeFocused();
});

test("only one card is a tab stop, so tabbing does not walk the whole list", async ({
  page,
}) => {
  await open(page);
  expect(await page.locator("[role=option][tabindex='0']").count()).toBe(1);
});

test("the poster is saved and comes back after a reload", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: /^Clear poster$/ }).click();
  await card(page, "Little Owl").click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: /Your poster/ }),
  ).toBeVisible();
  await expect(onPoster(page)).toHaveCount(1);
});
