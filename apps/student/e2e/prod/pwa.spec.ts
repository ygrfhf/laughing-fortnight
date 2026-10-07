/**
 * The production build, as students get it: installable PWA, works offline, strict CSP with
 * no violations, no developer toolbar, nothing loaded from other origins.
 */
import { expect, test, type Page } from "@playwright/test";

declare global {
  interface Window {
    __cspViolations?: string[];
  }
}

async function openToday(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.__cspViolations = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      window.__cspViolations?.push(`${event.violatedDirective} ${event.blockedURI}`);
    });
  });
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Your next step" })).toBeVisible();
}

async function waitForServiceWorkerControl(page: Page): Promise<void> {
  await page.evaluate(() => navigator.serviceWorker.ready);
  if (!(await page.evaluate(() => navigator.serviceWorker.controller !== null))) {
    await page.reload();
  }
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
}

test("has no developer toolbar", async ({ page }) => {
  await openToday(page);

  await expect(page.getByRole("complementary", { name: "Developer tools" })).toHaveCount(0);
  await expect(page.getByText("Dev tools")).toHaveCount(0);
});

test("ships a strict Content Security Policy and breaks none of its rules", async ({ page }) => {
  await openToday(page);
  await page.getByRole("link", { name: /^Start/ }).click();
  await page.getByRole("button", { name: "I'm done!" }).click();
  await page.getByRole("link", { name: "See what's next" }).click();
  await expect(page.getByRole("region", { name: "Your next step" })).toBeVisible();

  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute("content");
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("script-src 'self'");
  expect(await page.evaluate(() => window.__cspViolations)).toEqual([]);
});

test("loads nothing from any other origin", async ({ page, baseURL }) => {
  const otherOrigins = new Set<string>();
  page.on("request", (request) => {
    const origin = new URL(request.url()).origin;
    if (origin !== new URL(baseURL ?? "").origin) otherOrigins.add(origin);
  });

  await openToday(page);
  await page.getByRole("link", { name: /^Start/ }).click();
  await expect(page.getByRole("button", { name: "I'm done!" })).toBeVisible();

  expect([...otherOrigins]).toEqual([]);
});

test("is installable: the manifest has a name, standalone display, and working icons", async ({ page, request }) => {
  await openToday(page);
  const href = await page.locator('link[rel="manifest"]').getAttribute("href");
  const manifest = await (await request.get(href ?? "")).json();

  expect(manifest).toMatchObject({ name: "My School Day", display: "standalone", start_url: "/" });
  const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
  expect(sizes).toEqual(expect.arrayContaining(["192x192", "512x512"]));
  expect(manifest.icons.some((icon: { purpose?: string }) => icon.purpose === "maskable")).toBe(true);
  for (const icon of manifest.icons as Array<{ src: string }>) {
    const response = await request.get(`/${icon.src}`);
    expect(response.status(), icon.src).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
  }
  expect((await request.get("/favicon.ico")).status()).toBe(200);
});

test("opens and moves between screens with no network connection", async ({ page, context }) => {
  await openToday(page);
  await waitForServiceWorkerControl(page);

  await context.setOffline(true);
  await page.reload();

  await expect(page.getByRole("heading", { level: 1, name: "Today" })).toBeVisible();
  await page.getByRole("link", { name: /^Start/ }).click();
  await expect(page.getByRole("button", { name: "I'm done!" })).toBeVisible();
  await context.setOffline(false);
});

test("the offline cache holds the app shell but not OpenDyslexic", async ({ page }) => {
  await openToday(page);
  await waitForServiceWorkerControl(page);

  const cached = await page.evaluate(async () => {
    const urls: string[] = [];
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      urls.push(...(await cache.keys()).map((request) => request.url));
    }
    return urls;
  });

  expect(cached.some((url) => url.includes("atkinson-hyperlegible") && url.includes(".woff2"))).toBe(true);
  expect(cached.some((url) => url.endsWith("/index.html") || url.includes("index.html?"))).toBe(true);
  expect(cached.some((url) => url.includes("opendyslexic"))).toBe(false);
});
