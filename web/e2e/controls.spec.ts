import { expect, test, type Page } from "@playwright/test";
import { GROUP_TAB, openTab, type Tab } from "./helpers";

type Box = { x: number; y: number; w: number; h: number };

async function open(page: Page) {
  await page.goto("/");
  await expect(page.locator("[data-poster]")).toBeVisible();
  await expect(page.locator("[data-animal]")).toHaveCount(12);
}

/** Each bird's art box, relative to the poster, and whether its picture is flipped, keyed by id. */
async function snapshot(page: Page) {
  return page.evaluate(() => {
    const out: Record<
      string,
      { box: { x: number; y: number; w: number; h: number }; mirrored: string }
    > = {};
    const poster = document
      .querySelector("[data-poster]")!
      .getBoundingClientRect();
    document.querySelectorAll("[data-animal]").forEach((el) => {
      const art = el.querySelector("[data-art]")!.getBoundingClientRect();
      out[el.getAttribute("data-animal")!] = {
        box: {
          x: (art.left - poster.left) / poster.width,
          y: (art.top - poster.top) / poster.width,
          w: art.width / poster.width,
          h: art.height / poster.width,
        },
        mirrored: el.getAttribute("data-mirrored")!,
      };
    });
    return out;
  });
}

/** Boxes are in poster widths, so a poster that got a little smaller still compares equal. */
const near = (a: Box, b: Box, tol = 0.012) =>
  Math.abs(a.x - b.x) <= tol &&
  Math.abs(a.y - b.y) <= tol &&
  Math.abs(a.w - b.w) <= tol &&
  Math.abs(a.h - b.h) <= tol;

/** Opens the phone tab that holds the group, then finds the radio. */
const radio = async (page: Page, group: string, name: string) => {
  await openTab(page, GROUP_TAB[group]);
  return page
    .getByRole("radiogroup", { name: group })
    .getByRole("radio", { name });
};

const undoButton = (page: Page) =>
  page
    .getByRole("toolbar", { name: "Poster actions" })
    .getByRole("button", { name: "Undo" });
const redoButton = (page: Page) =>
  page
    .getByRole("toolbar", { name: "Poster actions" })
    .getByRole("button", { name: "Redo" });

test("style switch keeps every bird in the same place and size, and looking the same way", async ({
  page,
}) => {
  await open(page);
  await openTab(page, "Style");
  await page.waitForTimeout(400); // let the 200 ms reflow settle
  const before = await snapshot(page);
  await (await radio(page, "Design", "Woodblock")).click();
  await expect(await radio(page, "Design", "Woodblock")).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await page.waitForTimeout(400);
  const after = await snapshot(page);

  expect(Object.keys(after)).toEqual(Object.keys(before));
  for (const id of Object.keys(before))
    expect(near(before[id].box, after[id].box), `${id} moved`).toBe(true);

  // Field guide art all looks left, so nothing is flipped there. In woodblock a bird that
  // looks right is flipped to look left, and one that already looks left is not.
  expect(before["falco-peregrinus"].mirrored).toBe("false");
  expect(after["falco-peregrinus"].mirrored).toBe("true");
  expect(before["tyto-alba"].mirrored).toBe("false");
  expect(after["tyto-alba"].mirrored).toBe("false");
});

test("layout switch keeps the same birds, order and mirrors, but moves them", async ({
  page,
}) => {
  await open(page);
  await openTab(page, "Layout");
  await (await radio(page, "Layout", "Grid")).click();
  await page.waitForTimeout(400);
  const grid = await snapshot(page);
  await (await radio(page, "Layout", "Centerpiece")).click();
  await page.waitForTimeout(400);
  const center = await snapshot(page);
  expect(Object.keys(center)).toEqual(Object.keys(grid));
  for (const id of Object.keys(grid))
    expect(center[id].mirrored).toBe(grid[id].mirrored);
  expect(
    Object.keys(grid).some((id) => !near(grid[id].box, center[id].box, 0.02)),
  ).toBe(true);
});

test("the layout highlight slides to the chosen layout", async ({ page }) => {
  await open(page);
  await openTab(page, "Layout");
  const hl = page.locator("[data-layout-highlight]");
  const x0 = (await hl.boundingBox())!.x;
  await (await radio(page, "Layout", "Centerpiece")).click();
  await page.waitForTimeout(400);
  expect((await hl.boundingBox())!.x).toBeGreaterThan(x0 + 40);
});

test("layout keys: arrow keys change the layout", async ({ page }) => {
  await open(page);
  await (await radio(page, "Layout", "Scattered")).focus();
  await page.keyboard.press("ArrowRight");
  const grid = await radio(page, "Layout", "Grid");
  await expect(grid).toHaveAttribute("aria-checked", "true");
  await expect(grid).toBeFocused();
});

test("label modes: names, numbers with a legend, and no text", async ({
  page,
}) => {
  await open(page);
  await expect(page.locator("[data-label]")).toHaveCount(12);
  await (await radio(page, "Labels", "Numbers and legend")).click();
  await expect(page.locator("[data-legend]")).toBeVisible();
  await expect(page.locator("[data-number]")).toHaveCount(12);
  await expect(page.locator("[data-label]")).toHaveCount(0);
  await (await radio(page, "Labels", "No text")).click();
  await expect(page.locator("[data-legend]")).toHaveCount(0);
  await expect(page.locator("[data-label]")).toHaveCount(0);
  await expect(page.locator("[data-number]")).toHaveCount(0);
});

test("background: swatch changes the poster and dark backgrounds switch the ink", async ({
  page,
}) => {
  await open(page);
  const poster = page.locator("[data-poster]");
  await (await radio(page, "Background", "Forest")).click();
  await expect(page.locator("[data-background-name]")).toHaveText("Forest");
  await expect(poster).toHaveAttribute("data-dark", "true");
  const ink = await page
    .locator("[data-poster-title]")
    .evaluate((el) => getComputedStyle(el).color);
  const [r, g, b] = ink.match(/\d+/g)!.map(Number);
  expect((r + g + b) / 3).toBeGreaterThan(180);
  await (await radio(page, "Background", "Sage")).click();
  await expect(poster).toHaveAttribute("data-dark", "false");
});

test("size buttons change the poster shape, and there is no landscape control", async ({
  page,
}) => {
  await open(page);
  const ratio = async () => {
    const b = (await page.locator("[data-poster]").boundingBox())!;
    return b.width / b.height;
  };
  await openTab(page, "Layout");
  expect(await ratio()).toBeCloseTo(0.75, 2);
  await (await radio(page, "Poster size", "2:3")).click();
  await expect.poll(ratio).toBeCloseTo(2 / 3, 2);
  await (await radio(page, "Poster size", "4:5")).click();
  await expect.poll(ratio).toBeCloseTo(0.8, 2);
  await (await radio(page, "Poster size", "A series")).click();
  await expect.poll(ratio).toBeCloseTo(1 / Math.SQRT2, 2);
  await expect(page.getByText(/landscape/i)).toHaveCount(0);
});

test("undo and redo step back through changes, with buttons and with Ctrl Z", async ({
  page,
}) => {
  await open(page);
  await (await radio(page, "Layout", "Grid")).click();
  await (await radio(page, "Poster size", "2:3")).click();
  await undoButton(page).click();
  await expect(await radio(page, "Poster size", "3:4")).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(await radio(page, "Layout", "Grid")).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await redoButton(page).click();
  await expect(await radio(page, "Poster size", "2:3")).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await page.locator("body").press("Control+z");
  await expect(await radio(page, "Poster size", "3:4")).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await page.locator("body").press("Control+Shift+z");
  await expect(await radio(page, "Poster size", "2:3")).toHaveAttribute(
    "aria-checked",
    "true",
  );
});

test("undo is disabled when there is nothing to undo", async ({ page }) => {
  await open(page);
  await expect(undoButton(page)).toBeDisabled();
  await expect(redoButton(page)).toBeDisabled();
});

test("shuffle rearranges the birds and keeps the same ones", async ({
  page,
}) => {
  await open(page);
  const ids = async () =>
    (await page
      .locator("[data-animal]")
      .evaluateAll((els) =>
        els.map((e) => e.getAttribute("data-animal")),
      )) as string[];
  const before = await ids();
  await openTab(page, "Layout");
  await page.getByRole("button", { name: "Shuffle layout" }).click();
  const after = await ids();
  expect([...after].sort()).toEqual([...before].sort());
  expect(after).not.toEqual(before);
});

test("editing the title is one undo step and stops following the selection", async ({
  page,
}) => {
  await open(page);
  const title = page.locator("[data-poster-title]");
  await title.fill("My garden");
  await expect(title).toHaveValue("My garden");
  await openTab(page, "Birds");
  await page
    .getByRole("button", { name: "Remove Mute Swan from poster" })
    .click();
  await expect(title).toHaveValue("My garden");
});

test("controls are big enough to touch: at least 44 px", async ({ page }) => {
  await open(page);
  const tabs: Tab[] = ["Birds", "Layout", "Style"];
  const small: string[] = [];
  for (const tab of tabs) {
    await openTab(page, tab);
    for (const sel of ["button:visible", "[role=radio]:visible"]) {
      const boxes = await page.locator(sel).evaluateAll((els) =>
        els.map((e) => {
          const r = e.getBoundingClientRect();
          return {
            name: (e.getAttribute("aria-label") || e.textContent || "")
              .trim()
              .slice(0, 20),
            w: r.width,
            h: r.height,
          };
        }),
      );
      for (const b of boxes)
        if (b.w < 43.5 || b.h < 43.5)
          small.push(`${tab}: ${b.name} ${Math.round(b.w)}x${Math.round(b.h)}`);
    }
  }
  expect([...new Set(small)]).toEqual([]);
});
