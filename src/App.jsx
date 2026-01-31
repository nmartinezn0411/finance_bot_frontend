import { useMemo, useState } from "react";
import { getBootstrapFromQuery } from "./utils/queryBootstrap";
import { TopNav } from "./components/layout/TopNav";

import FormPage from "./pages/FormPage";
import StatsPage from "./pages/StatsPage";

export default function App() {
  const bootstrap = useMemo(() => getBootstrapFromQuery(), []);
  const [activeTab, setActiveTab] = useState("form");

  return (
    <div className="container py-3">
      <TopNav
        active={activeTab}
        onChange={setActiveTab}
        canShowStats={!!bootstrap.monthlyStatistics}
      />

      {activeTab === "form" ? (
        <FormPage bootstrap={bootstrap} />
      ) : (
        <StatsPage bootstrap={bootstrap} />
      )}
    </div>
  );
}
