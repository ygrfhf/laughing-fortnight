/**
 * Checks the production build of the student app (run after `npm run build`):
 *   1. Bundle budget: first-load JavaScript and CSS stay small for old Chromebooks and tablets.
 *   2. No developer toolbar code or wording ships to students.
 *   3. The Content Security Policy is in index.html, and there are no inline scripts.
 *   4. The service worker precaches the app shell but not the optional OpenDyslexic font.
 * Exits with code 1 and a list of problems if any check fails.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CONTENT_SECURITY_POLICY } from "../apps/student/content-security-policy.ts";
import { devStrings } from "../apps/student/src/strings/dev-en.ts";

const BUDGET_JS_GZIP_KB = 120;
const BUDGET_CSS_GZIP_KB = 10;

const ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");
const DIST = join(ROOT, "apps", "student", "dist");
const ASSETS = join(DIST, "assets");

const problems: string[] = [];
const fail = (message: string): void => {
  problems.push(message);
};

if (!existsSync(DIST)) {
  console.error("No build found at apps/student/dist. Run `npm run build` first.");
  process.exit(1);
}

const assetFiles = readdirSync(ASSETS);
const read = (file: string): string => readFileSync(join(ASSETS, file), "utf8");
const gzipKb = (files: string[]): number =>
  files.reduce((total, file) => total + gzipSync(readFileSync(join(ASSETS, file))).length, 0) / 1024;

// 1. Bundle budget.
const jsFiles = assetFiles.filter((f) => f.endsWith(".js"));
const cssFiles = assetFiles.filter((f) => f.endsWith(".css"));
const jsKb = gzipKb(jsFiles);
const cssKb = gzipKb(cssFiles);
if (jsKb > BUDGET_JS_GZIP_KB) fail(`JavaScript is ${jsKb.toFixed(1)} KB gzipped (budget ${BUDGET_JS_GZIP_KB} KB).`);
if (cssKb > BUDGET_CSS_GZIP_KB) fail(`CSS is ${cssKb.toFixed(1)} KB gzipped (budget ${BUDGET_CSS_GZIP_KB} KB).`);

// 2. No developer toolbar in production.
const allJs = jsFiles.map(read).join("\n");
for (const [key, text] of Object.entries(devStrings)) {
  if (allJs.includes(text)) fail(`Dev toolbar text devStrings.${key} ("${text}") is in the production bundle.`);
}
if (allJs.includes("dev-grade-band")) fail("Dev toolbar markup (dev-grade-band) is in the production bundle.");

// 3. CSP and no inline scripts.
const html = readFileSync(join(DIST, "index.html"), "utf8");
if (!html.includes(`<meta http-equiv="Content-Security-Policy" content="${CONTENT_SECURITY_POLICY}" />`)) {
  fail("index.html is missing the Content-Security-Policy meta tag (or it differs from content-security-policy.ts).");
}
const inlineScripts = [...html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>/g)];
if (inlineScripts.length > 0) fail(`index.html has ${inlineScripts.length} inline <script> tag(s); the CSP forbids them.`);
if (!html.includes('rel="manifest"')) fail("index.html does not link the web app manifest.");

// 4. Service worker precache.
const sw = existsSync(join(DIST, "sw.js")) ? readFileSync(join(DIST, "sw.js"), "utf8") : "";
const precached = [...sw.matchAll(/url:"([^"]+)"/g)].map((m) => m[1] ?? "");
if (precached.length === 0) fail("No service worker precache list found in dist/sw.js.");
if (precached.some((url) => url.includes("opendyslexic"))) fail("OpenDyslexic is precached; it should load only when used.");
for (const required of ["index.html", "manifest.webmanifest"]) {
  if (!precached.includes(required)) fail(`${required} is not precached, so the app will not open offline.`);
}
if (!precached.some((url) => url.includes("atkinson-hyperlegible") && url.endsWith(".woff2"))) {
  fail("The default font (Atkinson Hyperlegible) is not precached.");
}

console.log("Build check (apps/student/dist)");
console.log(`  JavaScript: ${jsKb.toFixed(1)} KB gzipped (budget ${BUDGET_JS_GZIP_KB} KB)`);
console.log(`  CSS:        ${cssKb.toFixed(1)} KB gzipped (budget ${BUDGET_CSS_GZIP_KB} KB)`);
console.log(`  Precached:  ${new Set(precached).size} files, OpenDyslexic excluded`);
console.log(`  Dev toolbar strings checked: ${Object.keys(devStrings).length}`);

if (problems.length > 0) {
  console.error(`\nBuild check FAILED:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("\nBuild check passed.");
