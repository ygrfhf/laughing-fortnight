import type { ReactElement } from "react";
import { render, type RenderResult } from "@testing-library/react";
import { ClockProvider } from "../clock/ClockProvider";
import { DataSourceProvider } from "../data/DataSourceProvider";
import type { StudentDataSource } from "../data/student-data-source";
import type { GradeBand } from "../domain/grade-band";
import { createMockDataSource, MOCK_STUDENT_IDS } from "../mock-data/mock-data-source";
import { GradeBandProvider } from "../settings/GradeBandProvider";
import { FontSettingProvider } from "../settings/FontSetting";
import { ReadAloudSettingProvider } from "../settings/ReadAloudSetting";

export const TEST_TODAY = "2026-10-06";

/** A local time on TEST_TODAY, e.g. at("09:30"). */
export function at(time: string): Date {
  return new Date(2026, 9, 6, Number(time.slice(0, 2)), Number(time.slice(3, 5)));
}

export function mockSource(studentId: string = MOCK_STUDENT_IDS.k2): StudentDataSource {
  return createMockDataSource({ studentId, today: TEST_TODAY, now: () => at("12:00") });
}

interface Options {
  source?: StudentDataSource;
  time?: string;
  /** Force a grade band; by default it comes from the student's grade (Testy: K–2). */
  band?: GradeBand;
  /** Turn on read-aloud in 3–5 (future teacher-set accommodation). Off by default. */
  readAloudIn35?: boolean;
  /** Turn on the dyslexia-friendly font. Off by default. */
  dyslexiaFont?: boolean;
}

export function renderWithProviders(
  ui: ReactElement,
  { source = mockSource(), time = "09:30", band, readAloudIn35 = false, dyslexiaFont = false }: Options = {},
): RenderResult {
  return render(
    <DataSourceProvider source={source}>
      <ClockProvider now={() => at(time)}>
        <GradeBandProvider override={band ?? null}>
          <ReadAloudSettingProvider enabledIn35={readAloudIn35}>
            <FontSettingProvider dyslexiaFont={dyslexiaFont}>{ui}</FontSettingProvider>
          </ReadAloudSettingProvider>
        </GradeBandProvider>
      </ClockProvider>
    </DataSourceProvider>,
  );
}
