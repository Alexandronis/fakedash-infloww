// @ts-nocheck
import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import DraggableModule from "highcharts/modules/draggable-points";

// Initialize module safely
if (typeof DraggableModule === "function") {
  DraggableModule(Highcharts);
} else if (typeof DraggableModule === "object" && (DraggableModule as any).default) {
  (DraggableModule as any).default(Highcharts);
}

type HighchartGraphProps = {
  containerId?: string;
  options?: Highcharts.Options;
};

const earningsOptions: Highcharts.Options = {
  colors: [
    "#2b908f", "#90ee7e", "#f45b5b", "#7798BF", "#aaeeee",
    "#ff0066", "#eeaaee", "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"
  ],
  chart: {
    type: "column",
    backgroundColor: "transparent",
    borderColor: "#334eff",
    plotBorderColor: "#606063",
    spacing: [10, 10, 15, 10],
    marginTop: 60,
    style: { fontFamily: "'Segoe UI', sans-serif" },
    animation: false,
    zooming: {
      singleTouch: false,
      resetButton: {
        theme: { zIndex: 6 },
        position: { align: "right", x: -10, y: 10 }
      }
    }
  },
  title: {
    text: `Earnings trends <button type="button" class="tooltip-custom"><img class="charts-title" alt="" src="/info-icon.png"></button>`,
    useHTML: true,
    align: "left",
    margin: 15,
    style: {
      color: "white",
      fontWeight: "500",
      fontSize: "16px",
      textTransform: "none"
    }
  },
  subtitle: {
    style: { color: "#E0E0E3", fontSize: "0.8em", textTransform: "uppercase" },
    text: ""
  },
  caption: {
    text: "",
    margin: 15,
    align: "left",
    verticalAlign: "bottom",
    style: { color: "#666666", fontSize: "0.8em" }
  },
  legend: { enabled: false },
  credits: { enabled: false },
  xAxis: [{
    categories: ["Nov 30-Dec 6", "Dec 7-13"],
    lineColor: "#3e3e3e",
    lineWidth: 1,
    tickmarkPlacement: "on",
    title: { align: "middle", style: { color: "#A0A0A3", fontSize: "0.8em" } },
    labels: {
      style: { color: "#999999", cursor: "default", fontSize: "0.8em" }
    },
    gridLineColor: "#707073",
    margin: 15,
    tickColor: "#3e3e3e",
    tickLength: 5,
    tickWidth: 1,
    tickInterval: 1
  }],
  yAxis: [{
    min: 0,
    title: { text: "", style: { color: "#444444", fontSize: "0.8em" } },
    labels: {
      style: { color: "#999999", cursor: "default", fontSize: "0.8em" },
      x: -5,
      y: 3
    },
    gridLineDashStyle: "Dash",
    gridLineColor: "#3e3e3e",
    gridLineWidth: 1,
    lineColor: "#707073",
    lineWidth: 0,
    tickColor: "#707073",
    // CHANGED: Smaller interval so the axis doesn't need to jump by 10s
    tickInterval: 5,
    endOnTick: true
  }],
  tooltip: {
    enabled: true,
    backgroundColor: "#121212EE",
    style: {
      color: "#fff",
      cursor: "default",
      fontSize: "0.8em",
      lineHeight: "20px"
    },
    useHTML: true,
    shared: true,
    animation: { duration: 300 },
    borderRadius: 5,
    borderColor: "#808080",
    borderWidth: 1,
    shadow: false,
    padding: 10,
    pointFormat: `<span style="color:{point.color}">●</span> {series.name}: <b>{point.y}</b><br/>`,
    headerFormat: `<span style="font-size: 0.8em">{point.key}</span><br/>`,
    followPointer: true
  },
  plotOptions: {
    series: {
      dragDrop: {
        draggableY: true,
        dragMinY: 0,
        dragPrecisionY: 0.01,
      },
      stickyTracking: false,
      allowPointSelect: true,
      point: {
        events: {
          drop: function (e) {
            if (e.newPoint) {
              const chart = this.series.chart;

              // 1. Get all points including the new dragged value
              const allY = this.series.data.map(p => (p.id === this.id ? e.newPoint.y : p.y));
              const maxVal = Math.max(...allY);

              // 2. Snap to the next multiple of 5 (e.g. 12 -> 15, 16 -> 20)
              // This prevents adding huge buffers like +10 or +100
              let newMax = Math.ceil(maxVal / 5) * 5;

              // If the value is exactly on the line, add one step of breathing room
              if (newMax === maxVal) newMax += 5;

              // Ensure minimum height of 10
              if (newMax < 10) newMax = 10;

              // Only update if it actually changed
              if (newMax !== chart.yAxis[0].max) {
                chart.yAxis[0].setExtremes(0, newMax);
              }
            }
          }
        }
      }
    },
    column: {
      cursor: 'ns-resize',
      borderColor: "#ffffff",
      borderWidth: 0,
      borderRadius: 1,
      maxPointWidth: 170,
      groupPadding: 0.15,
      pointPadding: 0.001,
      states: {
        hover: { brightness: 0.1, color: "#3971FF" },
        select: { color: "#cccccc", borderColor: "#000000" }
      },
      color: "#3467FF"
    }
  },
  series: [{
    name: "Earnings",
    type: "column",
    color: "#3467FF",
    data: [{ y: 8.75 }, { y: 0 }],
    animation: false,
    dataLabels: { enabled: false }
  }]
};

const HighchartGraph: React.FC<HighchartGraphProps> = ({ containerId }) => {
  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={earningsOptions}
      containerProps={containerId ? { id: containerId } : {}}
    />
  );
};

export default HighchartGraph;
