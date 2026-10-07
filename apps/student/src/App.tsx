import { useState } from "react";
import { useDataSource } from "./data/DataSourceProvider";
import { routeToHash, useRoute } from "./router";
import { AssignmentScreen } from "./screens/assignment/AssignmentScreen";
import { FocusHeadingProvider } from "./screens/PageHeading";
import { TodayScreen } from "./screens/today/TodayScreen";

export function App() {
  // Fail loudly at startup if the app is wired without a data source.
  useDataSource();

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

  return (
    <FocusHeadingProvider value={hasNavigated}>
      {/* key: each route gets a fresh screen, so data reloads and headings remount. */}
      <main className="lf-page" key={routeKey}>
        {route.name === "assignment" ? <AssignmentScreen assignmentId={route.assignmentId} /> : <TodayScreen />}
      </main>
    </FocusHeadingProvider>
  );
}
