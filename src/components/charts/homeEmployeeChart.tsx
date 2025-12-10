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

  // CUSTOM MOCK TODAY: Dec 10, 2025
  const TODAY = new Date("2025-12-10T00:00:00");

  const chartData = useMemo(() => {
    let sourceData = stats.graphData || [];
    let displayData = [];
    let labels = [];
    let startFuncDate;

    if (timeFilter === "today") {
      const idx = 10;
      displayData = [sourceData[idx] || 0];
      labels = ["Today"];
      startFuncDate = new Date(TODAY);

    } else if (timeFilter === "yesterday") {
      const idx = 9;
      displayData = [sourceData[idx] || 0];
      labels = ["Yesterday"];
      startFuncDate = new Date(TODAY);
      startFuncDate.setDate(startFuncDate.getDate() - 1);

    } else if (timeFilter === "week") {
      // WEEK VIEW SCALING LOGIC
      // Target: Dec 7 - Dec 13
      startFuncDate = new Date("2025-12-07T00:00:00");
      const startIdx = 10;
      const endIdx = 16;

      // 1. Get Raw Data for Window
      let rawWindowData = [];
      for(let i=startIdx; i<=endIdx; i++) {
        if (i < sourceData.length) rawWindowData.push(sourceData[i]);
        else rawWindowData.push(0);
      }

      // 2. Sum Valid Days
      let validSum = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date(startFuncDate);
        d.setDate(d.getDate() + i);
        if (d <= TODAY) {
          validSum += rawWindowData[i];
        }
      }

      // 3. Calc Scale Factor
      let scaleFactor = 1;
      if (stats.total > 0 && validSum > 0) {
        scaleFactor = stats.total / validSum;
      }

      // 4. Apply
      displayData = rawWindowData.map((val, i) => {
        const d = new Date(startFuncDate);
        d.setDate(d.getDate() + i);
        if (d <= TODAY) return val * scaleFactor;
        return val;
      });

      for (let i = 0; i < 7; i++) {
        const d = new Date(startFuncDate);
        d.setDate(d.getDate() + i);
        labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }

    } else {
      // Month View
      const monthStart = new Date("2025-12-01T00:00:00");
      startFuncDate = monthStart;
      displayData = [];

      for (let i = 0; i < 31; i++) {
        const d = new Date(monthStart);
        d.setDate(d.getDate() + i);
        labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const sourceIdx = i + 1;
        if (sourceIdx >= 0 && sourceIdx < sourceData.length) {
          displayData.push(sourceData[sourceIdx]);
        } else {
          displayData.push(0);
        }
      }
    }

    const seriesData = displayData.map((val, idx) => {
      const pointDate = new Date(startFuncDate);
      pointDate.setDate(pointDate.getDate() + idx);
      pointDate.setHours(0,0,0,0);
      const isFuture = pointDate > TODAY;
      const globalIndex = Math.round((pointDate - new Date("2025-11-30T00:00:00")) / (1000 * 3600 * 24));

      return {
        y: Number(Number(val).toFixed(2)),
        dragDrop: { draggableY: !isFuture },
        globalIndex: globalIndex
      };
    });

    return { seriesData, labels };
  }, [stats.graphData, timeFilter, stats.total]);

  useEffect(() => {
    const labelStep = timeFilter.includes('month') ? 2 : 1;

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
        labels: {
          style: { color: "#999999", fontSize: "10px", textOverflow: "none" },
          y: 25,
          rotation: 0,
          autoRotation: false,
          step: labelStep
        },
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
          dragDrop: {
            draggableY: true,
            dragMinY: 0,
            dragPrecisionY: 1,
            dragSensitivity: 8,
            dragHandle: { lineColor: 'transparent', color: 'transparent' }
          },
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
  }, [chartData, timeFilter]);

  return <div id="employee-sales"><HighchartsReact highcharts={Highcharts} options={chartOptions} /></div>;
};

export default HomeEmployeeChart;
