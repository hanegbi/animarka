import { expect, test } from "@playwright/test";

type Resource = { url: string; type: string; bytes: number };

/** Load the page cold and add up what crossed the wire, by kind, using Chrome's own transfer sizes. */
async function measure(page: import("@playwright/test").Page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  const kinds = new Map<string, string>();
  const done: Resource[] = [];
  cdp.on("Network.responseReceived", (e) => kinds.set(e.requestId, e.type));
  const urls = new Map<string, string>();
  cdp.on("Network.requestWillBeSent", (e) =>
    urls.set(e.requestId, e.request.url),
  );
  cdp.on("Network.loadingFinished", (e) =>
    done.push({
      url: urls.get(e.requestId) ?? "",
      type: kinds.get(e.requestId) ?? "Other",
      bytes: e.encodedDataLength,
    }),
  );
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator("[data-animal]").first().waitFor();
  await page.waitForTimeout(500);
  return done;
}

test("page weight before images is under 300 KB", async ({ page }, info) => {
  const res = await measure(page);
  const sum = (types: string[]) =>
    res.filter((r) => types.includes(r.type)).reduce((a, r) => a + r.bytes, 0);
  const kb = (n: number) => Math.round(n / 1024);
  const report = {
    document: kb(sum(["Document"])),
    script: kb(sum(["Script"])),
    style: kb(sum(["Stylesheet"])),
    font: kb(sum(["Font"])),
    other: kb(sum(["Fetch", "XHR", "Other", "Manifest"])),
    images: kb(sum(["Image"])),
  };
  const beforeImages = res
    .filter((r) => r.type !== "Image")
    .reduce((a, r) => a + r.bytes, 0);
  console.log(
    `[${info.project.name}] KB`,
    JSON.stringify(report),
    "total before images:",
    kb(beforeImages),
  );
  for (const r of res
    .filter((x) => x.type !== "Image")
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 8)) {
    console.log(
      `   ${kb(r.bytes)} KB  ${r.type}  ${r.url.replace(/^https?:\/\/[^/]+/, "").slice(0, 90)}`,
    );
  }
  expect(kb(beforeImages)).toBeLessThanOrEqual(300);
});

test("the first poster is visible within 2 seconds on a 4G connection", async ({
  page,
}, info) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  // A typical 4G link: 4 Mbit/s down, 100 ms round trip. Chrome counts bytes per second.
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 100,
    downloadThroughput: (4 * 1024 * 1024) / 8,
    uploadThroughput: (1 * 1024 * 1024) / 8,
  });
  const start = Date.now();
  await page.goto("/", { waitUntil: "commit" });
  await page
    .locator("[data-poster] [data-animal]")
    .first()
    .waitFor({ state: "visible", timeout: 10_000 });
  const ms = Date.now() - start;
  console.log(
    `[${info.project.name}] first poster visible after ${ms} ms on 4 Mbit/s and 100 ms`,
  );
  expect(ms).toBeLessThan(2000);
});
