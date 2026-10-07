import { useState } from "react";
import { useDataSource } from "./data/DataSourceProvider";
import { routeToHash, useRoute } from "./router";
import { AssignmentScreen } from "./screens/assignment/AssignmentScreen";
import { BreakPrompt } from "./screens/BreakPrompt";
import { FocusHeadingProvider } from "./screens/PageHeading";
import { TodayScreen } from "./screens/today/TodayScreen";
import { useGradeBand } from "./settings/GradeBandProvider";

export function App() {
  // Fail loudly at startup if the app is wired without a data source.
  useDataSource();

  const gradeBand = useGradeBand();
  const route = useRoute();
  const routeKey = routeToHash(route);

  // After the first in-app navigation, each new screen's heading takes focus.
  // (State adjusted during render so it is set before the new screen's effects run.)
  const [previousKey, setPreviousKey] = useState(routeKey);
  const [hasNavigated, setHasNavigated] = useState(false);
  if (previousKey !== routeKey) {
    setPreviousKey(routeKey);
    setHasNavigated(true);
  }

  // Memory only: on a shared device the next student starts with a fresh break timer.
  const [lastBreakTime, setLastBreakTime] = useState<string | null>(null);

  return (
    <FocusHeadingProvider value={hasNavigated}>
      {/* data-grade-band switches the K–2 / 3–5 design tokens for everything inside. */}
      <div className="lf-app" data-grade-band={gradeBand}>
        {/* key: each route gets a fresh screen, so data reloads and headings remount. */}
        <main className="lf-page" key={routeKey}>
          <BreakPrompt lastBreakTime={lastBreakTime} onDismiss={setLastBreakTime} />
          {route.name === "assignment" ? <AssignmentScreen assignmentId={route.assignmentId} /> : <TodayScreen />}
        </main>
      </div>
    </FocusHeadingProvider>
  );
}
