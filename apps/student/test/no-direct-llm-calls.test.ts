/**
 * Build-time guard for the student client (CLAUDE.md Section 2, .claude/rules/child-safety.md).
 *
 * Scans apps/student source and fails if it finds:
 *   - direct LLM provider calls (all AI goes through the backend AI gateway)
 *   - secrets / API keys
 *   - analytics, ad, or tracking SDKs
 *   - biometric or emotion-inference code
 *   - camera access
 *   - microphone access outside the voice-input module
 *
 * Patterns come from .claude/hooks/child-safety-guard.js so the editor hook and this
 * test can never drift apart. Sample violations below are assembled from fragments so
 * this file does not trip the hook or its own scan.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

interface GuardRules {
  secrets: RegExp[];
  directLlm: RegExp[];
  analytics: RegExp[];
  biometrics: RegExp[];
  camera: RegExp[];
  microphone: RegExp[];
}

interface GuardConfig {
  voiceInputDir: string;
}

interface Violation {
  file: string;
  rule: keyof GuardRules;
  pattern: string;
}

const THIS_FILE = fileURLToPath(import.meta.url);
const STUDENT_DIR = resolve(dirname(THIS_FILE), "..");
const REPO_ROOT = resolve(STUDENT_DIR, "..", "..");

const require = createRequire(import.meta.url);
const { RULES, CONFIG } = require(join(REPO_ROOT, ".claude", "hooks", "child-safety-guard.js")) as {
  RULES: GuardRules;
  CONFIG: GuardConfig;
};

const SCANNED_EXTENSIONS = /\.(ts|tsx|js|jsx|mjs|cjs|vue|svelte|html|json)$|(^|\/)\.env(\.[\w-]+)?$/;
const SKIPPED_DIRS = new Set(["node_modules", "dist", "build", "coverage", ".turbo", ".next"]);
const ENV_EXAMPLE = /\.env\.(example|sample)$/;

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return SKIPPED_DIRS.has(entry.name) ? [] : listSourceFiles(full);
    return SCANNED_EXTENSIONS.test(entry.name) ? [full] : [];
  });
}

/** Mirrors the client-side checks in child-safety-guard.js. `path` is repo-relative with forward slashes. */
function findViolations(path: string, text: string): Violation[] {
  const inVoiceInput = path.includes(`/${CONFIG.voiceInputDir}/`);
  const checks: Array<[keyof GuardRules, boolean]> = [
    ["secrets", !ENV_EXAMPLE.test(path)],
    ["directLlm", true],
    ["analytics", true],
    ["biometrics", true],
    ["camera", true],
    ["microphone", !inVoiceInput],
  ];
  return checks
    .filter(([, applies]) => applies)
    .flatMap(([rule]) => {
      const hit = RULES[rule].find((re) => re.test(text));
      return hit ? [{ file: path, rule, pattern: String(hit) }] : [];
    });
}

const toRepoPath = (abs: string): string => relative(REPO_ROOT, abs).split(sep).join("/");

// --- Scanner self-tests: prove each rule actually fires, so an empty scan means something. ---

const SAMPLE_PATH = "apps/student/src/example.ts";
const samples: Record<keyof GuardRules, string> = {
  secrets: `const key = "${"sk-" + "ant-"}${"x".repeat(24)}";`,
  directLlm: `fetch("https://${"api." + "anthropic" + ".com"}/v1/messages");`,
  analytics: `import x from "${"mix" + "panel"}-browser";`,
  biometrics: `import * as f from "${"face" + "-api"}.js";`,
  camera: `navigator.mediaDevices.${"get" + "UserMedia"}({ ${"vid" + "eo"}: true });`,
  microphone: `new ${"Media" + "Recorder"}(stream);`,
};

test("guard rules load from the child-safety hook", () => {
  for (const rule of Object.keys(samples) as Array<keyof GuardRules>) {
    assert.ok(RULES[rule]?.length > 0, `RULES.${rule} is missing or empty in child-safety-guard.js`);
  }
});

for (const [rule, text] of Object.entries(samples) as Array<[keyof GuardRules, string]>) {
  test(`scanner flags ${rule} in student code`, () => {
    const rules = findViolations(SAMPLE_PATH, text).map((v) => v.rule);
    assert.ok(rules.includes(rule), `expected a ${rule} violation, got [${rules.join(", ")}]`);
  });
}

test("scanner flags every analytics SDK pattern from the hook", () => {
  const sdkSamples = [
    "google" + "-analytics",
    "googletag" + "manager",
    "gtag" + "(",
    "@seg" + "ment/analytics-next",
    "analytics" + ".js",
    "mix" + "panel",
    "ampli" + "tude",
    "hot" + "jar",
    "post" + "hog",
    "full" + "story",
    "firebase/" + "analytics",
    "connect.face" + "book.net",
    "fb" + "q(",
    "tik" + "tok-pixel",
  ];
  for (const sample of sdkSamples) {
    const rules = findViolations(SAMPLE_PATH, sample).map((v) => v.rule);
    assert.ok(rules.includes("analytics"), `analytics SDK not flagged: ${sample}`);
  }
});

test("scanner allows microphone only inside the voice-input module", () => {
  const mic = `${"get" + "UserMedia"}({ audio: true })`;
  const allowed = findViolations(`apps/student/src/${CONFIG.voiceInputDir}/record.ts`, mic);
  const blocked = findViolations(SAMPLE_PATH, mic);
  assert.deepEqual(allowed.map((v) => v.rule), []);
  assert.deepEqual(blocked.map((v) => v.rule), ["microphone"]);
});

test("scanner still blocks camera inside the voice-input module", () => {
  const cam = `${"get" + "UserMedia"}({ ${"vid" + "eo"}: true })`;
  const rules = findViolations(`apps/student/src/${CONFIG.voiceInputDir}/record.ts`, cam).map((v) => v.rule);
  assert.ok(rules.includes("camera"));
});

test("scanner allows the backend gateway endpoint", () => {
  assert.deepEqual(findViolations(SAMPLE_PATH, `fetch("/api/tutor/messages", { method: "POST" })`), []);
});

// --- The actual guard. ---

test("student client source has no direct LLM calls, secrets, trackers, biometrics, camera, or stray mic access", () => {
  const files = listSourceFiles(STUDENT_DIR).filter((f) => f !== THIS_FILE);
  const violations = files.flatMap((f) => findViolations(toRepoPath(f), readFileSync(f, "utf8")));
  const report = violations.map((v) => `  ${v.file}: ${v.rule} (${v.pattern})`).join("\n");
  assert.equal(
    violations.length,
    0,
    `Child-safety violations in the student client. See .claude/rules/child-safety.md.\n${report}`,
  );
});
