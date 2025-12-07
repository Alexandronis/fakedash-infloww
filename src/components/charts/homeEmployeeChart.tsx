// @ts-nocheck
import React, { useEffect, useState, useMemo, useRef } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import DraggableModule from "highcharts/modules/draggable-points";
import { useCreatorStats } from "../../context/CreatorStatsContext";

// === VITE FIX ===
if (typeof DraggableModule === "function") {
  DraggableModule(Highcharts);
} else if (typeof DraggableModule === "object" && (DraggableModule as any).default) {
  (DraggableModule as any).default(Highcharts);
}

interface HomeEmployeeChartProps {
  timeFilter: string; // "yesterday" | "today" | "week" | "month"
}

const HomeEmployeeChart: React.FC<HomeEmployeeChartProps> = ({ timeFilter }) => {
  const { stats, updateGraphColumn } = useCreatorStats();

  // Ref to access context function inside Highcharts events
  const updateRef = useRef(updateGraphColumn);
  useEffect(() => { updateRef.current = updateGraphColumn; }, [updateGraphColumn]);

  const [chartOptions, setChartOptions] = useState<Highcharts.Options>({});

  // 1. Generate Data & Labels based on Filter + Context
  const chartData = useMemo(() => {
    // Source: Global Graph Data
    let sourceData = stats.graphData || [];

    // SIMULATE DIFFERENT DATA SHAPES BASED ON FILTER
    // In a real app, this would query an API.
    // Here we just slice/mock the array length to show visual change.

    let displayData = [];
    let labels = [];
    const today = new Date("2025-12-13"); // Mock Today (end of your range)

    if (timeFilter === "today") {
      displayData = [sourceData[sourceData.length - 1] || 0];
      labels = ["Today"];
    } else if (timeFilter === "yesterday") {
      displayData = [sourceData[sourceData.length - 2] || 0];
      labels = ["Yesterday"];
    } else if (timeFilter === "week") {
      // Last 7 days
      displayData = sourceData.slice(-7);
      if (displayData.length < 7) {
        // Pad if not enough data
        displayData = [...Array(7 - displayData.length).fill(0), ...displayData];
      }
      // Generate labels
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }
    } else {
      // Month (Full available data or up to 30)
      displayData = sourceData;

      // --- AUTO-EXPAND FIX ---
      // If we only have weekly data (e.g. 2 points) but want month view,
      // split those points into ~30 daily points
      if (displayData.length < 5) {
        const expanded = [];
        displayData.forEach(val => {
          // Split one week bar into 7 daily bars
          const dailyVal = val / 7;
          for(let k=0; k<7; k++) expanded.push(dailyVal);
        });
        displayData = expanded;
      }
      // -----------------------

      const start = new Date(today);
      start.setDate(start.getDate() - (displayData.length - 1));

      displayData.forEach((_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      });
    }

    const seriesData = displayData.map(val => ({ y: Number(val) }));

    return { seriesData, labels };
  }, [stats.graphData, timeFilter]);

  // 2. Configure Options
  useEffect(() => {
    const options: Highcharts.Options = {
      chart: {
        type: "areaspline",
        backgroundColor: "transparent",
        borderColor: "#334eff",
        marginTop: 80,
        style: { fontFamily: "Inter, sans-serif" },
        animation: false,
      },
      title: {
        useHTML: true,
        text: `
          <div style="font-family: 'Inter'; color: white; font-weight: 500; font-size: 15px; display: flex; align-items: center; margin-top: 10px; margin-left: 0;">
            Employee sales 
            <button class="tooltip-custom" style="position: relative; margin-left: 14px; background: none; border: none; padding: 0; cursor: pointer;margin-top: 1px;">
               <img src="/info-icon.png" style="width: 15px; height: 15px; display: block;" />
            </button>
          </div>
        `,
        align: "left",
        x: 5
      },
      legend: { enabled: false },
      credits: { enabled: false },

      xAxis: {
        categories: chartData.labels, // <--- FIX 2: Explicit categories
        lineColor: "#E6E6E6",
        lineWidth: 0,
        tickColor: "transparent",
        labels: {
          style: { color: "#999999", fontSize: "0.8em" },
          y: 25
        },
        gridLineColor: "#707073",
      },
      yAxis: {
        title: { text: "" },
        gridLineDashStyle: "Dash",
        gridLineColor: "#444444",
        gridLineWidth: 1,
        labels: {
          style: { color: "#999999", fontSize: "0.8em" },
          x: -5,
          y: 3
        },
      },

      tooltip: {
        shared: true,
        useHTML: true,
        backgroundColor: "#262626",
        borderColor: "#808080",
        borderRadius: 5,
        style: { color: "#fff", fontSize: "0.8em" },
        formatter: function () {
          const point = this.points ? this.points[0] : this;

          // FIX: Use 'point.key' which holds the category name (Date string)
          // OR lookup manually if needed: chartData.labels[point.point.index]
          const dateLabel = point.key || chartData.labels[point.point.index];

          const currentY = point.y;
          const prevY = point.series.data[point.point.index - 1]?.y;

          let growthHtml = "";
          if (prevY !== undefined && prevY !== 0) {
            const diff = ((currentY - prevY) / prevY) * 100;
            const color = diff >= 0 ? "#90ee7e" : "#f45b5b";
            const sign = diff >= 0 ? "+" : "";
            growthHtml = `<span style="color: ${color}; font-size: 0.9em; margin-left: 10px;">Growth: ${sign}${diff.toFixed(1)}%</span>`;
          } else if (prevY === 0 && currentY > 0) {
            growthHtml = `<span style="color: #90ee7e; font-size: 0.9em; margin-left: 10px;">Growth: +100%</span>`;
          }

          return `
                <div style="padding: 5px;">
                    <div style="margin-bottom: 4px; font-weight: bold;">${dateLabel}</div>
                    <div>
                        Earnings: <b>$${currentY.toFixed(2)}</b>
                        ${growthHtml}
                    </div>
                </div>
            `;
        }
      },

      plotOptions: {
        areaspline: {
          lineWidth: 5,
          color: "#3467FF",
          // FIX 1: Grey/Transparent Gradient for shadow
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, "rgba(255, 255, 255, 0.1)"], // Light Grey/White tint
              [1, "rgba(255, 255, 255, 0.0)"]  // Fade out
            ]
          },
          marker: {
            enabled: true,
            radius: 6,
            fillColor: "#FFFFFF",
            lineColor: "#3467FF",
            lineWidth: 2,
            states: {
              hover: { radius: 8, lineWidth: 3 }
            }
          },
          dragDrop: {
            draggableY: true,
            dragMinY: 0,
            dragPrecisionY: 0.01,
            dragHandle: {
              lineColor: 'transparent',
              color: 'transparent'
            }
          },
          point: {
            events: {
              drop: function (e) {
                if (e.newPoint) {
                  // Drag logic maps back to GLOBAL context index
                  // We need to calculate offset if view is sliced
                  let globalIndex = this.index;
                  if (timeFilter === "week") {
                    // Logic: last 7 days => offset from end
                    const totalLen = stats.graphData?.length || 0;
                    const offset = 7 - 1 - this.index;
                    globalIndex = totalLen - 1 - offset;
                  }

                  // Safety: only update if index valid
                  if (globalIndex >= 0) {
                    updateRef.current(globalIndex, e.newPoint.y);
                  }
                }
              }
            }
          }
        }
      },

      series: [{
        name: "Sales",
        data: chartData.seriesData
      }]
    };

    setChartOptions(options);
  }, [chartData, stats.graphData, timeFilter]);

  return (
    <div id="employee-sales">
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
    </div>
  );
};

export default HomeEmployeeChart;
