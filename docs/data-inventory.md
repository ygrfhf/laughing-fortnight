# Data Inventory

Every data field the product holds about students (and the staff data shown to them), why we
need it, how long we keep it, and who can see it. Required by CLAUDE.md Sections 2 and 8.6 and
`.claude/rules/child-safety.md`. **Add a row here in the same change that adds a field.**

**All staff access to any student data in this inventory is audit-logged** (teachers,
counselors, school admin, IT), whatever the field. The student's own access and their
parent/guardian's access to their own child are not staff access.

**Current status (build step 1):** fake mock data only, held in browser memory. Nothing is
persisted, sent to a server, or written to browser storage. A page reload or the next student
on a shared device starts fresh. The "Retention (production)" column records the intended
policy for when the real backend exists; each value needs legal sign-off before any real
student data is collected.

Source of truth for types: `apps/student/src/data/types.ts`.

## Student

| Field | Purpose (educational) | Retention (step 1) | Retention (production, proposed) | Who can access |
|---|---|---|---|---|
| `id` | Link the student to their classes and progress | Memory only | While enrolled; deleted with the account per district retention policy | The student; their teachers; school admin |
| `firstName` | Friendly greeting on the Today screen | Memory only | While enrolled | The student; their teachers; their parent/guardian |
| `gradeLevel` | Choose the grade-adaptive UI (K–2 vs. 3–5) and reading level | Memory only | While enrolled | The student; their teachers; school admin |
| `classIds` | Show only the student's own classes and assignments | Memory only | While enrolled (from rostering: Clever / ClassLink) | The student; their teachers; school admin |

**Deliberately not collected:** email, photo, birthday, address, phone, last name (not needed
for the Today screen), any demographic data, device identifiers, location.

## Assignment progress (per student)

In production, each progress row is stored with the `studentId` it belongs to, taken from the
signed-in session on the server, and row-level security uses that column. The client
interface (`StudentDataSource`) has no `studentId` parameter, so the client can never choose
or change whose progress it reads or writes.

| Field | Purpose (educational) | Retention (step 1) | Retention (production, proposed) | Who can access |
|---|---|---|---|---|
| `assignmentId` | Which assignment the record is about | Memory only | End of school year + district policy | The student; their teachers; their parent/guardian |
| `status` (`not_started` / `in_progress` / `done`) | Show progress made today; pick the next step | Memory only | End of school year + district policy | The student; their teachers; their parent/guardian |
| `completedAt` | Order completed work; let the teacher see when work was finished. Never used to rank or compare students by speed. | Memory only | End of school year + district policy | The student; their teachers; their parent/guardian |

"Oops, I'm not done yet" (`markNotDone`) sets `status` back to `not_started` and deletes
`completedAt`. No history of these changes is kept.

Not a behavior score or time-on-task measure. No "late," "behind," or comparison fields.

## Reading preferences (planned, not yet collected)

**Status: NOT YET COLLECTED.** Today these are dev-toolbar settings held in memory only and
never stored. This entry records the plan (CLAUDE.md Section 11) so the fields are reviewed
before any are added.

| Field (planned) | Purpose (educational) | Retention (production, proposed) | Who can access (proposed) |
|---|---|---|---|
| `readingPreferences.dyslexiaFriendlyFont` (boolean) | Show text in OpenDyslexic, about 10% smaller | While enrolled; deleted with the account | The student; their teachers; school admin. Not parents' view of other children; never in analytics. |
| `readingPreferences.readAloudIn35` (boolean) | Offer read-aloud buttons in grades 3–5 | While enrolled; deleted with the account | Same as above |

Design rules for these fields:
- Set by the teacher, stored with the student's account on the backend, never in browser
  storage (school devices are shared).
- Named and shown as general reading preferences any student can have, not as disability
  accommodations, so the setting does not reveal a disability, IEP, or 504 plan. No link to
  IEP/504 records is stored here.
- Access restricted to the people listed above; staff access audit-logged like all student
  data.

## Class-level data shown to students (not student data)

| Data | Fields | Notes |
|---|---|---|
| Class | `id`, `name`, `subject`, `teacherDisplayName` | Teacher display name only (e.g. "Ms. Sample"); no staff email or contact details reach the student client. |
| Schedule item | `id`, `kind`, `classId`, `title`, `start`, `end` | The homeroom's daily schedule. Not per-student. |
| Assignment | `id`, `classId`, `title`, `steps`, `estimatedMinutes`, `dueDate` | Authored by teachers. Contains no student data. |

## Data that leaves the device

| Data | Destination | Purpose |
|---|---|---|
| (none) | | |

Currently nothing leaves the device: there is no backend, analytics, or third-party service.
Read-aloud (K–2, tap-only) uses on-device speech synthesis voices only (`localService ===
true`, matching the page language), and always sets that voice explicitly instead of the
browser default. If no on-device voice is available the read-aloud button is hidden, so text
is never sent to a cloud speech service. It never uses the microphone and records nothing.
Covered by unit tests and the Playwright spec `apps/student/e2e/read-aloud.spec.ts`.

## Device-local data

| Data | Where | Purpose | Retention |
|---|---|---|---|
| (none yet) | | | |

Planned (later steps): UI preferences such as the dyslexia-friendly font will be decided per
CLAUDE.md before any browser storage is used, because school devices are shared.
