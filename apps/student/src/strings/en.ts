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
    pageTitle: (screenName: string): string => `${screenName} – My School Day`,
  },
  common: {
    loading: "Loading…",
    loadError: "Something went wrong. Let's ask your teacher!",
  },
  nav: {
    backToToday: "Back to Today",
    seeWhatsNext: "See what's next",
  },
  assignment: {
    aboutMinutes: (minutes: number): string => `About ${minutes} minutes`,
    stepsHeading: "What to do",
    markDone: "I'm done!",
    saving: "Saving…",
    doneHeading: "You finished it!",
    notDoneYet: "Oops, I'm not done yet",
    saveError: "That didn't save. Let's ask your teacher!",
    notFound: "We couldn't find that work.",
  },
  today: {
    heading: "Today",
    greeting: (firstName: string): string => `Hi, ${firstName}!`,
    rightNowHeading: "Right now",
    noClassNow: "No class right now",
    withTeacher: (teacherName: string): string => `with ${teacherName}`,
    nextStepHeading: "Your next step",
    /** 3–5 only: extra detail under the next step's title. */
    stepDetails: (className: string, minutes: number): string => `${className}, about ${minutes} minutes`,
    start: "Start",
    /** Accessible name for the Start link; must begin with `start` (WCAG 2.5.3). */
    startLabel: (title: string): string => `Start ${title}`,
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

// Developer toolbar wording lives in ./dev-en.ts so production builds drop it.
