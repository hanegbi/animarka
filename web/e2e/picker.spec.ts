import type { Page } from "@playwright/test";
import { STARTER_IDS } from "../src/catalog/starter";
import { openFamilies, pickPreset } from "./helpers";
import { expect, test } from "./test";

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
/** A family chip. Scoped, because a preset can share the family's name. */
/** Open the family list (if closed) and return the row for a family. */
const chip = (page: Page, family: string) => ({
  async click() {
    await openFamilies(page);
    await page
      .getByRole("group", { name: "Show a family" })
      .getByRole("button", { name: new RegExp(`^${family}(,|$)`) })
      .click();
  },
});
const status = (page: Page) => page.locator("p[role=status]");
/** The list only renders the rows in view, so find a bird by searching, as a person would. */
async function find(page: Page, query: string) {
  await page.getByRole("searchbox", { name: "Search birds" }).fill(query);
}
const OWLS = "Owls";

test("starts with the 12 bird starter poster", async ({ page, catalog }) => {
  await open(page);
  await expect(onPoster(page)).toHaveCount(12);
  const families = catalog.familiesOf(STARTER_IDS).size;
  await expect(trayText(page)).toContainText(
    `12 birds from ${families} families`,
  );
  await expect(page.locator("[data-poster-title]")).toHaveValue("Birds");
});

test("tapping a card adds a bird to the poster and tapping again removes it", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: /^Clear poster$/ }).click();
  await expect(onPoster(page)).toHaveCount(0);
  await find(page, "barn owl");
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
  catalog,
}) => {
  await open(page);
  await chip(page, OWLS).click();
  await expect(status(page)).toContainText(
    `${OWLS}, ${catalog.family(OWLS).length} birds`,
  );
  await expect(onPoster(page)).toHaveCount(12);
  await expect(trayText(page)).toContainText("12 birds");
});

test("family chips show how many birds are on the poster", async ({
  page,
  catalog,
}) => {
  await open(page);
  await openFamilies(page);
  const group = page.getByRole("group", { name: "Show a family" });
  for (const family of catalog.familiesOf(STARTER_IDS)) {
    const n = STARTER_IDS.filter(
      (id) => catalog.get(id).family === family,
    ).length;
    await expect(
      group.getByRole("button", {
        name: `${family}, ${n} on poster`,
        exact: true,
      }),
    ).toHaveCount(1);
  }
});

test("add all, then remove these", async ({ page, catalog }) => {
  await open(page);
  const owls = catalog.family(OWLS);
  const already = owls.filter((s) => STARTER_IDS.includes(s.id)).length;
  await chip(page, OWLS).click();
  await page
    .getByRole("button", {
      name: `Add all ${owls.length.toLocaleString("en-US")}`,
    })
    .click();
  await expect(onPoster(page)).toHaveCount(12 + owls.length - already);
  await page
    .getByRole("button", { name: `Remove these ${owls.length}` })
    .click();
  await expect(onPoster(page)).toHaveCount(12 - already);
});

test("only this family replaces the poster, and the title follows", async ({
  page,
  catalog,
}) => {
  await open(page);
  await chip(page, "Woodpeckers").click();
  await page.getByRole("button", { name: "Only woodpeckers" }).click();
  await expect(onPoster(page)).toHaveCount(
    catalog.family("Woodpeckers").length,
  );
  await expect(page.locator("[data-poster-title]")).toHaveValue("Woodpeckers");
  await expect(
    page.getByRole("button", { name: "Only woodpeckers" }),
  ).toBeDisabled();
});

test("search finds by common name, scientific name and family", async ({
  page,
  catalog,
}) => {
  await open(page);
  const search = page.getByRole("searchbox", { name: "Search birds" });
  for (const q of ["kestrel", "tyto alba", "woodpeckers"]) {
    await search.fill(q);
    await expect(status(page)).toContainText(
      `${catalog.search(q).length.toLocaleString("en-US")} found`,
    );
  }
  expect(catalog.search("tyto alba")).toHaveLength(1);
  await search.fill("zzzz");
  await expect(page.locator("p[role=status]")).toContainText(
    "No bird matches that search.",
  );
});

test("only these N after a search replaces the poster with the results", async ({
  page,
  catalog,
}) => {
  await open(page);
  const n = catalog.search("kestrel").length;
  await page.getByRole("searchbox", { name: "Search birds" }).fill("kestrel");
  await page.getByRole("button", { name: `Only these ${n}` }).click();
  await expect(onPoster(page)).toHaveCount(n);
});

test("clear search brings the whole list back", async ({ page, catalog }) => {
  await open(page);
  await page.getByRole("searchbox", { name: "Search birds" }).fill("kestrel");
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(status(page)).toContainText(
    `All ${catalog.list.length.toLocaleString("en-US")} birds`,
  );
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
    page.getByText("Nothing yet. Tap birds below, or try Surprise mix."),
  ).toBeVisible();
});

test("presets replace the poster, and a one family preset names it", async ({
  page,
  catalog,
}) => {
  await open(page);
  const owls = catalog.preset("owls-of-the-world");
  await pickPreset(page, owls.title);
  await expect(onPoster(page)).toHaveCount(owls.ids.length);
  const hummingbirds = catalog.preset("hummingbirds");
  await pickPreset(page, hummingbirds.title);
  await expect(onPoster(page)).toHaveCount(hummingbirds.ids.length);
  await expect(page.locator("[data-poster-title]")).toHaveValue(
    catalog.get(hummingbirds.ids[0]).family,
  );
});

test("keyboard: arrow keys move through the cards and space toggles", async ({
  page,
  catalog,
}) => {
  const owls = catalog.family(OWLS).map((s) => s.names.en!);
  await open(page);
  await chip(page, OWLS).click();
  await page.getByRole("button", { name: /^Clear poster$/ }).click();
  await card(page, owls[0]).focus();
  await page.keyboard.press("Space");
  await expect(onPoster(page)).toHaveCount(1);
  await page.keyboard.press("ArrowRight");
  await expect(card(page, owls[1])).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(onPoster(page)).toHaveCount(2);
  await page.keyboard.press("End");
  await expect(card(page, owls[owls.length - 1])).toBeFocused();
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
  await find(page, "little owl");
  await card(page, "Little Owl").click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: /Your poster/ }),
  ).toBeVisible();
  await expect(onPoster(page)).toHaveCount(1);
});

test("Add all and Remove these do not make the buttons jump", async ({
  page,
}) => {
  await open(page);
  await chip(page, "Owls").click();
  const add = page.getByRole("button", { name: /^Add all/ });
  const y0 = (await add.boundingBox())!.y;
  await add.click();
  const remove = page.getByRole("button", { name: /^Remove these/ });
  await expect(remove).toBeVisible();
  expect(Math.abs((await remove.boundingBox())!.y - y0)).toBeLessThan(1);
  await remove.click();
  await expect(page.getByRole("button", { name: /^Add all/ })).toBeVisible();
  expect(
    Math.abs(
      (await page.getByRole("button", { name: /^Add all/ }).boundingBox())!.y -
        y0,
    ),
  ).toBeLessThan(1);
});

test("bird cards have no hover tooltip", async ({ page }) => {
  await open(page);
  expect(await page.locator("[role=option][title]").count()).toBe(0);
});
