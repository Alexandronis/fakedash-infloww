// @ts-nocheck
import React, { useEffect, useState, useMemo, useRef } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import DraggableModule from "highcharts/modules/draggable-points";
import { useCreatorStats } from "../../context/CreatorStatsContext"; // Adjust path

// === VITE FIX: Initialize the module safely ===
if (typeof DraggableModule === "function") {
  DraggableModule(Highcharts);
} else if (typeof DraggableModule === "object" && (DraggableModule as any).default) {
  (DraggableModule as any).default(Highcharts);
}

type HighchartGraphProps = {
  containerId?: string;
};

// --- Helper to generate categories and initial data structure based on filters ---
const generateChartSetup = (dateRange: string, viewMode: "day" | "week") => {
  // This is a simple parser for your format "YYYY-MM-DD_YYYY-MM-DD"
  // In a real app, use date-fns or moment.js
  const [startStr, endStr] = dateRange.split("_");
  const startDate = new Date(startStr);
  const endDate = new Date(endStr);

  const categories: string[] = [];
  const dataPoints: { y: number }[] = [];

  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include start

  if (viewMode === "week") {
    // Simple logic: split into 7-day chunks
    let current = new Date(startDate);
    while (current < endDate) {
      const weekEnd = new Date(current);
      weekEnd.setDate(current.getDate() + 6);

      // Format: "Nov 30-Dec 6"
      const label = `${current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      categories.push(label);
      dataPoints.push({ y: 0 }); // Init with 0

      current.setDate(current.getDate() + 7);
    }
  } else {
    // Daily mode
    for (let i = 0; i < diffDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      categories.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      dataPoints.push({ y: 0 });
    }
  }

  // Safety fallback if calculation failed
  if (categories.length === 0) {
    return { categories: ["Week 1", "Week 2"], dataPoints: [{ y: 0 }, { y: 0 }] };
  }

  return { categories, dataPoints };
};

const HighchartGraph: React.FC<HighchartGraphProps> = ({ containerId }) => {
  const { stats, filters, updateTotalEarnings } = useCreatorStats();

  // Ref to access the latest update method inside Highcharts events (which are outside React render cycle)
  const updateCtxRef = useRef(updateTotalEarnings);
  useEffect(() => { updateCtxRef.current = updateTotalEarnings; }, [updateTotalEarnings]);

  const [chartOptions, setChartOptions] = useState<Highcharts.Options>({
    title: { text: "" },
    series: [],
    xAxis: { categories: [] }
  });

  // 1. Handle Structure Changes (DateRange / ViewMode)
  // We recreate the basic structure of the chart when filters change
  useEffect(() => {
    const { categories, dataPoints } = generateChartSetup(filters.dateRange, filters.viewMode);

    // Distribute the CURRENT total into these new points
    // If total is 100 and we have 2 points -> 50, 50.
    const count = dataPoints.length;
    const distributedVal = count > 0 ? stats.total / count : 0;
    const initialData = dataPoints.map(() => ({ y: Number(distributedVal.toFixed(2)) }));

    setChartOptions(prev => ({
      ...prev,
      xAxis: { ...prev.xAxis, categories: categories },
      series: [{
        type: "column",
        name: "Earnings",
        data: initialData,
        color: "#3467FF"
      }]
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.dateRange, filters.viewMode]);

  // 2. Handle Value Changes (Context Total -> Chart)
  // If context total changes (e.g. via input), we scale the chart bars
  useEffect(() => {
    setChartOptions(prev => {
      if (!prev.series || !prev.series[0] || !prev.series[0].data) return prev;

      const currentData = prev.series[0].data as { y: number }[];
      const currentChartSum = currentData.reduce((acc, p) => acc + (p.y || 0), 0);

      // Avoid infinite loop if values are close enough
      if (Math.abs(currentChartSum - stats.total) < 0.1) return prev;

      let newData;
      if (currentChartSum === 0) {
        // If chart was 0, distribute evenly
        const val = stats.total / currentData.length;
        newData = currentData.map(() => ({ y: Number(val.toFixed(2)) }));
      } else {
        // Scale proportionally
        const ratio = stats.total / currentChartSum;
        newData = currentData.map(p => ({ y: Number((p.y * ratio).toFixed(2)) }));
      }

      return {
        ...prev,
        series: [{ ...prev.series[0], data: newData }]
      };
    });
  }, [stats.total]);

  // 3. Static Options (Styling & Drag Logic)
  const staticOptions: Highcharts.Options = useMemo(() => ({
    chart: {
      type: "column",
      backgroundColor: "transparent",
      borderColor: "#334eff",
      marginTop: 60,
      style: { fontFamily: "'Segoe UI', sans-serif" },
      animation: false,
    },
    title: {
      text: `Earnings trends <button type="button" class="tooltip-custom"><img class="charts-title" alt="" src="/info-icon.png"></button>`,
      useHTML: true,
      align: "left",
      margin: 15,
      style: { color: "white", fontWeight: "500", fontSize: "16px" }
    },
    legend: { enabled: false },
    credits: { enabled: false },
    yAxis: [{
      min: 0,
      gridLineDashStyle: "Dash",
      gridLineColor: "#3e3e3e",
      title: { text: "" },
      labels: { style: { color: "#999999" } },
      tickInterval: 5,
    }],
    xAxis: [{
      lineColor: "#3e3e3e",
      tickColor: "#3e3e3e",
      labels: { style: { color: "#999999" } }
    }],
    tooltip: {
      enabled: true,
      backgroundColor: "#121212EE",
      style: { color: "#fff" },
      pointFormat: `<span style="color:{point.color}">●</span> {series.name}: <b>{point.y}</b><br/>`,
      valuePrefix: "$"
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
                // 1. Calculate new Y-Axis Max (Auto-scale)
                const chart = this.series.chart;
                const allY = this.series.data.map(p => (p.id === this.id ? e.newPoint.y : p.y));
                const maxVal = Math.max(...allY);
                let newMax = Math.ceil(maxVal / 5) * 5;
                if (newMax === maxVal) newMax += 5;
                if (newMax < 10) newMax = 10;
                if (newMax !== chart.yAxis[0].max) {
                  chart.yAxis[0].setExtremes(0, newMax);
                }

                // 2. UPDATE CONTEXT
                // Sum all bars (using the new value for the dragged point)
                const newTotalSum = allY.reduce((a, b) => a + b, 0);

                // Call context update (which will update child channels ratio)
                updateCtxRef.current(newTotalSum);
              }
            }
          }
        }
      },
      column: {
        borderColor: "#ffffff",
        borderWidth: 0,
        borderRadius: 1,
        maxPointWidth: 170,
        groupPadding: 0.15,
        color: "#3467FF"
      }
    }
  }), []);

  // Merge static options with dynamic data options
  const finalOptions = {
    ...staticOptions,
    ...chartOptions,
    xAxis: {
      ...staticOptions.xAxis![0],
      categories: chartOptions.xAxis?.categories || []
    }
  };

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={finalOptions}
      containerProps={containerId ? { id: containerId } : {}}
    />
  );
};

export default HighchartGraph;
