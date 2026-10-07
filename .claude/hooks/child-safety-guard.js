#!/usr/bin/env node
/**
 * child-safety-guard.js — Claude Code PreToolUse hook
 *
 * Runs before Claude writes or edits a file. Blocks (exit 2) changes that break the
 * project's child-safety rules. The message on stderr is shown to Claude so it can fix
 * the problem. Warnings print but do not block.
 *
 * Adjust CONFIG below to match your repo layout.
 */

const CONFIG = {
  // Folders containing student/teacher/parent-facing client code.
  clientDirs: ["apps/student", "apps/teacher", "apps/parent", "packages/ui", "src/client"],
  // The only folder allowed to request microphone access (voice input module).
  voiceInputDir: "voice-input",
  // Database migration folders.
  migrationDirs: ["supabase/migrations", "migrations"],
  // Seed / fixture / mock data folders.
  seedDirs: ["seed", "seeds", "fixtures", "mocks", "mock-data"],
};

const RULES = {
  secrets: [
    /sk-ant-[A-Za-z0-9_-]{10,}/,
    /sk-(proj-)?[A-Za-z0-9]{20,}/,
    /service_role/i,
    /SUPABASE_SERVICE_ROLE_KEY/,
    /-----BEGIN (RSA |EC )?PRIVATE KEY-----/,
  ],
  directLlm: [/api\.anthropic\.com/, /api\.openai\.com/, /generativelanguage\.googleapis\.com/],
  analytics: [
    /google-analytics|googletagmanager|gtag\(/,
    /@segment\/|analytics\.js/,
    /mixpanel/i, /amplitude/i, /hotjar/i, /posthog/i, /fullstory/i,
    /firebase\/analytics/, /connect\.facebook\.net|fbq\(/, /tiktok.*pixel/i,
  ],
  biometrics: [/face-api/i, /@mediapipe\/face/i, /face-landmarks/i, /blazeface/i, /emotion[-_]?(detect|recogn)/i],
  camera: [/video\s*:\s*true/, /getUserMedia\s*\(\s*\{[^}]*video/],
  microphone: [/getUserMedia/, /MediaRecorder/],
};

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (c) => (data += c));
    process.stdin.on("end", () => resolve(data));
  });
}

function newContent(input) {
  const t = input.tool_input || {};
  if (typeof t.content === "string") return t.content;           // Write
  if (typeof t.new_string === "string") return t.new_string;     // Edit
  if (Array.isArray(t.edits)) return t.edits.map((e) => e.new_string || "").join("\n"); // MultiEdit
  return "";
}

const norm = (p) => (p || "").replace(/\\/g, "/");
const inAny = (path, dirs) => dirs.some((d) => path.includes(`/${d}/`) || path.startsWith(`${d}/`));
const matchAny = (text, patterns) => patterns.find((re) => re.test(text));

async function main() {
  let input;
  try {
    input = JSON.parse(await readStdin());
  } catch {
    process.exit(0); // Not our input format; don't block.
  }

  const path = norm(input.tool_input && (input.tool_input.file_path || input.tool_input.path));
  const text = newContent(input);
  if (!path || !text) process.exit(0);

  const errors = [];
  const warnings = [];
  const isClient = inAny(path, CONFIG.clientDirs);
  const isEnvExample = /\.env(\.example|\.sample)?$/.test(path);

  // 1. Secrets anywhere except .env example files.
  if (!isEnvExample && matchAny(text, RULES.secrets)) {
    errors.push("Possible API key or secret in source code. Secrets belong in server-side environment variables only.");
  }

  if (isClient) {
    // 2. Clients never call LLM providers directly.
    if (matchAny(text, RULES.directLlm)) {
      errors.push("Client code calls an LLM provider directly. All AI requests must go through the backend AI gateway.");
    }
    // 3. No analytics / ad / tracking SDKs in clients.
    const a = matchAny(text, RULES.analytics);
    if (a) errors.push(`Analytics/ad/tracking code in a client (${a}). Not allowed in student-facing apps.`);
  }

  // 4. No biometrics anywhere.
  const b = matchAny(text, RULES.biometrics);
  if (b) errors.push(`Biometric or emotion-detection code (${b}). Not allowed anywhere in this product.`);

  // 5. No camera access.
  if (matchAny(text, RULES.camera)) {
    errors.push("Camera access requested. Camera use is not allowed in this product.");
  }

  // 6. Microphone only in the voice-input module.
  if (matchAny(text, RULES.microphone) && !path.includes(`/${CONFIG.voiceInputDir}/`)) {
    errors.push(`Microphone access outside the ${CONFIG.voiceInputDir}/ module. Move it there; audio must be deleted right after transcription.`);
  }

  // 7. Every new table needs row-level security in the same migration.
  if (inAny(path, CONFIG.migrationDirs) && /\.sql$/.test(path)) {
    const tables = [...text.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?([\w."]+)/gi)].map((m) => m[1].replace(/"/g, ""));
    for (const t of tables) {
      const short = t.split(".").pop();
      const rls = new RegExp(`alter\\s+table\\s+[\\w."]*${short}"?\\s+enable\\s+row\\s+level\\s+security`, "i");
      if (!rls.test(text)) errors.push(`Table "${t}" is created without "ENABLE ROW LEVEL SECURITY" in the same migration.`);
    }
    if (tables.length && !/create\s+policy/i.test(text)) {
      warnings.push("Migration creates tables but defines no policies. With RLS on and no policies, nothing is readable; confirm that's intended.");
    }
  }

  // 8. Seed/mock data must use obviously fake emails.
  if (inAny(path, CONFIG.seedDirs)) {
    const emails = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || [];
    const realLooking = emails.filter((e) => !/@example\.(com|org|net)$|\.test$|\.invalid$/i.test(e));
    if (realLooking.length) {
      errors.push(`Seed/mock data has real-looking emails (${realLooking.slice(0, 3).join(", ")}). Use @example.com or .test addresses.`);
    }
  }

  if (warnings.length) console.error(`[child-safety-guard] Warning in ${path}:\n- ${warnings.join("\n- ")}`);

  if (errors.length) {
    console.error(
      `[child-safety-guard] Blocked change to ${path}:\n- ${errors.join("\n- ")}\n` +
      `See .claude/rules/child-safety.md and CLAUDE.md. Fix the change or explain to the user why it's needed.`
    );
    process.exit(2);
  }
  process.exit(0);
}

// Exported so build-time guard tests (e.g. apps/student/test/) share one source of truth.
module.exports = { CONFIG, RULES };

if (require.main === module) main();