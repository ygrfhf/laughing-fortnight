/**
 * Every user-facing string in the student app lives here, so translations can be added
 * later as sibling files (es.ts, ...) that satisfy the same `Strings` shape.
 * Keep sentences short and at a K–2 reading level where children will see them.
 */
export const en = {
  app: {
    title: "My School Day",
  },
  today: {
    heading: "Today",
  },
};

export type Strings = typeof en;
