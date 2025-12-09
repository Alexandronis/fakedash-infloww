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

  // We need access to filters inside the chart event closure
  const viewModeRef = useRef(filters.viewMode);
  useEffect(() => { viewModeRef.current = filters.viewMode; }, [filters.viewMode]);

  // We also need access to current graphData inside closure to do smart scaling if desired
  // But for now let's do simple distribution to avoid complexity

  const [chartOptions, setChartOptions] = useState<Highcharts.Options>({ series: [], xAxis: { categories: [] } });

  useEffect(() => {
    const categories = generateCategories(filters.dateRange, filters.viewMode);
    const rawData = stats.graphData || []; // Daily 14 points

    let displayData = [];

    if (filters.viewMode === "week") {
      // AGGREGATE Daily -> Weekly (2 Bars)
      const week1 = rawData.slice(0, 7).reduce((a,b)=>a+b, 0);
      const week2 = rawData.slice(7, 14).reduce((a,b)=>a+b, 0);
      displayData = [week1, week2];
    } else {
      displayData = rawData;
    }

    const seriesData = displayData.map(val => ({ y: Number(val.toFixed(2)) }));

    setChartOptions(prev => ({
      ...prev,
      xAxis: { ...prev.xAxis, categories: categories },
      series: [{ type: "column", name: "Earnings", data: seriesData, color: "#3467FF" }]
    }));
  }, [filters.dateRange, filters.viewMode, stats.graphData]);

  const staticOptions: Highcharts.Options = useMemo(() => ({
    chart: { type: "column", backgroundColor: "transparent", borderColor: "#334eff", marginTop: 10, style: { fontFamily: "'Segoe UI', sans-serif" }, animation: false },
    title: { text: "" }, legend: { enabled: false }, credits: { enabled: false },
    yAxis: { min: 0, gridLineDashStyle: "Dash", gridLineColor: "#3e3e3e", title: { text: "" }, labels: { style: { color: "#999999" } }, tickInterval: 5 },
    xAxis: { lineColor: "#3e3e3e", tickColor: "#3e3e3e", labels: { style: { color: "#999999" } }, crosshair: { width: 1, color: '#FFFFFF', dashStyle: 'Dash', zIndex: 5 } },
    tooltip: {
      enabled: true,
      backgroundColor: "#121212EE",
      style: {
        color: "#fff",
        cursor: "default",
        fontSize: "16px",
        lineHeight: "20px",
      },
      borderColor: "#808080",    // ← white border
      borderWidth: 1,          // ← thickness
      borderRadius: 5,
      followPointer: true,
      followTouchMove: true,
      padding: 10,
      shadow: false,
      shape: "callout",
      shared: true,
      snap: 0,
      stickOnContact: false,

      formatter: function () {
        const point = this.point;
        const index = point.index;

        // Category date text (e.g. "Dec 7")
        const dateLabel = this.series.xAxis.categories[index];

        // Calculate growth vs previous point
        const prevPoint = this.series.points[index - 1];
        let growthText = "—";
        if (prevPoint) {
          const prev = prevPoint.y;
          const curr = point.y;
          const growth = ((curr - prev) / prev) * 100;
          growthText = `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`;
        }

        return `
      <span>&nbsp;${dateLabel}</span><br/>
      <span>${this.series.name}: $${point.y}</span><br/>
      Growth: ${growthText}
    `;
      }
    },
    plotOptions: {
      series: {
        dragDrop: { draggableY: true, dragMinY: 0, dragPrecisionY: 0.01, dragHandle: { color: 'transparent', lineColor: 'transparent' } },
        stickyTracking: false, allowPointSelect: true,
        point: {
          events: {
            drop: function (e) {
              if (e.newPoint) {
                const newVal = e.newPoint.y;
                const mode = viewModeRef.current;

                if (mode === "day") {
                  // Direct update
                  updateCtxRef.current(this.index, newVal);
                } else {
                  // WEEK MODE DRAG LOGIC
                  // 1. Determine which 7 days correspond to this bar
                  // Bar 0 -> Indices 0-6
                  // Bar 1 -> Indices 7-13
                  const startIdx = this.index * 7;

                  // 2. Distribute New Weekly Total to the 7 days
                  // We need to check valid days to avoid putting money in future
                  // But for simplicity and consistency with HomeChart, let's verify date
                  const MOCK_TODAY = new Date("2025-12-08T23:59:59");
                  const rangeStart = new Date("2025-11-30T00:00:00");

                  // Count valid days in this week
                  let validIndices = [];
                  for(let i=0; i<7; i++) {
                    const d = new Date(rangeStart);
                    d.setDate(d.getDate() + startIdx + i);
                    if (d <= MOCK_TODAY) validIndices.push(startIdx + i);
                  }

                  if (validIndices.length > 0) {
                    const dailyVal = newVal / validIndices.length;

                    // Update all valid days
                    // NOTE: Calling this in a loop might trigger re-renders.
                    // Ideally context handles batch updates, but this works.
                    validIndices.forEach(idx => {
                      updateCtxRef.current(idx, dailyVal);
                    });

                    // Force 0 for invalid days in this week (if any)
                    for(let i=0; i<7; i++) {
                      const absIdx = startIdx + i;
                      if (!validIndices.includes(absIdx)) {
                        updateCtxRef.current(absIdx, 0);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      column: { borderColor: "#ffffff", borderWidth: 0, borderRadius: 1, maxPointWidth: 170, groupPadding: 0.15, color: "#3467FF" }
    }
  }), []);

  const finalOptions = {
    ...staticOptions,
    ...chartOptions,
    xAxis: {
      ...staticOptions.xAxis,
      categories: chartOptions.xAxis?.categories || [],
      crosshair: {
        width: 1,
        color: '#FFFFFF',
        dashStyle: 'Dash',
        zIndex: 5
      }
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ paddingLeft: "34px", marginTop: "7px", marginBottom: "31px", zIndex: 10, color: "white", fontSize: "16px", fontWeight: 500, fontFamily: "'Segoe UI', sans-serif", display: "flex", alignItems: "center" }}>
        Earnings trends
        <button type="button" className="tooltip-custom" style={{ position: "relative", marginLeft: "8px", background: "none", border: "none", padding: 0, cursor: "pointer" }}>
          <img className="charts-title" alt="" src="/info-icon.png" style={{ display: "block", height: "15px", width: "15px", marginLeft: "3px" }} />
        </button>
      </div>
      <HighchartsReact highcharts={Highcharts} options={finalOptions} containerProps={containerId ? { id: containerId } : {}} />
    </div>
  );
};

export default HighchartGraph;
