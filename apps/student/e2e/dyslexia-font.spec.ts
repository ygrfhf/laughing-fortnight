/**
 * Dyslexia-friendly font in a real browser: self-hosted OpenDyslexic, downloaded only when
 * turned on, and the wider letters still fit a 320px screen without sideways scrolling.
 */
import { expect, test, type Page } from "@playwright/test";

function trackFontRequests(page: Page): string[] {
  const fonts: string[] = [];
  page.on("request", (request) => {
    if (/\.woff2?(\?|$)/.test(request.url())) fonts.push(request.url());
  });
  return fonts;
}

async function openToday(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Your next step" })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

async function turnOnDyslexiaFont(page: Page): Promise<void> {
  await page.getByText("Dev tools (not in student builds)").click();
  await page.getByRole("checkbox", { name: "Dyslexia-friendly font" }).check();
  await expect(page.locator("[data-font]")).toHaveAttribute("data-font", "dyslexic");
  await page.waitForFunction(() => document.fonts.check('16px "OpenDyslexic"'));
}

test("by default only Atkinson Hyperlegible is downloaded, never OpenDyslexic", async ({ page }) => {
  const fonts = trackFontRequests(page);

  await openToday(page);

  expect(fonts.some((url) => url.includes("atkinson-hyperlegible"))).toBe(true);
  expect(fonts.some((url) => url.includes("opendyslexic"))).toBe(false);
});

test("turning it on loads OpenDyslexic from this server and applies it", async ({ page, baseURL }) => {
  const fonts = trackFontRequests(page);
  await openToday(page);

  await turnOnDyslexiaFont(page);

  const dyslexicFonts = fonts.filter((url) => url.includes("opendyslexic"));
  expect(dyslexicFonts.length).toBeGreaterThan(0);
  expect(dyslexicFonts.every((url) => url.startsWith(baseURL ?? "http://localhost"))).toBe(true);
  const headingFont = await page.getByRole("heading", { level: 1 }).evaluate((h) => getComputedStyle(h).fontFamily);
  expect(headingFont).toMatch(/^"?OpenDyslexic/);
});

test("with OpenDyslexic on, text is about 10% smaller than normal for the same grade band", async ({ page }) => {
  await openToday(page);
  const appFontSize = () => page.locator(".lf-app").evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  const normal = await appFontSize();

  await turnOnDyslexiaFont(page);

  expect(normal).toBe(22); // K–2 base size
  expect(await appFontSize()).toBeCloseTo(normal * 0.9, 1);
});

test("with OpenDyslexic on, a 320px phone screen has no sideways scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await openToday(page);

  await turnOnDyslexiaFont(page);
  await page.getByText("Dev tools (not in student builds)").click(); // collapse the toolbar

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
