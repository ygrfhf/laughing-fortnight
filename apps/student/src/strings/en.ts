/**
 * Every user-facing string in the student app lives here, so translations can be added
 * later as sibling files (es.ts, ...) that satisfy the same `Strings` shape.
 * Keep sentences short and at a K–2 reading level where children will see them.
 *
 * Content that comes from the data source (class names, schedule titles, assignment text)
 * is not here: it is authored by teachers and arrives from the backend.
 */
export const en = {
  app: {
    title: "My School Day",
  },
  common: {
    loading: "Loading…",
    loadError: "Something went wrong. Let's ask your teacher!",
  },
  today: {
    heading: "Today",
    greeting: (firstName: string): string => `Hi, ${firstName}!`,
    rightNowHeading: "Right now",
    noClassNow: "No class right now",
    withTeacher: (teacherName: string): string => `with ${teacherName}`,
    nextStepHeading: "Your next step",
    allDone: "All done for today!",
    classFinished: (className: string): string =>
      `You finished your ${className} work! Ask your teacher what to do next.`,
    progressHeading: "What you did today",
    /** Always encouraging. Never "behind", "late", or comparisons with other students. */
    progressSummary: (done: number, total: number): string => {
      if (total === 0) return "Nothing is due today.";
      if (done === 0) return "Let's get started!";
      if (done === total) return `You did all ${total} things today!`;
      return `You did ${done} of ${total} things today!`;
    },
  },
};

export type Strings = typeof en;
