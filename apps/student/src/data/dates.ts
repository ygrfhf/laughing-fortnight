const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad2 = (n: number): string => String(n).padStart(2, "0");

/** The local calendar date of `date` as "YYYY-MM-DD" (school days follow local time, not UTC). */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Adds whole calendar days to a "YYYY-MM-DD" date. */
export function addDays(isoDate: string, days: number): string {
  const match = ISO_DATE.exec(isoDate);
  if (!match) {
    throw new Error(`Expected a date in YYYY-MM-DD format, got "${isoDate}"`);
  }
  const [, year, month, day] = match;
  return toIsoDate(new Date(Number(year), Number(month) - 1, Number(day) + days));
}
