import "@laughing-fortnight/ui/styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ClockProvider } from "./clock/ClockProvider";
import { DataSourceProvider } from "./data/DataSourceProvider";
import { toIsoDate } from "./data/dates";
import { createMockDataSource, MOCK_STUDENT_IDS } from "./mock-data/mock-data-source";
import { DevShell } from "./settings/DevShell";
import { GradeBandProvider } from "./settings/GradeBandProvider";
import { en as strings } from "./strings/en";

// Mock data only until real login and the backend exist (CLAUDE.md build step 4).
// The demo defaults to the K–2 student (CLAUDE.md Section 11).
const dataSource = createMockDataSource({
  studentId: MOCK_STUDENT_IDS.k2,
  today: toIsoDate(new Date()),
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Missing #root element in index.html");
}

document.title = strings.app.title;

// import.meta.env.DEV is replaced at build time, so the dev toolbar is removed from
// production builds entirely (checked by grepping the build output).
const app = import.meta.env.DEV ? (
  <DevShell>
    <App />
  </DevShell>
) : (
  <ClockProvider>
    <GradeBandProvider override={null}>
      <App />
    </GradeBandProvider>
  </ClockProvider>
);

createRoot(rootElement).render(
  <StrictMode>
    <DataSourceProvider source={dataSource}>{app}</DataSourceProvider>
  </StrictMode>,
);
