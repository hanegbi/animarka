import type { Page } from "@playwright/test";
import { openTab, pickPreset } from "./helpers";
import { expect, test } from "./test";

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

const tap = (page: Page, id: string) =>
  animal(page, id).locator("[data-art]").click();
const undoHeader = (page: Page) =>
  page
    .getByRole("toolbar", { name: "Poster actions" })
    .getByRole("button", { name: "Undo" });

test("tapping a bird mirrors it, and tapping again turns it back", async ({
  page,
}) => {
  await open(page);
  await tap(page, ONE);
  await expect(animal(page, ONE)).toHaveAttribute("data-mirrored", "true");
  await tap(page, ONE);
  await expect(animal(page, ONE)).toHaveAttribute("data-mirrored", "false");
  // No bar and no Remove button any more.
  await expect(page.locator("[data-bird-bar]")).toHaveCount(0);
  await expect(page.locator("[data-animal]")).toHaveCount(12);
});

test("the mirror plays a short hop and turn on the art", async ({ page }) => {
  await open(page);
  await tap(page, ONE);
  const anim = await animal(page, ONE)
    .locator("[data-art]")
    .evaluate((el) =>
      el
        .getAnimations()
        .map((a) => (a.effect as KeyframeEffect).getTiming().duration),
    );
  expect(anim).toEqual([300]);
});

test("a mirror is one undo step", async ({ page }) => {
  await open(page);
  await tap(page, ONE);
  await expect(animal(page, ONE)).toHaveAttribute("data-mirrored", "true");
  await undoHeader(page).click();
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

test("while dragging over a bird, that bird slides to the dragged bird's place", async ({
  page,
}) => {
  await open(page);
  const a = await center(page, ONE);
  const b = await center(page, TWO);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(a.x + 14, a.y + 4, { steps: 3 });
  await page.mouse.move(b.x, b.y, { steps: 12 });
  const target = animal(page, TWO);
  await expect(target).toHaveAttribute("data-drop-target", "true");
  await expect
    .poll(async () => {
      const t = (await target.boundingBox())!;
      return Math.abs(t.x + t.width / 2 - a.x) < 40;
    })
    .toBe(true);
  await page.mouse.up();
  await expect(target).not.toHaveAttribute("data-drop-target", "true");
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

test("keyboard: Enter or Space mirrors the focused bird", async ({ page }) => {
  await open(page);
  await animal(page, ONE).focus();
  await page.keyboard.press("Enter");
  await expect(animal(page, ONE)).toHaveAttribute("data-mirrored", "true");
  await page.keyboard.press("Space");
  await expect(animal(page, ONE)).toHaveAttribute("data-mirrored", "false");
  await expect(animal(page, ONE)).toBeFocused();
});

test("keyboard: Delete removes the focused bird", async ({ page }) => {
  await open(page);
  await animal(page, ONE).focus();
  await page.keyboard.press("Delete");
  await expect(animal(page, ONE)).toHaveCount(0);
  // No pop-up on remove. Undo in the header brings the bird back.
  await expect(page.locator("[data-sonner-toast]")).toHaveCount(0);
  await undoHeader(page).click();
  await expect(animal(page, ONE)).toHaveCount(1);
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
  expect(label).toMatch(/Press Enter to mirror it/);
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

test("removing a bird from the strip shows no pop-up, and header Undo brings it back", async ({
  page,
}) => {
  await open(page);
  await page
    .getByRole("button", { name: "Remove Mute Swan from poster" })
    .click();
  await expect(animal(page, "cygnus-olor")).toHaveCount(0);
  await expect(page.locator("[data-sonner-toast]")).toHaveCount(0);
  await undoHeader(page).click();
  await expect(animal(page, "cygnus-olor")).toHaveCount(1);
});

test("Direction: face right turns every bird, face left turns them back, a single tap makes a mix", async ({
  page,
}) => {
  await open(page);
  await openTab(page, "Layout");
  const group = page.getByRole("radiogroup", { name: "Direction" });
  await group.getByRole("radio", { name: "Face right" }).click();
  // The eagle-owl's art looks left, so facing right means it is now mirrored; so is every other left-drawn bird.
  await expect(animal(page, ONE)).toHaveAttribute("data-mirrored", "true");
  await expect(animal(page, TWO)).toHaveAttribute("data-mirrored", "true");
  await expect(
    group.getByRole("radio", { name: "Face right" }),
  ).toHaveAttribute("aria-checked", "true");
  await group.getByRole("radio", { name: "Face left" }).click();
  await expect(group.getByRole("radio", { name: "Face left" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await tap(page, ONE);
  await expect(group.getByRole("radio", { name: "Face left" })).toHaveAttribute(
    "aria-checked",
    "false",
  );
  await expect(
    group.getByRole("radio", { name: "Face right" }),
  ).toHaveAttribute("aria-checked", "false");
  await expect(page.getByText("Mixed")).toBeVisible();
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
  await pickPreset(page, "Owls of the world");
  await expect(page.locator("[data-sonner-toast]")).toContainText(
    "Owls of the world added",
  );
});

test("adding and removing with the cards does not nag with messages", async ({
  page,
}) => {
  await open(page);
  await openTab(page, "Birds");
  await page.getByRole("searchbox", { name: "Search birds" }).fill("barn owl");
  const owl = page.getByRole("option", {
    name: "Western Barn Owl",
    exact: true,
  });
  await owl.click();
  await owl.click();
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
  catalog,
}) => {
  await open(page);
  await page.getByRole("button", { name: "Clear poster" }).click();
  const empty = page.locator("[data-empty-poster]");
  await expect(
    empty.getByRole("heading", { name: "Your poster is empty" }),
  ).toBeVisible();
  await expect(
    empty.getByRole("button", { name: catalog.presets[0].title }),
  ).toBeVisible();
  await empty.getByRole("button", { name: "Surprise mix" }).click();
  await expect(empty).toHaveCount(0);
  const n = await page.locator("[data-animal]").count();
  expect(n).toBeGreaterThanOrEqual(12);
  expect(n).toBeLessThanOrEqual(16);
});

test("a search with no result explains and suggests words to try", async ({
  page,
  catalog,
}) => {
  await open(page);
  await page.getByRole("searchbox", { name: "Search birds" }).fill("zzzz");
  const miss = page.locator("[data-search-miss]");
  await expect(miss).toContainText("No bird matches");
  await expect(miss).toContainText("zzzz");
  await miss.getByRole("button", { name: "kestrel" }).click();
  await expect(
    page.locator("p[role=status]").filter({ hasText: "found" }),
  ).toContainText(`${catalog.search("kestrel").length} found`);
  await expect(miss).toHaveCount(0);
});

test("centerpiece: dropping a bird on the big centre bird gives it the big spot", async ({
  page,
}) => {
  await open(page);
  await openTab(page, "Layout");
  await page
    .getByRole("radiogroup", { name: "Layout" })
    .getByRole("radio", { name: "Centerpiece" })
    .click();
  const area = async (id: string) => {
    const b = (await animal(page, id).locator("[data-art]").boundingBox())!;
    return b.width * b.height;
  };
  const ids = await order(page);
  const areas = await Promise.all(ids.map(area));
  const big = ids[areas.indexOf(Math.max(...areas))];
  const small = ids.find((id) => id !== big)!;
  await drag(page, small, big);
  const biggest = async () => {
    const now = await Promise.all(ids.map(area));
    return ids[now.indexOf(Math.max(...now))];
  };
  await expect.poll(biggest).toBe(small);
});

test("the picker panel never scrolls sideways", async ({ page }) => {
  await open(page);
  await openTab(page, "Birds");
  const wide = await page.evaluate(() =>
    [...document.querySelectorAll("aside, #sheet, aside *")]
      .filter(
        (e) =>
          e.scrollWidth > e.clientWidth + 1 &&
          getComputedStyle(e).overflowX !== "hidden" &&
          getComputedStyle(e).overflowX !== "visible",
      )
      .map((e) => e.tagName + "." + String(e.className).slice(0, 40)),
  );
  expect(wide).toEqual([]);
});
