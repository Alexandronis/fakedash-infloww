import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

// If you will use context, you can import it here

interface HighchartGraphProps {
  options: Highcharts.Options;
  // Add other props if needed, e.g. loading, filtered data, etc.
}

const HighchartGraph: React.FC<HighchartGraphProps> = ({ options }) => {
  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default HighchartGraph;
