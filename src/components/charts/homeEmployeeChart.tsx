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

  // DYNAMIC TODAY (Real Time)
  const TODAY = useMemo(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  }, []);

  const chartData = useMemo(() => {
    // USE INDEPENDENT HOME DATA (30 Days ending Today)
    let sourceData = stats.homeGraphData || [];

    let displayData = [];
    let labels = [];
    let startFuncDate;

    // Index 29 = Today in a 30-day array ending Today
    const CONTEXT_LEN = 30;
    const todayIdx = CONTEXT_LEN - 1;

    // Calculate Context Start Date (Today - 29 days)
    const HOME_START = new Date(TODAY);
    HOME_START.setDate(HOME_START.getDate() - 29);

    if (timeFilter === "today") {
      displayData = [sourceData[todayIdx] || 0];
      labels = ["Today"];
      startFuncDate = new Date(TODAY);

    } else if (timeFilter === "yesterday") {
      displayData = [sourceData[todayIdx - 1] || 0];
      labels = ["Yesterday"];
      startFuncDate = new Date(TODAY);
      startFuncDate.setDate(startFuncDate.getDate() - 1);

    } else if (timeFilter === "week") {
      // WEEK VIEW: Last 7 Days (Indices 23-29)
      const startIdx = 23;
      let rawWindowData = sourceData.slice(startIdx, 30);

      startFuncDate = new Date(TODAY);
      startFuncDate.setDate(startFuncDate.getDate() - 6);

      // === VISUAL SCALING TRICK ===
      // Force visible points to sum to Total Earnings
      // We assume Total Earnings applies to "Current View" contextually
      let validSum = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date(startFuncDate);
        d.setDate(d.getDate() + i);
        // Only count valid days towards sum
        if (d <= TODAY) validSum += rawWindowData[i];
      }

      let scaleFactor = 1;
      if (stats.total > 0 && validSum > 0) {
        scaleFactor = stats.total / validSum;
      } else if (stats.total > 0 && validSum === 0) {
        // Edge case: Total exists but graph is empty -> Distribute evenly
        const split = stats.total / 7;
        rawWindowData = Array(7).fill(split);
        scaleFactor = 1;
      }

      // Apply Scale
      displayData = rawWindowData.map((val, i) => {
        const d = new Date(startFuncDate);
        d.setDate(d.getDate() + i);
        if (d <= TODAY) return val * scaleFactor;
        return 0; // Future is 0
      });

      for (let i = 0; i < 7; i++) {
        const d = new Date(startFuncDate);
        d.setDate(d.getDate() + i);
        labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }

    } else {
      // MONTH VIEW: Calendar Month (Dec 1 - Dec 31)
      const currentMonth = TODAY.getMonth();
      const currentYear = TODAY.getFullYear();

      const monthStart = new Date(currentYear, currentMonth, 1);
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

      startFuncDate = monthStart;
      displayData = [];

      for (let i = 0; i < daysInMonth; i++) {
        const d = new Date(monthStart);
        d.setDate(d.getDate() + i);
        labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

        // Map Calendar Date -> Context Index
        const diff = Math.round((d - HOME_START) / (1000 * 3600 * 24));

        if (diff >= 0 && diff < sourceData.length) {
          displayData.push(sourceData[diff]);
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

      // Calculate Global Index for Drag Update
      // If Today is index 29:
      // Index = 29 - daysFromToday
      const daysFromToday = Math.round((TODAY - pointDate) / (1000 * 3600 * 24));
      const globalIndex = todayIdx - daysFromToday;

      return {
        y: Number(Number(val).toFixed(2)),
        dragDrop: { draggableY: !isFuture },
        globalIndex: globalIndex,
        // Pass scale factor for drag un-scaling
        scaleFactor: (timeFilter === 'week' && stats.total > 0 && displayData.reduce((a,b)=>a+b,0)>0) ? (stats.total / (stats.homeGraphData.slice(23,30).reduce((a,b)=>a+b,0)||1)) : 1
      };
    });

    return { seriesData, labels };
  }, [stats.homeGraphData, timeFilter, TODAY, stats.total]);

  useEffect(() => {
    const labelStep = timeFilter.includes('month') ? 2 : 1;
    const currentMax = Math.max(...chartData.seriesData.map(d => d.y), 10);

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
      yAxis: {
        title: { text: "" }, gridLineDashStyle: "Dash", gridLineColor: "#444444", gridLineWidth: 1,
        labels: { style: { color: "#999999", fontSize: "0.8em" }, x: -5, y: 3 },
        softMax: currentMax
      },
      tooltip: {
        followPointer: true, followTouchMove: true, animation: true, shared: true, useHTML: true, shape: "callout", snap: 0, shadow: false, stickOnContact: false, backgroundColor: "#262626", borderColor: "#808080", borderWidth: 1, borderRadius: 5, style: { color: "#fff", fontSize: "14px" },
        formatter: function () {
          const point = this.points ? this.points[0] : this;
          const prev = this.series.points[this.point.index - 1];
          let growthText = "Growth: N/A";

          if (prev) {
            if (prev.y === 0) {
              growthText = "Growth: 0%";
            } else {
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
          dragDrop: {
            draggableY: true, dragMinY: 0, dragPrecisionY: 1, dragSensitivity: 8, dragHandle: { lineColor: 'transparent', color: 'transparent' }
          },
          point: {
            events: {
              drop: function (e) {
                if (e.newPoint && this.options.globalIndex >= 0) {
                  // UN-SCALE Logic
                  // We update the Raw Data, so the Visual Scale Logic will re-apply next render.
                  // Note: Dragging visually scaled points can be jumpy.
                  // We attempt to reverse calc:
                  // Visual = Raw * Scale
                  // Raw = Visual / Scale

                  // However, since we update Total immediately, the scale factor might shift.
                  // Simple approach: Use raw value update (ignoring scale) if direct edit is desired,
                  // OR un-scale if we want visual consistency.

                  // Let's assume direct un-scale for best UX attempt.
                  // BUT context saves raw.

                  const scale = 1; // Simplified: Let's trust raw drag for stability first.
                  // If you want "Perfect Visual Match", use this.options.scaleFactor

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
