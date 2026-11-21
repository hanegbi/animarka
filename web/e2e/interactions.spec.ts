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

const bar = (page: Page) => page.locator("[data-bird-bar]");
const tap = (page: Page, id: string) =>
  animal(page, id).locator("[data-art]").click();
const undoHeader = (page: Page) =>
  page
    .getByRole("toolbar", { name: "Poster actions" })
    .getByRole("button", { name: "Undo" });

test("tapping a bird shows a Mirror button and a Remove button, and mirrors nothing yet", async ({
  page,
}) => {
  await open(page);
  await expect(bar(page)).toHaveCount(0);
  await tap(page, ONE);
  await expect(bar(page)).toBeVisible();
  await expect(bar(page)).toHaveAttribute(
    "aria-label",
    "Actions for Eurasian Eagle-Owl",
  );
  await expect(bar(page).getByRole("button", { name: "Mirror" })).toBeVisible();
  await expect(bar(page).getByRole("button", { name: "Remove" })).toBeVisible();
  await expect(animal(page, ONE)).toHaveAttribute("data-selected", "true");
  await expect(animal(page, ONE)).toHaveAttribute("data-mirrored", "false");
});

test("the Mirror button flips the bird, and again flips it back", async ({
  page,
}) => {
  await open(page);
  await tap(page, ONE);
  await bar(page).getByRole("button", { name: "Mirror" }).click();
  await expect(animal(page, ONE)).toHaveAttribute("data-mirrored", "true");
  await bar(page).getByRole("button", { name: "Mirror" }).click();
  await expect(animal(page, ONE)).toHaveAttribute("data-mirrored", "false");
  await expect(bar(page)).toBeVisible();
});

test("a mirror is one undo step", async ({ page }) => {
  await open(page);
  await tap(page, ONE);
  await bar(page).getByRole("button", { name: "Mirror" }).click();
  await expect(animal(page, ONE)).toHaveAttribute("data-mirrored", "true");
  await undoHeader(page).click();
  await expect(animal(page, ONE)).toHaveAttribute("data-mirrored", "false");
});

test("the Remove button takes the bird off the poster and offers Undo", async ({
  page,
}) => {
  await open(page);
  await tap(page, ONE);
  await bar(page).getByRole("button", { name: "Remove" }).click();
  await expect(animal(page, ONE)).toHaveCount(0);
  await expect(bar(page)).toHaveCount(0);
  await expect(page.locator("[data-animal]")).toHaveCount(11);
  const toast = page.locator("[data-sonner-toast]");
  await expect(toast).toContainText("Eurasian Eagle-Owl removed");
  await toast.getByRole("button", { name: "Undo" }).click();
  await expect(animal(page, ONE)).toHaveCount(1);
  await expect(page.locator("[data-animal]")).toHaveCount(12);
});

test("tapping the same bird again, tapping elsewhere or pressing Escape puts the buttons away", async ({
  page,
}) => {
  await open(page);
  await tap(page, ONE);
  await expect(bar(page)).toBeVisible();
  await tap(page, ONE);
  await expect(bar(page)).toHaveCount(0);
  await tap(page, ONE);
  await expect(bar(page)).toBeVisible();
  const poster = (await page.locator("[data-poster]").boundingBox())!;
  await page.mouse.click(poster.x + 3, poster.y + poster.height - 3);
  await expect(bar(page)).toHaveCount(0);
  await tap(page, ONE);
  await expect(bar(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(bar(page)).toHaveCount(0);
});

test("tapping another bird moves the buttons to that bird", async ({
  page,
}) => {
  await open(page);
  await tap(page, ONE);
  await tap(page, TWO);
  await expect(bar(page)).toHaveAttribute(
    "aria-label",
    "Actions for Common Kingfisher",
  );
  await expect(animal(page, ONE)).not.toHaveAttribute("data-selected", "true");
});

test("a tiny wobble while tapping is still a tap", async ({ page }) => {
  await open(page);
  const c = await center(page, ONE);
  await page.mouse.move(c.x, c.y);
  await page.mouse.down();
  await page.mouse.move(c.x + 3, c.y + 2);
  await page.mouse.up();
  await expect(bar(page)).toBeVisible();
});

test("the bar sits next to its bird, stays inside the window, and never covers the bird", async ({
  page,
}) => {
  await open(page);
  const v = page.viewportSize()!;
  for (const id of [ONE, "cygnus-olor", "hirundo-rustica"]) {
    await tap(page, id);
    await expect(bar(page)).toBeVisible();
    await page.waitForTimeout(150);
    const b = (await bar(page).boundingBox())!;
    const art = (await animal(page, id).locator("[data-art]").boundingBox())!;
    expect(b.x).toBeGreaterThanOrEqual(0);
    expect(b.y).toBeGreaterThanOrEqual(0);
    expect(b.x + b.width).toBeLessThanOrEqual(v.width);
    expect(b.y + b.height).toBeLessThanOrEqual(v.height);
    const overlap =
      b.x < art.x + art.width &&
      art.x < b.x + b.width &&
      b.y < art.y + art.height &&
      art.y < b.y + b.height;
    expect(overlap, `${id} bar covers the bird`).toBe(false);
    const title = (await page.locator("[data-poster-title]").boundingBox())!;
    const coversTitle =
      b.x < title.x + title.width &&
      title.x < b.x + b.width &&
      b.y < title.y + title.height &&
      title.y < b.y + b.height;
    expect(coversTitle, `${id} bar covers the poster title`).toBe(false);
    await page.keyboard.press("Escape");
  }
});

test("the Mirror and Remove buttons are big enough to touch", async ({
  page,
}) => {
  await open(page);
  await tap(page, ONE);
  for (const name of ["Mirror", "Remove"]) {
    const b = (await bar(page).getByRole("button", { name }).boundingBox())!;
    expect(b.width, name).toBeGreaterThanOrEqual(43.5);
    expect(b.height, name).toBeGreaterThanOrEqual(43.5);
  }
});

test("starting a drag puts the buttons away", async ({ page }) => {
  await open(page);
  await tap(page, ONE);
  await expect(bar(page)).toBeVisible();
  await drag(page, ONE, TWO);
  await expect(bar(page)).toHaveCount(0);
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
  // dnd-kit swallows the first click right after a drop. A person never clicks that fast, so pause like one.
  await page.waitForTimeout(150);
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

test("keyboard: Enter shows the buttons and puts focus on Mirror, and Escape returns to the bird", async ({
  page,
}) => {
  await open(page);
  await animal(page, ONE).focus();
  await page.keyboard.press("Enter");
  await expect(bar(page)).toBeVisible();
  const mirror = bar(page).getByRole("button", { name: "Mirror" });
  await expect(mirror).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(animal(page, ONE)).toHaveAttribute("data-mirrored", "true");
  await page.keyboard.press("Tab");
  await expect(bar(page).getByRole("button", { name: "Remove" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(bar(page)).toHaveCount(0);
  await expect(animal(page, ONE)).toBeFocused();
});

test("keyboard: Space on a bird also shows the buttons, and Remove works from the keyboard", async ({
  page,
}) => {
  await open(page);
  await animal(page, ONE).focus();
  await page.keyboard.press("Space");
  await expect(bar(page)).toBeVisible();
  await expect(bar(page).getByRole("button", { name: "Mirror" })).toBeFocused();
  // Space must not also press Mirror on its way up.
  await expect(animal(page, ONE)).toHaveAttribute("data-mirrored", "false");
  await page.keyboard.press("Tab");
  await expect(bar(page).getByRole("button", { name: "Remove" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(animal(page, ONE)).toHaveCount(0);
});

test("keyboard: Delete removes the focused bird", async ({ page }) => {
  await open(page);
  await animal(page, ONE).focus();
  await page.keyboard.press("Delete");
  await expect(animal(page, ONE)).toHaveCount(0);
  await expect(page.locator("[data-sonner-toast]")).toContainText("removed");
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
  expect(label).toMatch(/Enter shows the Mirror and Remove buttons/);
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

test("the bird buttons are icons only, and their name shows on keyboard focus", async ({
  page,
}) => {
  await open(page);
  await page.locator('[data-animal="bubo-bubo"]').focus();
  await page.keyboard.press("Enter");
  const bar = page.locator("[data-bird-bar]");
  for (const name of ["Mirror", "Remove"]) {
    const button = bar.getByRole("button", { name });
    const label = button.locator("span[aria-hidden]");
    await expect(button.locator("svg")).toHaveCount(1);
    await expect(label).toHaveText(name);
    if (name === "Remove") {
      await expect(label).toHaveCSS("opacity", "0");
      await page.keyboard.press("Tab");
    }
    await expect(button).toBeFocused();
    await expect(label).toHaveCSS("opacity", "1");
  }
});
