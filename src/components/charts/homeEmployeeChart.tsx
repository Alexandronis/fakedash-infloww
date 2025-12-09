// @ts-nocheck
import React, { useEffect, useState, useMemo, useRef } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import DraggableModule from "highcharts/modules/draggable-points";
import { useCreatorStats } from "../../context/CreatorStatsContext";

if (typeof DraggableModule === "function") {
  DraggableModule(Highcharts);
} else if (typeof DraggableModule === "object" && (DraggableModule as any).default) {
  (DraggableModule as any).default(Highcharts);
}

interface HomeEmployeeChartProps {
  timeFilter: string;
}

const HomeEmployeeChart: React.FC<HomeEmployeeChartProps> = ({ timeFilter }) => {
  const { stats, updateGraphColumn } = useCreatorStats();
  const updateRef = useRef(updateGraphColumn);
  useEffect(() => { updateRef.current = updateGraphColumn; }, [updateGraphColumn]);

  const [chartOptions, setChartOptions] = useState<Highcharts.Options>({});

  // CUSTOM MOCK TODAY: Dec 9, 2025
  const TODAY = new Date("2025-12-09T00:00:00");

  const chartData = useMemo(() => {
    let sourceData = stats.graphData || [];
    let displayData = [];
    let labels = [];
    let startFuncDate;

    // === MAPPING LOGIC ===
    // We assume Context Data [0, 1, 2...] starts at Dec 7.
    // Index 0 = Dec 7
    // Index 1 = Dec 8
    // Index 2 = Dec 9 (Today)

    if (timeFilter === "today") {
      // Show Dec 9 (Index 2)
      const idx = 2;
      displayData = [sourceData[idx] || 0];
      labels = ["Today"];
      startFuncDate = new Date(TODAY);

    } else if (timeFilter === "yesterday") {
      // Show Dec 8 (Index 1)
      const idx = 1;
      displayData = [sourceData[idx] || 0];
      labels = ["Yesterday"];
      startFuncDate = new Date(TODAY);
      startFuncDate.setDate(startFuncDate.getDate() - 1);

    } else if (timeFilter === "week") {
      // Show Dec 7 - Dec 13
      startFuncDate = new Date("2025-12-07T00:00:00");

      for (let i = 0; i < 7; i++) {
        const d = new Date(startFuncDate);
        d.setDate(d.getDate() + i);
        labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

        // Map Day i (0..6) to Context Index i (0..6)
        // But only valid if d <= TODAY (Dec 9) -> Indices 0, 1, 2
        if (d <= TODAY && i < sourceData.length) {
          displayData.push(sourceData[i]);
        } else {
          displayData.push(0);
        }
      }

    } else {
      // Month View (Dec 1 - Dec 31)
      const monthStart = new Date("2025-12-01T00:00:00");
      startFuncDate = monthStart;

      for (let i = 0; i < 31; i++) {
        const d = new Date(monthStart);
        d.setDate(d.getDate() + i);
        labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

        // Map Date to Context Index
        // Dec 1 is 6 days BEFORE Dec 7. So index -6.
        // Dec 7 is index 0.
        const diffTime = d.getTime() - new Date("2025-12-07T00:00:00").getTime();
        const index = Math.round(diffTime / (1000 * 3600 * 24));

        if (index >= 0 && index < sourceData.length && d <= TODAY) {
          displayData.push(sourceData[index]);
        } else {
          displayData.push(0);
        }
      }
    }

    // === MAP TO SERIES ===
    const seriesData = displayData.map((val, idx) => {
      const pointDate = new Date(startFuncDate);
      pointDate.setDate(pointDate.getDate() + idx);
      pointDate.setHours(0,0,0,0);

      const isFuture = pointDate > TODAY;

      return {
        y: Number(Number(val).toFixed(2)),
        dragDrop: { draggableY: !isFuture },
        // Calc global index relative to Dec 7 start
        globalIndex: Math.round((pointDate - new Date("2025-12-07T00:00:00"))/(1000*3600*24))
      };
    });

    return { seriesData, labels };
  }, [stats.graphData, timeFilter]);

  useEffect(() => {
    const options: Highcharts.Options = {
      chart: { type: "areaspline", backgroundColor: "transparent", borderColor: "#334eff", marginTop: 80, style: { fontFamily: "Inter, sans-serif" }, animation: false },
      title: {
        useHTML: true,
        text: `<div style="font-family: 'Inter'; color: white; font-weight: 500; font-size: 15px; display: flex; align-items: center; margin-top: 10px; margin-left: 0;">Employee sales <button class="tooltip-custom" style="position: relative; margin-left: 14px; background: none; border: none; padding: 0; cursor: pointer;margin-top: 1px;"><img src="/info-icon.png" style="width: 15px; height: 15px; display: block;" /></button></div>`,
        align: "left", x: 5
      },
      legend: { enabled: false },
      credits: { enabled: false },
      xAxis: {
        categories: chartData.labels,
        lineColor: "#E6E6E6",
        lineWidth: 0,
        tickColor: "transparent",
        labels: { style: { color: "#999999", fontSize: "0.8em" }, y: 25, rotation: 0, autoRotation: false },
        gridLineColor: "#707073",
      },
      yAxis: { title: { text: "" }, gridLineDashStyle: "Dash", gridLineColor: "#444444", gridLineWidth: 1, labels: { style: { color: "#999999", fontSize: "0.8em" }, x: -5, y: 3 } },
      tooltip: {
        shared: true, useHTML: true, backgroundColor: "#262626", borderColor: "#808080", borderRadius: 5, style: { color: "#fff", fontSize: "0.8em" },
        formatter: function () {
          const point = this.points ? this.points[0] : this;
          return `<div style="padding: 5px;"><div style="margin-bottom: 4px; font-weight: bold;">${point.key}</div><div>Earnings: <b>$${point.y.toFixed(2)}</b></div></div>`;
        }
      },
      plotOptions: {
        areaspline: {
          lineWidth: 5, color: "#3467FF", fillColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, "rgba(255, 255, 255, 0.1)"], [1, "rgba(255, 255, 255, 0.0)"]] },
          marker: { enabled: true, radius: 6, fillColor: "#FFFFFF", lineColor: "#3467FF", lineWidth: 2, states: { hover: { radius: 8, lineWidth: 3 } } },
          dragDrop: { draggableY: true, dragMinY: 0, dragPrecision: 1, dragHandle: { lineColor: 'transparent', color: 'transparent' } },
          point: {
            events: {
              drop: function (e) {
                if (e.newPoint && this.options.globalIndex >= 0) {
                  updateRef.current(this.options.globalIndex, e.newPoint.y);
                }
              }
            }
          }
        }
      },
      series: [{ name: "Sales", data: chartData.seriesData }]
    };
    setChartOptions(options);
  }, [chartData]);

  return <div id="employee-sales"><HighchartsReact highcharts={Highcharts} options={chartOptions} /></div>;
};

export default HomeEmployeeChart;
