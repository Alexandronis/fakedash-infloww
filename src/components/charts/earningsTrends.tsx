// @ts-nocheck
import React, { useEffect, useState, useMemo, useRef } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import DraggableModule from "highcharts/modules/draggable-points";
import { useCreatorStats } from "../../context/CreatorStatsContext";

// === VITE FIX: Initialize the module safely ===
if (typeof DraggableModule === "function") {
  DraggableModule(Highcharts);
} else if (typeof DraggableModule === "object" && (DraggableModule as any).default) {
  (DraggableModule as any).default(Highcharts);
}

type HighchartGraphProps = {
  containerId?: string;
};

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

  const [chartOptions, setChartOptions] = useState<Highcharts.Options>({
    series: [],
    xAxis: { categories: [] }
  });

  useEffect(() => {
    const categories = generateCategories(filters.dateRange, filters.viewMode);
    let currentData = stats.graphData || [];
    if (currentData.length !== categories.length) {
      currentData = Array(categories.length).fill(0);
    }
    const seriesData = currentData.map(val => ({ y: val }));

    setChartOptions(prev => ({
      ...prev,
      xAxis: { ...prev.xAxis, categories: categories },
      series: [{
        type: "column",
        name: "Earnings",
        data: seriesData,
        color: "#3467FF"
      }]
    }));
  }, [filters.dateRange, filters.viewMode, stats.graphData]);

  const staticOptions: Highcharts.Options = useMemo(() => ({
    chart: {
      type: "column",
      backgroundColor: "transparent",
      borderColor: "#334eff",
      // Removed large marginTop since header is now relative flow
      marginTop: 10,
      style: { fontFamily: "'Segoe UI', sans-serif" },
      animation: false,
    },
    title: { text: "" }, // Disabled internal title
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
      labels: { style: { color: "#999999" } },
      // Vertical Dashed Line
      crosshair: {
        width: 1,
        color: '#FFFFFF',
        dashStyle: 'Dash',
        zIndex: 5
      }
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
          // Hide the drag handle circle
          dragHandle: {
            color: 'transparent',
            lineColor: 'transparent'
          }
        },
        stickyTracking: false,
        allowPointSelect: true,
        point: {
          events: {
            drop: function (e) {
              if (e.newPoint) {
                const chart = this.series.chart;
                const allY = this.series.data.map(p => (p.id === this.id ? e.newPoint.y : p.y));
                const maxVal = Math.max(...allY);
                let newMax = Math.ceil(maxVal / 5) * 5;
                if (newMax === maxVal) newMax += 5;
                if (newMax < 10) newMax = 10;
                if (newMax !== chart.yAxis[0].max) {
                  chart.yAxis[0].setExtremes(0, newMax);
                }
                updateCtxRef.current(this.index, e.newPoint.y);
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

  const finalOptions = {
    ...staticOptions,
    ...chartOptions,
    xAxis: {
      ...staticOptions.xAxis![0],
      categories: chartOptions.xAxis?.categories || []
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* 1) Custom Header with your specific styles */}
      <div style={{
        paddingLeft: "34px",
        marginTop: "7px",
        marginBottom: "31px",
        zIndex: 10,
        color: "white",
        fontSize: "16px",
        fontWeight: 500,
        fontFamily: "'Segoe UI', sans-serif",
        display: "flex",
        alignItems: "center"
      }}>
        Earnings trends
        <button
          type="button"
          className="tooltip-custom"
          style={{
            position: "relative",
            marginLeft: "8px",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer"
          }}
        >
          <img
            className="charts-title"
            alt=""
            src="/info-icon.png"
            style={{
              display: "block",
              height: "15px",
              width: "15px",
              marginLeft: "3px"
            }}
          />
        </button>
      </div>

      <HighchartsReact
        highcharts={Highcharts}
        options={finalOptions}
        containerProps={containerId ? { id: containerId } : {}}
      />
    </div>
  );
};

export default HighchartGraph;
