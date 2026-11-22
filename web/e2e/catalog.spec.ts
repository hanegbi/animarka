import fs from "node:fs";
import path from "node:path";
import { openTab } from "./helpers";
import { LIVE, expect, test } from "./test";

type Fixture = {
  species: { species: { id: string; names: { en?: string; he?: string } }[] };
};
const FIXTURE: Fixture = JSON.parse(
  fs.readFileSync(path.resolve("src/catalog/fixture/catalog.json"), "utf8"),
);
const names = (id: string) =>
  FIXTURE.species.species.find((s) => s.id === id)!.names;

const poster = "[data-poster] [data-animal]";

test.describe("catalog from the API", () => {
  test.skip(
    LIVE,
    "These tests break the API on purpose, so they only run on mocks",
  );

  test("when the API fails and nothing is saved, a clear error offers a retry", async ({
    page,
  }) => {
    await page.route("**/api/v1/catalogs/**", (r) => r.abort());
    await page.goto("/make");
    const alert = page.getByRole("alert").filter({ hasText: "birds" });
    await expect(alert).toContainText("We could not load the birds");
    await page.unroute("**/api/v1/catalogs/**");
    await alert.getByRole("button", { name: "Try again" }).click();
    await expect(page.locator(poster)).toHaveCount(12);
  });

  test("when the API fails later, the copy saved on this device is used", async ({
    page,
  }) => {
    await page.goto("/make");
    await expect(page.locator(poster)).toHaveCount(12);
    await page.waitForFunction(
      () => !!localStorage.getItem("animarka:catalog:v2"),
      undefined,
      { timeout: 10_000 },
    );
    await page.route("**/api/v1/catalogs/**", (r) => r.abort());
    await page.reload();
    await expect(page.locator(poster)).toHaveCount(12);
  });
});

test("the names switch puts Hebrew names on the poster, right to left", async ({
  page,
}) => {
  await page.goto("/make");
  await expect(page.locator(poster)).toHaveCount(12);
  const owl = names("tyto-alba");
  expect(
    owl.he,
    "the fixture should hold a Hebrew name for the barn owl",
  ).toBeTruthy();
  await openTab(page, "Style");
  const group = page.getByRole("radiogroup", { name: "Bird names" });
  await group.getByRole("radio", { name: "עברית" }).click();
  const art = page.locator("[data-poster]");
  await expect(art.getByText(owl.he!, { exact: true })).toBeVisible();
  await expect(art).toHaveAttribute("lang", "he");
  await expect(art).toHaveAttribute("dir", "rtl");
  await group.getByRole("radio", { name: "English" }).click();
  await expect(art.getByText(owl.en!, { exact: true })).toBeVisible();
});

test("search answers in under 100 ms, from typing to the updated list", async ({
  page,
  catalog,
}) => {
  await page.goto("/make");
  await expect(page.locator(poster)).toHaveCount(12);
  await openTab(page, "Birds");
  await expect(
    page.getByRole("searchbox", { name: "Search birds" }),
  ).toBeVisible();
  // Each query changes the status line, so every step has something to wait for.
  const queries = ["kestrel", "", "owl", "", "heron", "", "tyto alba", ""];
  const times = await page.evaluate(async (qs) => {
    const input =
      document.querySelector<HTMLInputElement>("input[type=search]")!;
    const status = [...document.querySelectorAll("p[role=status]")].find((p) =>
      /birds|found/.test(p.textContent ?? ""),
    )!;
    const setValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!;
    const out: number[] = [];
    for (const q of qs) {
      const before = status.textContent;
      const changed = new Promise<void>((resolve) => {
        const mo = new MutationObserver(() => {
          if (status.textContent !== before) {
            mo.disconnect();
            resolve();
          }
        });
        mo.observe(status, {
          subtree: true,
          childList: true,
          characterData: true,
        });
      });
      const t0 = performance.now();
      setValue.call(input, q);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await changed;
      // Wait for the paint that shows it.
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      out.push(performance.now() - t0);
    }
    return out;
  }, queries);
  console.log(
    `[search] ${catalog.list.length} birds, slowest ${Math.round(Math.max(...times))} ms`,
    times.map(Math.round).join(" "),
  );
  expect(Math.max(...times)).toBeLessThan(100);
});

test("the first poster does not wait for the full bird list", async ({
  page,
}) => {
  test.skip(LIVE, "Holds back the API on purpose");
  // Hold the full list back; the small request for the poster's birds goes through.
  let release!: () => void;
  const held = new Promise<void>((r) => (release = r));
  await page.route(/\/species\?(?!.*ids=)/, async (route) => {
    await held;
    await route.fallback();
  });
  await page.goto("/make");
  await expect(page.locator(poster)).toHaveCount(12);
  await openTab(page, "Birds");
  await expect(page.locator("[data-catalog-loading]")).toBeVisible();
  release();
  await expect(page.locator("[data-catalog-loading]")).toHaveCount(0);
  await expect(
    page.getByRole("listbox").first().getByRole("option").first(),
  ).toBeVisible();
  // The poster kept going: still 12 birds, and nothing was reset.
  await expect(page.locator(poster)).toHaveCount(12);
});
