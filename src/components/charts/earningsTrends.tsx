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

type HighchartGraphProps = { containerId?: string; };

const generateCategories = (dateRange: string, viewMode: "day" | "week") => {
  const [startStr, endStr] = dateRange.split("_");
  const startDate = new Date(startStr);
  const endDate = new Date(endStr);
  const categories: string[] = [];

  if (viewMode === "week") {
    let current = new Date(startDate);
    while (current <= endDate) {
      if (categories.length > 100) break;
      const weekEnd = new Date(current);
      weekEnd.setDate(current.getDate() + 6);
      const finalEnd = weekEnd > endDate ? endDate : weekEnd;
      const label = `${current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${finalEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      categories.push(label);
      current.setDate(current.getDate() + 7);
    }
  } else {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    for (let i = 0; i < diffDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      categories.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
  }
  if (categories.length === 0) return ["Week 1", "Week 2"];
  return categories;
};

const HighchartGraph: React.FC<HighchartGraphProps> = ({ containerId }) => {
  const { stats, filters, updateGraphColumn } = useCreatorStats();
  const updateCtxRef = useRef(updateGraphColumn);
  useEffect(() => { updateCtxRef.current = updateGraphColumn; }, [updateGraphColumn]);

  const viewModeRef = useRef(filters.viewMode);
  useEffect(() => { viewModeRef.current = filters.viewMode; }, [filters.viewMode]);

  const statsRef = useRef(stats);
  useEffect(() => { statsRef.current = stats; }, [stats]);

  // Ref to the actual chart instance
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  const [chartOptions, setChartOptions] = useState<Highcharts.Options>({ series: [], xAxis: { categories: [] } });

  useEffect(() => {
    const categories = generateCategories(filters.dateRange, filters.viewMode);
    const rawData = stats.graphData || [];

    let displayData = [];

    if (filters.viewMode === "week") {
      if (rawData.length <= 7) {
        displayData = [rawData.reduce((a,b)=>a+b, 0)];
      } else {
        const week1 = rawData.slice(0, 7).reduce((a,b)=>a+b, 0);
        const week2 = rawData.slice(7, 14).reduce((a,b)=>a+b, 0);
        displayData = [week1, week2];
      }
    } else {
      displayData = rawData;
    }

    const seriesData = displayData.map(val => ({ y: Number(val.toFixed(2)) }));

    // Dynamic Scale
    const maxVal = Math.max(...seriesData.map(d => d.y), 0);
    let niceMax = Math.ceil(maxVal * 1.1) || 10;

    // FORCE UPDATE EXTREMES DIRECTLY (Bypasses React State Lag)
    if (chartComponentRef.current && chartComponentRef.current.chart) {
      chartComponentRef.current.chart.yAxis[0].setExtremes(0, niceMax, true, false);
    }

    setChartOptions(prev => ({
      ...prev,
      xAxis: { ...prev.xAxis, categories: categories, max: categories.length - 1 },
      yAxis: {
        ...prev.yAxis,
        max: niceMax, // State update ensures next render is correct
        tickAmount: 5,
        tickInterval: null,
        endOnTick: true
      },
      series: [{ type: "column", name: "Earnings", data: seriesData, color: "#3467FF" }]
    }));
  }, [filters.dateRange, filters.viewMode, stats.graphData]);

  const staticOptions: Highcharts.Options = useMemo(() => ({
    chart: { type: "column", backgroundColor: "transparent", borderColor: "#334eff", marginTop: 10, style: { fontFamily: "'Segoe UI', sans-serif" }, animation: false },
    title: { text: "" }, legend: { enabled: false }, credits: { enabled: false },
    yAxis: {
      min: 0,
      gridLineDashStyle: "Dash",
      gridLineColor: "#3e3e3e",
      title: { text: "" },
      labels: { style: { color: "#999999" } }
    },
    xAxis: { lineColor: "#3e3e3e", tickColor: "#3e3e3e", labels: { style: { color: "#999999" } }, crosshair: { width: 1, color: '#FFFFFF', dashStyle: 'Dash', zIndex: 5 }, tickInterval: 1 },
    tooltip: {
      enabled: true, backgroundColor: "#121212EE", style: { color: "#fff", cursor: "default", fontSize: "16px", lineHeight: "20px" },
      borderColor: "#808080", borderWidth: 1, borderRadius: 5, followPointer: true, followTouchMove: true, padding: 10, shadow: false, shape: "callout", shared: true, snap: 0, stickOnContact: false,
      formatter: function () {
        const point = this.point;
        const index = point.index;
        const dateLabel = this.series.xAxis.categories[index];
        const prevPoint = this.series.points[index - 1];
        let growthText = "—";
        if (prevPoint && prevPoint.y > 0) {
          const prev = prevPoint.y;
          const curr = point.y;
          const growth = ((curr - prev) / prev) * 100;
          growthText = `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`;
        }
        return `<span>&nbsp;${dateLabel}</span><br/><span>${this.series.name}: $${point.y}</span><br/>Growth: ${growthText}`;
      }
    },
    plotOptions: {
      series: {
        dragDrop: {
          draggableY: true,
          dragMinY: 0,
          dragPrecisionY: 1,
          dragSensitivity: 1,
          // MUST be true for infinite feel
          liveRedraw: true,
          dragHandle: { color: 'transparent', lineColor: 'transparent' }
        },
        stickyTracking: false, allowPointSelect: true,
        point: {
          events: {
            // === INFINITE DRAG LOGIC ===
            drag: function (e) {
              if (e.newPoint) {
                const chart = this.series.chart;
                const currentMax = chart.yAxis[0].max;
                const val = e.newPoint.y;

                // If near top
                if (val > currentMax * 0.95) {
                  // OPTION 1: LINEAR GROWTH (Steady)
                  // Adds 10% of the current scale, or at least 100 units
                  const step = Math.max(currentMax * 0.05, 100);
                  const newMax = currentMax + step;

                  // OPTION 2: DAMPENED EXPONENTIAL (Slower Curve)
                  // const newMax = val * 1.05;

                  chart.yAxis[0].setExtremes(0, newMax, true, false);
                }
              }
            },
            drop: function (e) {
              if (e.newPoint) {
                const newVal = e.newPoint.y;
                const mode = viewModeRef.current;

                // Final sync with context (logic remains same)
                if (mode === "day") {
                  updateCtxRef.current(this.index, newVal);
                } else {
                  // Week Mode Logic... (same as before)
                  const startIdx = this.index * 7;
                  const MOCK_TODAY = new Date("2025-12-03T23:59:59");
                  const rangeStart = new Date("2025-11-27T00:00:00");
                  const currentDailyData = statsRef.current.graphData || [];
                  let validIndices = [];
                  let currentSum = 0;
                  for(let i=0; i<7; i++) {
                    const d = new Date(rangeStart);
                    d.setDate(d.getDate() + startIdx + i);
                    if (d <= MOCK_TODAY) {
                      const absIdx = startIdx + i;
                      validIndices.push(absIdx);
                      currentSum += (currentDailyData[absIdx] || 0);
                    }
                  }
                  if (validIndices.length > 0) {
                    if (currentSum === 0) {
                      const dailyVal = newVal / validIndices.length;
                      validIndices.forEach(idx => updateCtxRef.current(idx, dailyVal));
                    } else {
                      const ratio = newVal / currentSum;
                      validIndices.forEach(idx => {
                        const oldVal = currentDailyData[idx] || 0;
                        updateCtxRef.current(idx, oldVal * ratio);
                      });
                    }
                  }
                }
              }
            }
          }
        }
      },
      column: {
        borderColor: "#ffffff",
        borderWidth: 0,
        borderRadius: 1,
        pointWidth: 158, // Fixed width as requested
        maxPointWidth: 170,
        color: "#3467FF"
      }
    }
  }), []);

  const finalOptions = {
    ...staticOptions,
    ...chartOptions,
    xAxis: { ...staticOptions.xAxis, categories: chartOptions.xAxis?.categories || [], crosshair: { width: 1, color: '#FFFFFF', dashStyle: 'Dash', zIndex: 5 } }
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ paddingLeft: "34px", marginTop: "7px", marginBottom: "31px", zIndex: 10, color: "white", fontSize: "16px", fontWeight: 500, fontFamily: "'Segoe UI', sans-serif", display: "flex", alignItems: "center" }}>
        Earnings trends
        <button type="button" className="tooltip-custom" style={{ position: "relative", marginLeft: "8px", background: "none", border: "none", padding: 0, cursor: "pointer" }}>
          <img className="charts-title" alt="" src="/info-icon.png" style={{ display: "block", height: "15px", width: "15px", marginLeft: "3px" }} />
        </button>
      </div>
      <HighchartsReact
        highcharts={Highcharts}
        options={finalOptions}
        ref={chartComponentRef} // ATTACH REF
        containerProps={containerId ? { id: containerId } : {}}
      />
    </div>
  );
};

export default HighchartGraph;
