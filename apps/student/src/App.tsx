import { useDataSource } from "./data/DataSourceProvider";
import { TodayScreen } from "./screens/today/TodayScreen";

export function App() {
  // Fail loudly at startup if the app is wired without a data source.
  useDataSource();

  return (
    <main className="lf-page">
      <TodayScreen />
    </main>
  );
}
