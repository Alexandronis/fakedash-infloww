// @ts-nocheck
import React from "react";
import HighchartGraph from "../../components/charts/earningsTrends.tsx";
import EarningsSummary from "../../components/creatorPage/EarningsSummary.tsx";
import TopFilters from "../../components/creatorPage/TopFilters.tsx";
import CreatorStatistics from "../../components/creatorPage/CreatorStatistics.tsx";
import "./creator.scss";

const CreatorPage: React.FC = () => {
  return (
    <div className="creator-content">
      <div className="header-title">
        <h2>Creator Reports</h2>
      </div>
      <TopFilters />
      <div className="col-12">
        <EarningsSummary />
      </div>
      <HighchartGraph containerId="earnings-chart" />
      <CreatorStatistics />
    </div>
  );
};

export default CreatorPage;
