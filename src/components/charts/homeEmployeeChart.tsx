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
  const { stats, updateHomeGraphColumn } = useCreatorStats();
  const updateRef = useRef(updateHomeGraphColumn);
  useEffect(() => { updateRef.current = updateHomeGraphColumn; }, [updateHomeGraphColumn]);

  const [chartOptions, setChartOptions] = useState<Highcharts.Options>({});

  // DYNAMIC TODAY
  const TODAY = useMemo(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  }, []);

  const chartData = useMemo(() => {
    let sourceData = stats.homeGraphData || [];
    let displayData = [];
    let labels = [];
    let startFuncDate;

    // Context Data: Last 30 Days ending Today
    // Index 29 = Today. Index 0 = Today - 29 days.
    const CONTEXT_LEN = 30;
    const contextEndIndex = CONTEXT_LEN - 1;

    // Helper: Map a specific Date to the Context Array Index
    // If date is outside "Last 30 Days", returns -1 (invalid)
    const getContextIndex = (targetDate) => {
      const diffTime = targetDate.getTime() - TODAY.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
      // Today is at index 29. Yesterday is 28. Future is > 29.
      const idx = contextEndIndex + diffDays;
      if (idx >= 0 && idx < CONTEXT_LEN) return idx;
      return -1;
    };

    if (timeFilter === "today") {
      const idx = getContextIndex(TODAY);
      displayData = [idx >= 0 ? sourceData[idx] : 0];
      labels = ["Today"];
      startFuncDate = new Date(TODAY);

    } else if (timeFilter === "yesterday") {
      const yest = new Date(TODAY);
      yest.setDate(yest.getDate() - 1);
      const idx = getContextIndex(yest);
      displayData = [idx >= 0 ? sourceData[idx] : 0];
      labels = ["Yesterday"];
      startFuncDate = yest;

    } else if (timeFilter === "week") {
      // Last 7 days ending Today
      startFuncDate = new Date(TODAY);
      startFuncDate.setDate(startFuncDate.getDate() - 6);

      for(let i=0; i<7; i++) {
        const d = new Date(startFuncDate);
        d.setDate(d.getDate() + i);
        labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

        const idx = getContextIndex(d);
        if (idx >= 0) displayData.push(sourceData[idx]);
        else displayData.push(0);
      }

    } else {
      // MONTH VIEW: Current Calendar Month (e.g. Dec 1 - Dec 31)
      const currentMonth = TODAY.getMonth();
      const currentYear = TODAY.getFullYear();

      const monthStart = new Date(currentYear, currentMonth, 1);
      // Last day of month
      const monthEnd = new Date(currentYear, currentMonth + 1, 0);
      const totalDays = monthEnd.getDate(); // e.g. 31

      startFuncDate = monthStart;
      displayData = [];

      for (let i = 0; i < totalDays; i++) {
        const d = new Date(monthStart);
        d.setDate(d.getDate() + i);
        labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

        const idx = getContextIndex(d);
        if (idx >= 0) displayData.push(sourceData[idx]);
        else displayData.push(0);
      }
    }

    const seriesData = displayData.map((val, idx) => {
      const pointDate = new Date(startFuncDate);
      pointDate.setDate(pointDate.getDate() + idx);
      pointDate.setHours(0,0,0,0);

      const isFuture = pointDate > TODAY;
      const globalIndex = getContextIndex(pointDate);

      return {
        y: Number(Number(val).toFixed(2)),
        dragDrop: { draggableY: !isFuture },
        globalIndex: globalIndex
      };
    });

    return { seriesData, labels };
  }, [stats.homeGraphData, timeFilter, TODAY]);

  useEffect(() => {
    const labelStep = timeFilter.includes('month') ? 2 : 1;
    // ... (rest of useEffect is identical) ...
    // Copying just the necessary parts to ensure completeness
    const currentMax = Math.max(...chartData.seriesData.map(d => d.y), 10);

    const options: Highcharts.Options = {
      chart: { type: "areaspline", backgroundColor: "transparent", borderColor: "#334eff", marginTop: 80, style: { fontFamily: "Inter, sans-serif" }, animation: false },
      title: { useHTML: true, text: `<div style="font-family: 'Inter'; color: white; font-weight: 500; font-size: 15px; display: flex; align-items: center; margin-top: 10px; margin-left: 0;">Employee sales <button class="tooltip-custom" style="position: relative; margin-left: 14px; background: none; border: none; padding: 0; cursor: pointer;margin-top: 1px;"><img src="/info-icon.png" style="width: 15px; height: 15px; display: block;" /></button></div>`, align: "left", x: 5 },
      legend: { enabled: false }, credits: { enabled: false },
      xAxis: { categories: chartData.labels, lineColor: "#E6E6E6", lineWidth: 0, tickColor: "transparent", labels: { style: { color: "#999999", fontSize: "10px", textOverflow: "none" }, y: 25, rotation: 0, autoRotation: false, step: labelStep }, gridLineColor: "#707073" },
      yAxis: { title: { text: "" }, gridLineDashStyle: "Dash", gridLineColor: "#444444", gridLineWidth: 1, labels: { style: { color: "#999999", fontSize: "0.8em" }, x: -5, y: 3 }, softMax: currentMax },
      tooltip: {
        followPointer: true, followTouchMove: true, animation: true, shared: true, useHTML: true, shape: "callout", snap: 0, shadow: false, stickOnContact: false, backgroundColor: "#262626", borderColor: "#808080", borderWidth: 1, borderRadius: 5, style: { color: "#fff", fontSize: "14px" },
        formatter: function () {
          const point = this.points ? this.points[0] : this;
          const prev = this.series.points[this.point.index - 1];
          let growthText = "Growth: N/A";
          if (prev) {
            if (prev.y === 0) growthText = "Growth: 0%";
            else {
              const diff = point.y - prev.y;
              const pct = (diff / prev.y) * 100;
              const sign = diff >= 0 ? "+" : "";
              growthText = `Growth: ${sign}${pct.toFixed(2)}%`;
            }
          }

          return `<div style="padding: 5px; transition: opacity 0.15s ease;">
            <div style="margin-bottom: 4px; font-weight: bold;">${point.key}</div>
            <div>Earnings: $${point.y.toFixed(2)} ${growthText}</div>
          </div>`;
        }
      },
      plotOptions: {
        areaspline: {
          lineWidth: 5, color: "#3467FF", fillColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [
              [0, "rgba(80, 80, 80, 0.25)"],
              [1, "rgba(80, 80, 80, 0.05)"]
            ] },
          marker: { enabled: true, radius: 6, fillColor: "#FFFFFF", lineColor: "#3467FF", lineWidth: 2, states: { hover: { radius: 8, lineWidth: 3 } } },
          dragDrop: { draggableY: true, dragMinY: 0, dragPrecisionY: 1, dragSensitivity: 8, dragHandle: { lineColor: 'transparent', color: 'transparent' } },
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
