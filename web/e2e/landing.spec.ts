import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./test";

test.describe("landing page", () => {
  test("the hero says what it is and both buttons lead into the tool", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Every bird you love, on one poster.",
      }),
    ).toBeVisible();
    await expect(page.locator("[data-hero-bird]")).toHaveCount(3);
    await expect(page.locator("#hero-roller")).toBeVisible();
    await page.getByRole("link", { name: "Start from a set" }).click();
    await expect(page).toHaveURL(/#sets$/);
    await expect(
      page.getByRole("list", { name: "Ready sets" }),
    ).toBeInViewport();
    await page
      .getByRole("main")
      .getByRole("link", { name: "Make your poster" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/make$/);
    await expect(page.locator("[data-poster] [data-animal]")).toHaveCount(12);
  });

  test("the hero shows three blue birds, named in the plate caption (L3)", async ({
    page,
  }) => {
    await page.goto("/");
    for (const id of ["hero-roller", "hero-jay", "hero-kingfisher"])
      await expect(page.locator(`#${id}`)).toBeVisible();
    const caption = page.locator("[data-hero] p").last();
    await expect(caption).toContainText("European roller");
    await expect(caption.locator("i")).toHaveText([
      "Coracias garrulus",
      "Cyanocitta cristata",
      "Alcedo atthis",
    ]);
  });

  test("no bill touches a letter of the headline, and on phones no bird does (L1, L2)", async ({
    page,
  }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const r = await page.evaluate(() => {
      const h = document.getElementById("hero-title")!;
      const words: { w: string; l: number; r: number; t: number; b: number }[] =
        [];
      const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const t = walker.currentNode as Text;
        for (const m of t.textContent!.matchAll(/\S+/g)) {
          const rg = document.createRange();
          rg.setStart(t, m.index!);
          rg.setEnd(t, m.index! + m[0].length);
          // The ink of the letters, a little inside the line box.
          for (const b of rg.getClientRects())
            words.push({
              w: m[0],
              l: b.left,
              r: b.right,
              t: b.top + b.height * 0.18,
              b: b.bottom - b.height * 0.12,
            });
        }
      }
      const hits: string[] = [];
      const touch: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>(
        "[data-hero-bird]",
      )) {
        const b = el.getBoundingClientRect();
        const [fx, fy] = el.dataset.bill!.split(",").map(Number);
        const x = b.left + fx * b.width;
        const y = b.top + fy * b.height;
        for (const w of words) {
          const dx = Math.max(w.l - x, 0, x - w.r);
          const dy = Math.max(w.t - y, 0, y - w.b);
          if (Math.hypot(dx, dy) < 8) hits.push(`${el.id} bill on ${w.w}`);
          if (
            innerWidth < 700 &&
            b.left < w.r &&
            b.right > w.l &&
            b.top < w.b &&
            b.bottom > w.t
          )
            touch.push(`${el.id} on ${w.w}`);
        }
      }
      return { hits, touch };
    });
    expect(r.hits).toEqual([]);
    expect(r.touch).toEqual([]);
    // The main button is on the first screen without scrolling.
    await expect(
      page
        .getByRole("main")
        .getByRole("link", { name: "Make your poster" })
        .first(),
    ).toBeInViewport();
  });

  test("hero images load at once, the main one first, at the size they are shown (L5)", async ({
    page,
  }) => {
    await page.goto("/");
    const birds = page.locator("[data-hero-bird]");
    await expect(birds).toHaveCount(3);
    for (const el of await birds.all()) {
      await expect(el).toHaveAttribute("loading", "eager");
      await expect(el).toHaveAttribute("srcset", /-sm\.webp 560w/);
      await expect(el).toHaveAttribute("sizes", /vw/);
    }
    await expect(
      page.locator('[data-hero-bird][fetchpriority="high"]'),
    ).toHaveCount(1);
    await expect(page.locator("#hero-roller")).toHaveAttribute(
      "fetchpriority",
      "high",
    );
  });

  test("the final call poster is shown whole, above the footer line (L6)", async ({
    page,
  }) => {
    await page.goto("/");
    const poster = page.locator("[data-final-poster]");
    await poster.scrollIntoViewIfNeeded();
    const p = (await poster.boundingBox())!;
    const band = (await page.locator("[data-final]").boundingBox())!;
    const footer = (await page.locator("footer").boundingBox())!;
    expect(p.y).toBeGreaterThanOrEqual(band.y);
    expect(p.y + p.height).toBeLessThanOrEqual(band.y + band.height);
    expect(p.y + p.height).toBeLessThanOrEqual(footer.y);
  });

  test("every link is tall enough to hit: 44 px on phones, 32 px on desktop (L7)", async ({
    page,
  }, info) => {
    await page.goto("/");
    const min = info.project.name.startsWith("phone") ? 44 : 32;
    const short = await page.evaluate(
      (min) =>
        [...document.querySelectorAll<HTMLAnchorElement>("[data-landing] a")]
          .filter((a) => a.getClientRects().length)
          .map((a) => ({
            t: a.textContent!.trim().slice(0, 24),
            h: Math.min(...[...a.getClientRects()].map((r) => r.height)),
          }))
          .filter((x) => x.h < min - 0.5),
      min,
    );
    expect(short).toEqual([]);
  });

  test("a set card opens the builder with that set, named after it", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Owls of the world/ }).click();
    await expect(page).toHaveURL(/\/make$/);
    await expect(page.locator("[data-poster-title]")).toHaveValue(
      "Owls of the world",
    );
    await expect(page.locator("[data-poster] [data-animal]")).not.toHaveCount(
      12,
    );
  });

  test("the style slider works from the keyboard", async ({ page }) => {
    await page.goto("/");
    const range = page.getByRole("slider", { name: "Compare the two styles" });
    await range.focus();
    await page.keyboard.press("End");
    await expect(range).toHaveValue("100");
    const clip = await page
      .locator("[data-compare] img")
      .nth(1)
      .evaluate((el) => (el as HTMLElement).style.clipPath);
    expect(clip).toBe("inset(0px 0% 0px 0px)");
  });

  test("questions open one at a time", async ({ page }) => {
    await page.goto("/");
    const free = page.getByRole("button", { name: "Is it free?" });
    const account = page.getByRole("button", { name: "Do I need an account?" });
    await expect(free).toHaveAttribute("aria-expanded", "true");
    await account.click();
    await expect(account).toHaveAttribute("aria-expanded", "true");
    await expect(free).toHaveAttribute("aria-expanded", "false");
    await expect(
      page.getByText("No. Open the builder and start."),
    ).toBeVisible();
  });

  test("the footer credits both art sets with links and licences, and the page never scrolls sideways", async ({
    page,
  }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toContainText("Field guide art by Huashu");
    await expect(
      footer.getByRole("link", { name: "huashu-bird-sticker" }),
    ).toHaveAttribute("href", /alchaincyf\/huashu-bird-sticker/);
    await expect(
      footer.getByRole("link", { name: "CC BY 4.0" }),
    ).toHaveAttribute("href", /creativecommons\.org\/licenses\/by\/4\.0/);
    await expect(
      footer.getByRole("link", { name: "HABirdDashboard" }),
    ).toHaveAttribute("href", /HABirdDashboard/);
    await expect(footer.getByRole("link", { name: "MIT" })).toBeVisible();
    await expect(footer).toContainText("AI generated, may contain errors.");
    await expect(
      footer.getByRole("link", { name: "Report a wrong bird" }),
    ).toHaveAttribute("href", /issues\/new/);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });

  test("every section is there, in order, with its heading", async ({
    page,
  }) => {
    await page.goto("/");
    const ids = [
      "hero-title",
      "how",
      "styles",
      "sets",
      "yours",
      "print",
      "questions",
      "final",
    ];
    for (const id of ids) {
      const h = page.locator(`[id="${id}"]`);
      await h.scrollIntoViewIfNeeded();
      await expect(h).toBeVisible();
    }
    const tops = await page.evaluate(
      (list) =>
        list.map(
          (id) =>
            document.getElementById(id)!.getBoundingClientRect().top + scrollY,
        ),
      ids,
    );
    expect([...tops].sort((a, b) => a - b)).toEqual(tops);
    await expect(
      page.locator("#how").locator("xpath=ancestor::section").getByRole("img"),
    ).toHaveCount(3);
  });

  test("every Make your poster button leads into the builder", async ({
    page,
  }) => {
    await page.goto("/");
    const links = page.getByRole("link", { name: "Make your poster" });
    const n = await links.count();
    expect(n).toBeGreaterThanOrEqual(4);
    for (let i = 0; i < n; i++)
      await expect(links.nth(i)).toHaveAttribute("href", "/make");
    await page
      .locator("#print")
      .locator("xpath=ancestor::section")
      .getByRole("link", { name: "Make your poster" })
      .click();
    await expect(page).toHaveURL(/\/make$/);
  });

  test("the style slider settles between columns, never on a bird", async ({
    page,
  }) => {
    await page.goto("/");
    const range = page.getByRole("slider", { name: "Compare the two styles" });
    await range.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(range).toHaveValue("34");
    await page.keyboard.press("Home");
    await expect(range).toHaveValue("0");
    await expect(page.getByRole("slider")).toHaveCount(1);
  });

  test("the sets row moves with the arrow keys and the buttons, with no scrollbar", async ({
    page,
  }) => {
    await page.goto("/");
    const list = page.getByRole("list", { name: "Ready sets" });
    await list.scrollIntoViewIfNeeded();
    expect(
      await list.evaluate((el) => getComputedStyle(el).scrollbarWidth),
    ).toBe("none");
    await expect(
      page.getByRole("button", { name: "Previous sets" }),
    ).toBeDisabled();
    const first = list.getByRole("link").first();
    await first.focus();
    await page.keyboard.press("ArrowRight");
    await expect(list.getByRole("link").nth(1)).toBeFocused();
    const heights = await list
      .getByRole("link")
      .evaluateAll((els) =>
        els.map((e) => Math.round(e.getBoundingClientRect().height)),
      );
    expect(new Set(heights).size).toBe(1);
    const next = page.getByRole("button", { name: "Next sets" });
    await next.click();
    await expect
      .poll(() => list.evaluate((el) => el.scrollLeft))
      .toBeGreaterThan(0);
  });

  test("the small touches stand still when motion is reduced", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const demo = page.locator(".lp-demo-mirror");
    await demo.scrollIntoViewIfNeeded();
    expect(
      await demo.evaluate((el) => getComputedStyle(el).animationName),
    ).toBe("none");
    await expect(
      page.getByRole("heading", { name: "Tap to mirror" }),
    ).toBeVisible();
  });

  test("no serious or critical accessibility problems", async ({ page }) => {
    await page.goto("/");
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    const bad = result.violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map(
        (v) =>
          `${v.id}: ${v.nodes
            .slice(0, 2)
            .map((n) => n.target.join(" "))
            .join(" | ")}`,
      );
    expect(bad).toEqual([]);
  });

  test("share preview and description are set", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /\/landing\/og\.jpg$/,
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /1,161 species/,
    );
  });
});
