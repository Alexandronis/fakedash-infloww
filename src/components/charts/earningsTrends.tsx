import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

type HighchartGraphProps = {
  options: Highcharts.Options;
  containerId?: string;
};

const HighchartGraph: React.FC<HighchartGraphProps> = ({ options, containerId }) => (
  <HighchartsReact
    highcharts={Highcharts}
    options={options}
    containerProps={containerId ? { id: containerId } : {}}
  />
);

export default HighchartGraph;
