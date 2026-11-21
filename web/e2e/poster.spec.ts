import { expect, test, type Page } from "@playwright/test";

type Rect = { x: number; y: number; w: number; h: number };

/** Measure every animal piece in the browser and check it against the poster frame. */
async function measure(page: Page) {
  return page.evaluate(() => {
    const rect = (el: Element): Rect => {
      const r = el.getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    };
    const poster = document.querySelector("[data-poster]")!;
    const P = rect(poster);
    const pieces = [
      ...document.querySelectorAll("[data-art], [data-label], [data-number]"),
    ].map((el) => ({
      kind:
        (el as HTMLElement).dataset.art !== undefined
          ? "art"
          : (el as HTMLElement).dataset.label !== undefined
            ? "label"
            : "number",
      id: el.closest("[data-animal]")!.getAttribute("data-animal")!,
      ...rect(el),
    }));
    const title = rect(document.querySelector("[data-title]")!);
    const legend = document.querySelector("[data-legend]");
    return {
      P,
      pieces,
      title,
      legend: legend ? rect(legend) : null,
      count: document.querySelectorAll("[data-animal]").length,
    };
  });
}

const inside = (a: Rect, b: Rect, tol = 0.75) =>
  a.x >= b.x - tol &&
  a.y >= b.y - tol &&
  a.x + a.w <= b.x + b.w + tol &&
  a.y + a.h <= b.y + b.h + tol;
const overlaps = (a: Rect, b: Rect) =>
  a.x < b.x + b.w - 0.5 &&
  b.x < a.x + a.w - 0.5 &&
  a.y < b.y + b.h - 0.5 &&
  b.y < a.y + a.h - 0.5;

const LAYOUTS = ["scatter", "grid", "centerpiece"];
const LABELS = ["names", "legend", "none"];

for (const n of [1, 12, 118, 150]) {
  for (const layout of LAYOUTS) {
    for (const labels of LABELS) {
      test(`${n} animals, ${layout}, ${labels}: everything stays inside the poster`, async ({
        page,
      }) => {
        await page.goto(
          `/design/poster?n=${n}&layout=${layout}&labels=${labels}`,
        );
        await page.locator("[data-animal]").first().waitFor();
        const m = await measure(page);
        expect(m.count).toBe(n);
        const safe: Rect = {
          x: m.P.x + m.P.w * 0.04,
          y: m.P.y + m.P.w * 0.04,
          w: m.P.w * 0.92,
          h: m.P.h - m.P.w * 0.08,
        };
        const bad: string[] = [];
        for (const p of m.pieces) {
          if (!inside(p, m.P)) bad.push(`${p.id} ${p.kind} leaves the poster`);
          else if (!inside(p, safe))
            bad.push(`${p.id} ${p.kind} leaves the safe frame`);
          if (overlaps(p, m.title))
            bad.push(`${p.id} ${p.kind} touches the title`);
          if (m.legend && overlaps(p, m.legend))
            bad.push(`${p.id} ${p.kind} touches the legend`);
        }
        expect(bad.slice(0, 5)).toEqual([]);
      });
    }
  }
}

test("landscape and A series posters keep everything inside too", async ({
  page,
}) => {
  for (const [size, orientation] of [
    ["a", "portrait"],
    ["4:5", "landscape"],
    ["a", "landscape"],
  ]) {
    await page.goto(
      `/design/poster?n=40&layout=scatter&labels=legend&size=${size}&orientation=${orientation}`,
    );
    await page.locator("[data-animal]").first().waitFor();
    const m = await measure(page);
    for (const p of m.pieces)
      expect(inside(p, m.P), `${size} ${orientation} ${p.id}`).toBe(true);
    if (m.legend)
      for (const p of m.pieces)
        expect(
          overlaps(p, m.legend),
          `${size} ${orientation} ${p.id} legend`,
        ).toBe(false);
  }
});

test("Hebrew poster renders right to left with Hebrew names and stays inside", async ({
  page,
}) => {
  await page.goto("/design/poster?n=12&layout=grid&labels=names&lang=he");
  await page.locator("[data-animal]").first().waitFor();
  const poster = page.locator("[data-poster]");
  await expect(poster).toHaveAttribute("dir", "rtl");
  await expect(poster).toHaveAttribute("lang", "he");
  await expect(page.getByText("תנשמת לבנה")).toBeVisible();
  const m = await measure(page);
  for (const p of m.pieces) expect(inside(p, m.P), p.id).toBe(true);
});

test("Hebrew legend reads right to left", async ({ page }) => {
  await page.goto("/design/poster?n=12&layout=grid&labels=legend&lang=he");
  const first = await page.locator("[data-legend] li").nth(0).boundingBox();
  const second = await page.locator("[data-legend] li").nth(1).boundingBox();
  expect(first!.x).toBeGreaterThan(second!.x);
});

test("dark backgrounds switch the ink to light", async ({ page }) => {
  await page.goto("/design/poster?n=6&bg=forest");
  const color = await page
    .locator("[data-title]")
    .evaluate((el) => getComputedStyle(el).color);
  const [r, g, b] = color.match(/\d+/g)!.map(Number);
  expect((r + g + b) / 3).toBeGreaterThan(180);
  await page.goto("/design/poster?n=6&bg=cream");
  const dark = await page
    .locator("[data-title]")
    .evaluate((el) => getComputedStyle(el).color);
  const [r2, g2, b2] = dark.match(/\d+/g)!.map(Number);
  expect((r2 + g2 + b2) / 3).toBeLessThan(80);
});

test("every bird has alt text from its name", async ({ page }) => {
  await page.goto("/design/poster?n=12&labels=none");
  const alts = await page
    .locator("[data-art] img")
    .evaluateAll((els) => els.map((e) => (e as HTMLImageElement).alt));
  expect(alts).toHaveLength(12);
  expect(alts.every((a) => a.length > 2)).toBe(true);
});
