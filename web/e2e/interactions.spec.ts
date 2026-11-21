import { expect, test, type Page } from "@playwright/test";

async function open(page: Page) {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Your poster/ }),
  ).toBeVisible();
  await expect(page.locator("[data-animal]")).toHaveCount(12);
}

const animal = (page: Page, id: string) =>
  page.locator(`[data-animal="${id}"]`);
const order = (page: Page) =>
  page
    .locator("[data-animal]")
    .evaluateAll((els) => els.map((e) => e.getAttribute("data-animal")!));

async function center(page: Page, id: string) {
  const b = (await animal(page, id).locator("[data-art]").boundingBox())!;
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}

/** Drag one bird onto another with the mouse, in small steps like a real hand. */
async function drag(page: Page, from: string, to: string) {
  const a = await center(page, from);
  const b = await center(page, to);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(a.x + 14, a.y + 4, { steps: 3 });
  await page.mouse.move(b.x, b.y, { steps: 12 });
  await page.mouse.up();
}

const ONE = "bubo-bubo";
const TWO = "alcedo-atthis";

test("tapping a bird mirrors it, and tapping again flips it back", async ({
  page,
}) => {
  await open(page);
  await expect(animal(page, ONE)).toHaveAttribute("data-mirrored", "false");
  await animal(page, ONE).locator("[data-art]").click();
  await expect(animal(page, ONE)).toHaveAttribute("data-mirrored", "true");
  await animal(page, ONE).locator("[data-art]").click();
  await expect(animal(page, ONE)).toHaveAttribute("data-mirrored", "false");
});

test("a mirror is one undo step", async ({ page }) => {
  await open(page);
  await animal(page, ONE).locator("[data-art]").click();
  await expect(animal(page, ONE)).toHaveAttribute("data-mirrored", "true");
  await page
    .getByRole("toolbar", { name: "Poster actions" })
    .getByRole("button", { name: "Undo" })
    .click();
  await expect(animal(page, ONE)).toHaveAttribute("data-mirrored", "false");
});

test("a tiny wobble while tapping is still a tap", async ({ page }) => {
  await open(page);
  const c = await center(page, ONE);
  await page.mouse.move(c.x, c.y);
  await page.mouse.down();
  await page.mouse.move(c.x + 3, c.y + 2);
  await page.mouse.up();
  await expect(animal(page, ONE)).toHaveAttribute("data-mirrored", "true");
});

test("dragging a bird onto another swaps their places, and does not mirror either", async ({
  page,
}) => {
  await open(page);
  const before = await order(page);
  expect(before.indexOf(ONE)).toBeLessThan(before.indexOf(TWO));
  await drag(page, ONE, TWO);
  await expect.poll(() => order(page)).not.toEqual(before);
  const after = await order(page);
  expect(after.indexOf(ONE)).toBe(before.indexOf(TWO));
  expect(after.indexOf(TWO)).toBe(before.indexOf(ONE));
  expect([...after].sort()).toEqual([...before].sort());
  await expect(animal(page, ONE)).toHaveAttribute("data-mirrored", "false");
  await expect(animal(page, TWO)).toHaveAttribute("data-mirrored", "false");
});

test("a swap is one undo step", async ({ page }) => {
  await open(page);
  const before = await order(page);
  await drag(page, ONE, TWO);
  await expect.poll(() => order(page)).not.toEqual(before);
  await page
    .getByRole("toolbar", { name: "Poster actions" })
    .getByRole("button", { name: "Undo" })
    .click();
  await expect.poll(() => order(page)).toEqual(before);
});

test("dropping a bird on empty space changes nothing", async ({ page }) => {
  await open(page);
  const before = await order(page);
  const a = await center(page, ONE);
  const poster = (await page.locator("[data-poster]").boundingBox())!;
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(a.x + 12, a.y, { steps: 3 });
  await page.mouse.move(poster.x + 4, poster.y + poster.height - 4, {
    steps: 8,
  });
  await page.mouse.up();
  expect(await order(page)).toEqual(before);
  await expect(animal(page, ONE)).toHaveAttribute("data-mirrored", "false");
});

test("touch: a finger can drag one bird onto another", async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "uses the Chrome touch protocol");
  await open(page);
  const before = await order(page);
  const a = await center(page, ONE);
  const b = await center(page, TWO);
  const cdp = await page.context().newCDPSession(page);
  const touch = (
    type: "touchStart" | "touchMove" | "touchEnd",
    x: number,
    y: number,
  ) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: type === "touchEnd" ? [] : [{ x, y }],
    });
  await touch("touchStart", a.x, a.y);
  for (let i = 1; i <= 14; i++)
    await touch(
      "touchMove",
      a.x + ((b.x - a.x) * i) / 14,
      a.y + ((b.y - a.y) * i) / 14,
    );
  await touch("touchEnd", b.x, b.y);
  await expect.poll(() => order(page)).not.toEqual(before);
});

test("keyboard: Enter mirrors and Space mirrors the focused bird", async ({
  page,
}) => {
  await open(page);
  await animal(page, ONE).focus();
  await page.keyboard.press("Enter");
  await expect(animal(page, ONE)).toHaveAttribute("data-mirrored", "true");
  await page.keyboard.press("Space");
  await expect(animal(page, ONE)).toHaveAttribute("data-mirrored", "false");
});

test("keyboard: arrow keys move a bird through the order and keep focus on it", async ({
  page,
}) => {
  await open(page);
  const before = await order(page);
  await animal(page, ONE).focus();
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(async () => (await order(page)).indexOf(ONE))
    .toBe(before.indexOf(ONE) + 1);
  await expect(animal(page, ONE)).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect.poll(() => order(page)).toEqual(before);
});

test("keyboard: moving past the ends does nothing", async ({ page }) => {
  await open(page);
  const before = await order(page);
  await animal(page, before[0]).focus();
  await page.keyboard.press("ArrowLeft");
  expect(await order(page)).toEqual(before);
});

test("each bird is a button with a name and instructions for screen readers", async ({
  page,
}) => {
  await open(page);
  const label = await animal(page, ONE).getAttribute("aria-label");
  expect(label).toContain("Eurasian Eagle-Owl");
  expect(label).toMatch(/Enter mirrors/);
  await expect(animal(page, ONE)).toHaveAttribute("role", "button");
});

test("motion: birds glide in 200 ms, and reduced motion turns it off", async ({
  page,
}) => {
  await open(page);
  const duration = () =>
    animal(page, ONE).evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(await duration()).toContain("0.2s");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await duration()).toMatch(/^0s(, 0s)*$/);
});

test("removing a bird from the tray shows a message with Undo", async ({
  page,
}) => {
  await open(page);
  await page
    .getByRole("button", { name: "Remove Mute Swan from poster" })
    .click();
  await expect(animal(page, "cygnus-olor")).toHaveCount(0);
  const toast = page.locator("[data-sonner-toast]");
  await expect(toast).toContainText("Mute Swan removed");
  await toast.getByRole("button", { name: "Undo" }).click();
  await expect(animal(page, "cygnus-olor")).toHaveCount(1);
});

test("clearing the poster shows a message with Undo that brings everything back", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: "Clear poster" }).click();
  await expect(page.locator("[data-animal]")).toHaveCount(0);
  const toast = page.locator("[data-sonner-toast]");
  await expect(toast).toContainText("Poster cleared");
  await toast.getByRole("button", { name: "Undo" }).click();
  await expect(page.locator("[data-animal]")).toHaveCount(12);
});

test("replacing the poster with a preset says so", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Owls of the world" }).click();
  await expect(page.locator("[data-sonner-toast]")).toContainText(
    "Owls of the world added",
  );
});

test("adding and removing with the cards does not nag with messages", async ({
  page,
}) => {
  await open(page);
  await page
    .getByRole("option", { name: "Western Barn Owl", exact: true })
    .click();
  await page
    .getByRole("option", { name: "Western Barn Owl", exact: true })
    .click();
  await expect(page.locator("[data-sonner-toast]")).toHaveCount(0);
});

test("a plain label shows the bird name when a tray picture gets keyboard focus", async ({
  page,
}) => {
  await open(page);
  const button = page.getByRole("button", {
    name: "Remove Mute Swan from poster",
  });
  const label = button.locator("[data-tray-label]");
  await expect(label).toHaveCSS("opacity", "0");
  await button.focus();
  await expect(label).toHaveText("Mute Swan");
  await expect(label).toHaveCSS("opacity", "1");
});

test("an empty poster says what to do and offers two ways to start", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: "Clear poster" }).click();
  const empty = page.locator("[data-empty-poster]");
  await expect(
    empty.getByRole("heading", { name: "Your poster is empty" }),
  ).toBeVisible();
  await expect(
    empty.getByRole("button", { name: "Owls of the world" }),
  ).toBeVisible();
  await empty.getByRole("button", { name: "Surprise mix" }).click();
  await expect(empty).toHaveCount(0);
  const n = await page.locator("[data-animal]").count();
  expect(n).toBeGreaterThanOrEqual(12);
  expect(n).toBeLessThanOrEqual(16);
});

test("a search with no result explains and suggests words to try", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("searchbox", { name: "Search birds" }).fill("zzzz");
  const miss = page.locator("[data-search-miss]");
  await expect(miss).toContainText("No bird matches");
  await expect(miss).toContainText("zzzz");
  await miss.getByRole("button", { name: "kestrel" }).click();
  await expect(
    page.locator("p[role=status]").filter({ hasText: "found" }),
  ).toContainText("3 found");
  await expect(miss).toHaveCount(0);
});
