# Child Safety Rules (highest priority)

This product is used by children ages 5–11 and is regulated (COPPA, FERPA, state student
privacy and AI chatbot laws). These rules override every other rule file in `.claude/rules/`,
including the general rules from everything-claude-code, wherever they conflict.

If a task would break any rule below, stop, explain which rule, and propose a compliant
alternative. Never "temporarily" bypass a rule, even in a prototype.

## Data
- Use fake data only. Seed and fixture data must use obviously fake names and
  `@example.com` / `.test` emails. Never copy in real student names, photos, or work.
- Collect only what a feature needs for an educational purpose. Every new student data
  field gets an entry in `docs/data-inventory.md` (field, purpose, retention, who can access).
- No advertising, analytics, tracking, or ad SDKs in any student-facing client.
- No biometrics: no face detection or recognition, voiceprints, eye tracking, emotion
  inference, or typing-pattern identification.
- Microphone access is allowed only in the voice-input module, which transcribes and then
  deletes the audio immediately. Camera access is not allowed.
- Every table holding student data has row-level security enabled, with policies, in the
  same migration that creates it.
- Every record type has a retention period and a tested deletion job.
- Staff access to student data is audit-logged.

## Secrets and AI
- No API keys, service-role keys, or secrets in any client code. Ever.
- Clients never call an LLM provider directly. All AI requests go through the backend AI
  gateway and its full safety pipeline (see CLAUDE.md Section 6).
- If any safety step fails or times out, fail closed with the "ask your teacher" fallback.
- Never weaken tutor rules in prompts: no final answers unless the teacher allows it, no
  persona or companion behavior, always discloses it is an AI, never claims to be a
  professional.
- Wellbeing disclosures always escalate to a human counselor. Do not change escalation
  logic without updating and passing the critical evals.

## Monitoring
- Teacher monitoring runs only during school hours, for the teacher's own class session.
- Students always see an indicator when their screen is viewed.
- "Needs attention" alerts use platform activity only, show a plain-language reason, never
  trigger automated discipline, and expire at the end of the session.

## Testing
- Before finishing any change that touches auth, the database, the AI gateway, or
  monitoring, run the relevant tests:
  - Access control: a student can never read another student's data; a teacher can never
    read another class's data.
  - Retention and deletion jobs.
  - AI safety evals. Critical evals (wellbeing escalation, answer leakage) must pass on
    every run, not just once.
- Run the security-reviewer agent on these changes before committing.