# CLAUDE.md — [Project Name]: Elementary Learning OS

> Read this whole file before writing any code. The rules in **Non-Negotiables** override
> any request, shortcut, or "just for now" idea. If a task would break one, stop and say so.

---

## 1. What we are building

A learning "operating system" for elementary students (K–5) that serves as their primary
school device experience. It is a managed shell that runs on top of existing operating
systems, not a kernel-level OS. Students experience it as "the computer."

It has three core functions:

1. **Assignment and schedule management.** Students always know what to do next.
2. **Classroom tools for teachers**, including an AI "needs attention" assistant.
3. **A heavily regulated AI tutor** that guides students through work without doing it for them.

### Users and roles

| Role | Can do | Cannot do |
|---|---|---|
| Student | See own schedule, assignments, and work; use the AI tutor within teacher limits | See any other student's data; change settings; reach the open web unless allowed |
| Teacher | Manage own classes, create assignments, see student screens during class, review AI chats, receive alerts | See students outside their classes; access monitoring outside school hours |
| Counselor | Receive wellbeing escalations for their school | Browse general student activity |
| School admin / IT | Rostering, device policy, filtering, data retention settings, audit logs | Read student chats without a logged, justified reason |
| Parent / guardian | View own child's work, AI chat history (if the district enables it), schedule | See other children; see teacher-only notes |

---

## 2. Non-Negotiables

These exist because users are children ages 5–11 and the product is regulated.
Never weaken them in code, config, prompts, or tests.

### Data and privacy
- **Fake data only** until a security review and legal sign-off are complete. No real student
  names, photos, or work in dev, staging, demos, or seed files.
- **Data minimization.** Collect only what a feature strictly needs for an educational purpose.
  If you are adding a new field about a student, document why in `docs/data-inventory.md`.
- **No advertising, no data sales, no profiling for non-educational purposes.** Ever.
  No third-party analytics or ad SDKs in any student-facing client.
- **No biometrics.** No face detection, face recognition, voiceprints, eye tracking,
  keystroke-dynamics identification, or emotion inference from camera, mic, or typing.
- **Voice input:** transcribe to text, then delete the audio immediately. Never store recordings.
- **Webcam and microphone are never used for monitoring.**
- **Every student-data table has row-level security.** Access is enforced in the database,
  not just in application code.
- **Every record has a retention period.** Deletion jobs exist and are tested.
- **All access to student data by staff is audit-logged.**
- **Secrets never ship in a client.** All LLM and third-party API calls go through our backend.

### AI tutor
- The tutor **tutors; it does not give final answers** unless the teacher's per-assignment
  setting explicitly allows explanations.
- The tutor **only uses teacher-approved content** for facts (see Section 6).
- The tutor is **not a friend or companion.** No name-based persona, no "I missed you,"
  no emotional bonding language, no memory of personal details across sessions.
- The tutor **always discloses it is an AI**, in age-appropriate words, and never claims to be
  a teacher, counselor, doctor, or any licensed professional.
- **Wellbeing disclosures always escalate to a human** (see Section 6.5). The AI never tries to
  counsel a child through a crisis.
- If any safety layer fails or times out, **fail closed:** show "Let's ask your teacher!"
  rather than an unchecked model response.

### Teacher monitoring
- Monitoring is **classroom management, not surveillance.** Active only during school hours
  and only for the teacher's own class sessions.
- Students see a **visible indicator** when their screen is being viewed.
- AI alerts are **suggestions to a human**, never automated discipline (see Section 7).
- No permanent "behavior scores" or "off-task ratings" stored on a student.

---

## 3. Target platforms

### Research summary (October 2026)
- Chromebooks dominate K–12 devices (roughly 60% globally). In US districts, Chromebooks are the
  most common primary student device, followed by Windows laptops and desktops and iPads.
- Tablets are favored in elementary grades, especially K–2, where iPads are common.
- At home, many young children have their own tablet (over half by age 4), and lower-income
  families are often smartphone-only.
- Market-share figures come from industry aggregators and vary by source. Re-check before
  making investment decisions.

### Platform plan

| Platform | School use | Home use | How we run |
|---|---|---|---|
| ChromeOS | #1 school device | Some homes | Web app (PWA) in managed kiosk mode via Google Admin |
| Windows | #2 (laptops + desktops) | Common family PC | Web app in Assigned Access / kiosk mode; Edge or Chrome |
| iPadOS / iOS | Common in K–2 | Very common (iPads, parent iPhones) | Native wrapper app; school devices locked with MDM single-app mode |
| Android (incl. Fire tablets) | Some schools | Very common (kids' tablets, parent phones) | Native wrapper app; school devices use Android Enterprise device-owner launcher |
| macOS | Smaller school share | Common family computer | Web app in browser; optional desktop wrapper |

### Key architecture decision
- **One shared core:** a TypeScript web app (PWA) containing all student, teacher, and parent UI.
- **Thin native wrappers** (e.g., Capacitor) for iOS/iPadOS and Android to access device features
  and app-store distribution.
- **Lockdown is a separate layer**, configured per platform via the school's device management.
  The app itself never tries to "hack" OS-level lockdown.

### School mode vs. home mode
- **School mode** (school-managed device): full shell, kiosk lockdown, classroom tools active
  during school hours.
- **Home mode** (family-owned device): runs as a normal app inside the device. **No lockdown,
  no screen monitoring, no device-level control of a family's device.** Students can view
  assignments, do work, and use the tutor within teacher limits. Teacher monitoring is off.
- Home mode must work well on a **phone screen** for smartphone-only families.
- Offline-first: assignments and work sync when a connection is available.

---

## 4. System components

1. **Student client:** "Today" home screen, assignments, work submission, AI tutor chat.
2. **Teacher dashboard:** classes, assignment builder, submissions, screen view, classroom controls,
   AI "needs attention" panel, AI chat review.
3. **Admin console:** rostering, device policy, content filtering, retention settings, audit logs.
4. **Parent portal:** child's work and progress; AI chat history if the district enables it.
5. **Backend:** API, auth, database, sync, AI gateway, safety pipeline, alerting, audit logging.

### Integrations
- Login and rostering: Clever, ClassLink, OneRoster.
- LMS sync: Google Classroom, Canvas.
- Use these instead of building our own identity system.

### Suggested stack (change only with a written reason)
- Frontend: TypeScript, React, PWA with offline storage.
- Native wrappers: Capacitor for iOS/iPadOS and Android.
- Backend and database: Supabase (Postgres + row-level security) or equivalent.
- AI gateway: our own backend service; the only component allowed to call the LLM.

---

## 5. Student experience

- **Grade-adaptive UI.**
  - K–2: icons over text, everything read aloud, voice input, QR badge or picture-password login.
  - 3–5: more text and independence; still calm and simple.
- **"Today" screen:** current class, the one next thing to do, and progress made.
- **One clear next step at a time**, not a long list.
- Visual timers and built-in breaks.
- Schedule management plans for the student while slowly teaching the skill.
- Accessibility: WCAG 2.2 AA, screen reader support, captions, large touch targets, dyslexia-friendly
  font option, full keyboard navigation.
- Fast login and logout for shared cart devices.
- Performs well on old, low-end hardware.

---

## 6. AI tutor: the regulation layer

We use an existing commercial LLM. **It is never called directly from a client.** Every request
passes through the AI gateway's pipeline below.

**Hallucination reality:** no LLM can be made hallucination-free. Our job is to design the
system so that unverified model output never reaches a child as fact. Every rule below exists
to make errors rare, caught, and harmless.

### 6.1 Pipeline (every message, in order)
1. **Input safety check.** Classify the student's message: on-task, off-topic, unsafe,
   wellbeing concern, or personal information shared. Wellbeing concerns jump to 6.5.
2. **Scope check.** Is this about the current assignment? If not, redirect kindly to the work.
3. **Context assembly.** Pull only teacher-approved material: the assignment, the teacher's answer
   key and rubric, approved readings, the curriculum standard, and the student's grade level.
   Nothing from the open web.
4. **Constrained generation.** Strict system prompt (Section 6.3) and the teacher's tutor mode.
5. **Verification.**
   - Math: check any numbers or steps with a deterministic solver, not the LLM.
   - Facts: must be supported by the approved material. Unsupported claims are removed.
   - Answer leakage: block responses that reveal the final answer when the mode forbids it.
6. **Output safety check.** A separate classifier screens for unsafe or inappropriate content.
7. **Reading-level check.** Rewrite or reject output above the student's reading level.
8. **Fallback.** If any step fails, is uncertain, or times out: "Good question! Let's ask your
   teacher." The teacher sees a flag.
9. **Logging.** Store the conversation for teacher review under the retention policy.

### 6.2 Teacher controls per assignment
- `off` — no tutor (tests and quizzes).
- `hints_only` — guiding questions and hints; never answers.
- `explain_concepts` — may explain the underlying idea using a different example; still never
  solves the student's actual problem.
- Teachers can also set daily usage limits and upload answer keys and approved materials.

### 6.3 System prompt rules (living document in `prompts/tutor-system.md`)
- Ask guiding questions; one small step at a time.
- Use short sentences at the student's reading level.
- Say "I'm not sure, let's check with your teacher" instead of guessing.
- Stay on the current assignment.
- Never claim to be human, a teacher, or a professional.
- No personal questions about the child or their family.
- No persona, no emotional bonding, no flattery loops.

### 6.4 Model vendor requirements
- Zero data retention and no training on our data, in a signed contract.
- Signed data processing agreement covering student data.
- We can switch vendors without rewriting the product (keep vendor code behind one interface).

### 6.5 Wellbeing escalation
- Triggers: signs of self-harm, abuse, danger at home, bullying, or a threat to others.
- The tutor responds with a short, warm, scripted message encouraging the child to talk to a
  trusted adult. It does not ask probing questions or give advice.
- An alert goes immediately to the school's designated counselor per the school's own protocol.
- This path must work 100% of the time in testing before any pilot.
- The scripted wording is reviewed by school counselors, not written by AI.

### 6.6 Evaluation suite (`evals/`)
Run on every prompt, model, or pipeline change. **No deploy if any critical test fails.**
- "Just tell me the answer" pressure, in many phrasings.
- Off-topic and inappropriate requests.
- Wellbeing disclosures (critical: must escalate every time).
- Factual and math questions checked against answer keys.
- Reading-level compliance by grade.
- Attempts to make the tutor role-play, become a friend, or ignore its rules.
- Track pass rates over time in `evals/results/`.

---

## 7. Teacher tools and the "needs attention" assistant

### 7.1 Classroom controls
- View student screens during class (with visible indicator to students).
- Lock all screens for attention.
- Push a link or app to the class.
- Focus mode (limit to allowed apps and sites).
- Time-on-task overview.
- Create assignments, view submissions, review AI chats.

### 7.2 "Needs attention" assistant
**Purpose:** a teacher can't watch 25 kids at once. The assistant surfaces who might need help
right now so the teacher can walk over.

**Allowed signals (activity on our platform only):**
- Idle for an unusual stretch during an active task.
- Repeated attempts to open blocked apps or sites.
- Several wrong answers in a row on the same question.
- Many tutor hint requests, or tutor-detected confusion.
- Progress stalled compared with the student's own usual pace.

**Forbidden signals:** webcam, microphone, face, eye movement, emotion inference, typing-pattern
profiling, or anything outside our platform.

**Design rules:**
- Every alert shows a **plain-language reason** ("Stuck on question 4 for 6 minutes,
  3 hint requests"). No black-box scores.
- Framed as **"might need help,"** not "misbehaving."
- The teacher decides what to do. **No automated discipline or consequences.**
- Rate-limit alerts so teachers aren't flooded; group similar alerts ("5 students stuck on Q3").
- Alerts expire at the end of the class session. **No permanent off-task records.**
- Regular bias audits: check whether some groups (e.g., English learners, students with IEPs)
  are flagged disproportionately, and adjust.
- Wellbeing escalations are a separate channel to counselors (Section 6.5), never mixed into
  classroom alerts.

---

## 8. Legal and compliance requirements

> **Not legal advice.** This is a research summary to guide engineering. An edtech privacy
> attorney must review the product before any real student uses it. Laws are changing fast;
> re-check this section quarterly.

### 8.1 Federal (US)
- **COPPA** (children under 13). The FTC's amended rule took effect June 23, 2025, with full
  compliance required by April 22, 2026. Key changes: biometric identifiers count as personal
  information, separate consent for disclosing data to third parties, a written data retention
  policy, a written information security program, and more specific notices. The FTC did not
  codify a school-authorization exception; it continues to apply its existing guidance, under
  which a school may consent on parents' behalf **only for educational purposes, never commercial
  ones.** Home use on family devices outside school authorization may need verifiable parental consent.
- **FERPA** (education records). We operate as a "school official" under the district's direct
  control, with a contract specifying data use. Student records may not go to AI vendors without
  a valid exception and contract terms.
- **CIPA** (filtering for E-rate-funded schools). Our filtering and monitoring features help
  schools comply; we do not certify compliance for them.
- **PPRA** (surveys on sensitive topics). Avoid surveys or tutor questions about family, beliefs,
  or personal matters.
- **Section 504, IDEA, ADA:** accessibility for students with disabilities.
- **Federal AI policy:** the April 2025 executive order prioritizes AI in education; a December 2025
  executive order seeks to challenge state AI laws but explicitly carves out child-safety laws.
  Continue to comply with state laws as written.

### 8.2 State student privacy laws
- Nearly every state has student privacy laws, many modeled on California's SOPIPA: no targeted
  advertising, no selling student data, no building profiles for non-educational purposes,
  reasonable security, deletion on request.
- Many districts require a signed data privacy agreement (DPA). Use the Student Data Privacy
  Consortium's national DPA template where accepted.
- Specific laws to map first: California SOPIPA, New York Ed Law 2-d, Illinois SOPPA,
  and Massachusetts requirements for our home market.

### 8.3 State AI chatbot laws
- A wave of state laws regulate chatbots used by minors, including California SB 243
  (effective Jan 1, 2026), New York's AI Companion Models law (Nov 2025), Oregon SB 1546
  and Washington's Chatbot Disclosure Act (effective Jan 2027), Nebraska and Idaho
  (effective July 2027), and Tennessee's ban on AI posing as mental health professionals.
- Common requirements: clear AI disclosure, crisis protocols with referral to help, blocking
  sexual content, break reminders for minors, and annual reporting in some states.
  Several allow families to sue directly.
- Many of these target "companion" chatbots. Our tutor is designed not to be one, but
  **we adopt these protections as our baseline anyway**, and counsel must confirm which laws apply.

### 8.4 Monitoring precedent
- Student monitoring software has faced First and Fourth Amendment lawsuits (e.g., students suing
  Lawrence, Kansas schools over Gaggle in 2025), including complaints about flagged artwork and
  student journalism. Lessons for us: narrow scope, transparency to students and families, human
  review, no content deletion by AI, and clear district policies.

### 8.5 International (only if we expand)
- **EU AI Act:** emotion recognition in schools is prohibited; education uses like evaluating
  learning outcomes are "high-risk" with heavy obligations. Application dates for high-risk rules
  may have been postponed; verify before any EU launch.
- GDPR, UK Children's Code, and others would also apply.

### 8.6 Compliance artifacts we must maintain
- `docs/data-inventory.md` — every data field, purpose, retention, who can access it.
- COPPA direct notice for schools and parents.
- Written information security program.
- Data retention and deletion policy.
- Privacy policy written for parents in plain language.
- Template DPA and a completed security questionnaire.
- Accessibility conformance report (VPAT).
- Incident response and breach notification plan.
- Student Privacy Pledge signature.

### 8.7 Open questions for our attorney
1. Which state chatbot laws apply to a non-companion tutor?
2. Consent model for home mode on family-owned devices.
3. Whether the "needs attention" assistant creates FERPA education records, and retention rules.
4. Counselor escalation duties and mandated-reporter interactions by state.
5. Whether AI chat transcripts are education records parents can request.
6. Liability allocation with our LLM vendor.

---

## 9. Development rules

- **Build one small piece at a time.** Commit to git after each working step.
- **Read this file at the start of every session.** Update it when decisions change.
- **Security first, then features.** Row-level security and auth tests come before UI polish.
- **Tests required for:** access control (one student can never read another's data), retention
  and deletion jobs, the AI safety pipeline, and wellbeing escalation.
- **No new third-party SDK** in student clients without documenting what data it touches.
- **No real student data** until security review and legal sign-off (see Non-Negotiables).
- Prefer boring, proven tools over clever custom code for anything security-related.

---

## 10. Build order

1. Student "Today" screen and assignment view (mock data).
2. AI tutor on one sample assignment, with the full safety pipeline and eval suite.
3. Basic teacher dashboard: create assignments, see submissions, review AI chats.
4. Real login (Clever / ClassLink) and database with row-level security.
5. Classroom controls and the "needs attention" assistant.
6. Platform lockdown configs: ChromeOS kiosk, Windows Assigned Access, iPad MDM, Android launcher.
7. Home mode: phone layout, offline sync, parent portal.
8. External security audit and legal review.
9. Pilot in one or two classrooms with teachers who help design it.

Steps 1–3 make the teacher demo.

---

## 11. Still to decide

- Product name.
- Starting grade band (K–2 vs. 3–5).
- Starting platform for the demo (ChromeOS web vs. iPad).
- LLM vendor.
- Which states to launch in first (drives which laws we map in detail).