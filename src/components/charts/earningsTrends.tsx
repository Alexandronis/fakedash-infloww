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
      if (categories.length > 52) break;
      const weekEnd = new Date(current);
      weekEnd.setDate(current.getDate() + 6);
      const label = `${current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
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
    const categories = generateCategories(filters.dateRange, filters.viewMode);
    const rawData = stats.graphData || [];

    let displayData = [];

    if (filters.viewMode === "week") {
      const weeks = [];
      for(let i=0; i<rawData.length; i+=7) {
        const chunk = rawData.slice(i, i+7);
        weeks.push(chunk.reduce((a,b)=>a+b, 0));
      }
      displayData = weeks;
    } else {
      displayData = rawData;
    }

    const seriesData = displayData.map(val => ({ y: Number(val.toFixed(2)) }));

    const maxVal = Math.max(...seriesData.map(d => d.y), 0);
    let niceMax = Math.ceil(maxVal * 1.1) || 10;

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
  }, [filters.dateRange, filters.viewMode, stats.graphData]);

  const staticOptions: Highcharts.Options = useMemo(() => ({
    chart: { type: "column", backgroundColor: "transparent", borderColor: "#334eff", marginTop: 10, style: { fontFamily: "'Segoe UI', sans-serif" }, animation: false },
    title: { text: "" }, legend: { enabled: false }, credits: { enabled: false },
    yAxis: {
      min: 0,
      gridLineDashStyle: "Dash",
      gridLineColor: "#3e3e3e",
      title: { text: "" },
      labels: {
        style: { color: "#999999" },
        formatter: function () {
          return Highcharts.numberFormat(this.value, 0, '.', ',');
        }
      }
    },
    xAxis: { lineColor: "#3e3e3e", tickColor: "#3e3e3e", labels: { style: { color: "#999999" } }, crosshair: { width: 1, color: '#FFFFFF', dashStyle: 'Dash', zIndex: 5 }, tickInterval: 1 },

    // === TOOLTIP ===
    tooltip: {
      enabled: true,
      backgroundColor: "#121212EE",
      style: { color: "#fff", cursor: "default", fontSize: "16px", lineHeight: "20px" },
      borderColor: "#808080", borderWidth: 1, borderRadius: 5,
      followPointer: true, followTouchMove: true, padding: 10, shadow: false, shape: "callout", shared: true, snap: 0, stickOnContact: false,
      formatter: function () {
        const point = this.point;
        const index = point.index;
        const dateLabel = this.series.xAxis.categories[index];
        const prevPoint = this.series.points[index - 1];
        let growthText = "0.00%";
        if (prevPoint && prevPoint.y > 0) {
          const prev = prevPoint.y;
          const curr = point.y;
          const growth = ((curr - prev) / prev) * 100;
          growthText = `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`;
        }
        return `<span>&nbsp;${dateLabel}</span><br/><span>${this.series.name}: $${point.y}</span><br/>Growth: ${growthText}`;
      }
    },
    // ==========================================

    plotOptions: {
      series: {
        dragDrop: {
          draggableY: true,
          dragMinY: 0,
          dragPrecisionY: 0.01,
          dragHandle: {
            // 1. Make the line 40px thick (creates a 20px hit area above & below edge)
            lineWidth: 40,

            // 2. Use 1% opacity (invisible to eye, but catches the mouse).
            // 'transparent' often fails to catch clicks.
            lineColor: 'rgba(255, 255, 255, 0.01)',
            color: 'rgba(255, 255, 255, 0.01)',

            // 3. Force the resize cursor so you know you can click
            cursor: 'ns-resize',
            zIndex: 100 // Ensure it sits on top of everything
          }
        },
        stickyTracking: false, // Critical: stops tooltip from blocking dragging

        allowPointSelect: true,
        point: {
          events: {
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
                  updateCtxRef.current(this.index, newVal);
                } else {
                  // WEEK MODE
                  const startIdx = this.index * 7;
                  const endIdx = startIdx + 7;
                  const currentDailyData = statsRef.current.graphData || [];
                  const validIndices = [];
                  let currentSum = 0;

                  for(let i=startIdx; i<endIdx; i++) {
                    if (i < currentDailyData.length) {
                      validIndices.push(i);
                      currentSum += currentDailyData[i];
                    }
                  }

                  if (validIndices.length > 0) {
                    if (currentSum === 0) {
                      const dailyVal = newVal / validIndices.length;
                      validIndices.forEach(idx => updateCtxRef.current(idx, dailyVal));
                    } else {
                      const ratio = newVal / currentSum;
                      validIndices.forEach(idx => {
                        updateCtxRef.current(idx, currentDailyData[idx] * ratio);
                      });
                    }
                  }
                }
              }
            }
          }
        }
      },
      column: { borderColor: "#ffffff", borderWidth: 0, borderRadius: 1, maxPointWidth: 170, groupPadding: 0.05, color: "#3467FF" }
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
      <HighchartsReact highcharts={Highcharts} options={finalOptions} ref={chartComponentRef} containerProps={containerId ? { id: containerId } : {}} />
    </div>
  );
};

export default HighchartGraph;
