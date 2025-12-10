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

// Helper: Only generate categories for Nov 27 - Dec 3 (7 days)
const generateCategories = (viewMode: "day" | "week") => {
  // Hardcoded target range for Creator Page: Nov 27 - Dec 3
  const startStr = "2025-11-27";
  const startDate = new Date(startStr);
  const categories: string[] = [];

  if (viewMode === "week") {
    // 1 Week Label
    // Nov 27 - Dec 3
    const weekEnd = new Date(startDate);
    weekEnd.setDate(startDate.getDate() + 6);
    const label = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    categories.push(label);
  } else {
    // 7 Days
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      categories.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
  }
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

  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  const [chartOptions, setChartOptions] = useState<Highcharts.Options>({ series: [], xAxis: { categories: [] } });

  useEffect(() => {
    // 1. Generate Categories (Strict 7 Days)
    const categories = generateCategories(filters.viewMode);

    // 2. Get Raw Data (17 Days in Context)
    const rawData = stats.graphData || [];

    // 3. Slice Data (Strict Nov 27 - Dec 3 -> Indices 0 to 6)
    // We assume context starts at Nov 27 based on V23 update
    let displayData = [];

    // Slice first 7 days
    const creatorData = rawData.slice(0, 7);

    // Pad if context is empty/short
    if (creatorData.length < 7) {
      const diff = 7 - creatorData.length;
      for(let k=0; k<diff; k++) creatorData.push(0);
    }

    if (filters.viewMode === "week") {
      // Aggregate 7 days -> 1 Week Column
      const weekSum = creatorData.reduce((a,b)=>a+b, 0);
      displayData = [weekSum];
    } else {
      displayData = creatorData;
    }

    const seriesData = displayData.map(val => ({ y: Number(val.toFixed(2)) }));

    // Dynamic Scale
    const maxVal = Math.max(...seriesData.map(d => d.y), 0);
    let niceMax = Math.ceil(maxVal * 1.1) || 10;

    // Force Update Axis
    if (chartComponentRef.current && chartComponentRef.current.chart) {
      chartComponentRef.current.chart.yAxis[0].setExtremes(0, niceMax, true, false);
    }

    setChartOptions(prev => ({
      ...prev,
      xAxis: { ...prev.xAxis, categories: categories, max: categories.length - 1 },
      yAxis: {
        ...prev.yAxis,
        max: niceMax,
        tickAmount: 5,
        tickInterval: null,
        endOnTick: true
      },
      series: [{ type: "column", name: "Earnings", data: seriesData, color: "#3467FF" }]
    }));
  }, [filters.viewMode, stats.graphData]); // removed filters.dateRange dep since we hardcode logic to Nov 27

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
          liveRedraw: true,
          dragHandle: { color: 'transparent', lineColor: 'transparent' }
        },
        stickyTracking: false, allowPointSelect: true,
        point: {
          events: {
            drag: function (e) {
              if (e.newPoint) {
                const chart = this.series.chart;
                const currentMax = chart.yAxis[0].max;
                const val = e.newPoint.y;
                if (val > currentMax * 0.95) {
                  const step = Math.max(currentMax * 0.05, 100);
                  const newMax = currentMax + step;
                  chart.yAxis[0].setExtremes(0, newMax, true, false);
                }
              }
            },
            drop: function (e) {
              if (e.newPoint) {
                const newVal = e.newPoint.y;
                const mode = viewModeRef.current;

                // Visual Rescale
                const chart = this.series.chart;
                const currentData = this.series.data.map(p => p.y);
                currentData[this.index] = newVal;
                const newMaxVal = Math.max(...currentData, 0);
                const newNiceMax = Math.ceil(newMaxVal * 1.1) || 10;
                if (newNiceMax !== chart.yAxis[0].max) chart.yAxis[0].setExtremes(0, newNiceMax);

                if (mode === "day") {
                  // Direct update (Indices 0-6 match context 0-6)
                  updateCtxRef.current(this.index, newVal);
                } else {
                  // WEEK MODE (Aggregate Drag)
                  // Distribute to indices 0-6
                  const dailyVal = newVal / 7;
                  const currentDailyData = statsRef.current.graphData || [];
                  const validIndices = [0,1,2,3,4,5,6]; // All 7 days are valid in this view
                  const currentSum = currentDailyData.slice(0, 7).reduce((a,b)=>a+b, 0);

                  if (currentSum === 0) {
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
      },
      column: {
        borderColor: "#ffffff",
        borderWidth: 0,
        borderRadius: 1,
        // Responsive Width Logic
        maxPointWidth: 170,
        groupPadding: 0.05,
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
        ref={chartComponentRef}
        containerProps={containerId ? { id: containerId } : {}}
      />
    </div>
  );
};

export default HighchartGraph;
