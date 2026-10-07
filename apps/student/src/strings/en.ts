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
  },
};

export type Strings = typeof en;
