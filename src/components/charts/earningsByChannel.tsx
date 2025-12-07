// @ts-nocheck
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler
} from "chart.js";
import dragData from "chartjs-plugin-dragdata";
import { useCreatorStats } from "../../context/CreatorStatsContext";

// --- HELPERS ---

// Generate Labels based on Context Filters (Same logic as Highcharts)
const generateLabels = (dateRange: string, viewMode: "day" | "week") => {
  const [startStr, endStr] = dateRange.split("_");
  const startDate = new Date(startStr);
  const endDate = new Date(endStr);
  const categories: string[] = [];

  // Safety check
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return ["Week 1", "Week 2"];

  if (viewMode === "week") {
    let current = new Date(startDate);
    while (current <= endDate) {
      const weekEnd = new Date(current);
      weekEnd.setDate(current.getDate() + 6);
      const finalEnd = weekEnd > endDate ? endDate : weekEnd;
      const label = `${current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${finalEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      categories.push(label);
      current.setDate(current.getDate() + 7);
      if (categories.length > 52) break; // Safety break
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
  return categories.length > 0 ? categories : ["Week 1", "Week 2"];
};

// Plugin for dashed vertical hover line
const hoverDashedLinePlugin = {
  id: "hoverDashedLine",
  afterDraw(chart) {
    if (chart.tooltip?._active?.length) {
      const activePoint = chart.tooltip._active[0];
      const ctx = chart.ctx;
      const x = activePoint.element.x;
      const topY = chart.scales.y.top;
      const bottomY = chart.scales.y.bottom;

      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#999999";
      ctx.stroke();
      ctx.restore();
    }
  }
};

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
  dragData,
  hoverDashedLinePlugin
);

const CHANNEL_COLORS = {
  subscriptions: "#3467FF",
  tips: "#2AD4AC",
  posts: "#FC6767",
  referrals: "#34C2FF",
  messages: "#FFA553",
  streams: "#CA34FF",
};

const EarningsByChannelGraph: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  const { stats, filters, updateGraphColumn } = useCreatorStats();

  // Use a ref for the update method to avoid stale closures inside Chart.js events
  const updateRef = useRef(updateGraphColumn);
  useEffect(() => { updateRef.current = updateGraphColumn; }, [updateGraphColumn]);

  // Use a ref for stats to calculate drag math
  const statsRef = useRef(stats);
  useEffect(() => { statsRef.current = stats; }, [stats]);

  // 1. Prepare Data
  const labels = useMemo(() => generateLabels(filters.dateRange, filters.viewMode), [filters.dateRange, filters.viewMode]);

  // 2. Prepare Datasets based on Context
  const datasets = useMemo(() => {
    // Ensure graphData exists and matches label length (simple sync)
    let graphShape = stats.graphData || [];
    if (graphShape.length !== labels.length) {
      graphShape = Array(labels.length).fill(0);
    }

    const total = stats.total > 0 ? stats.total : 1; // Avoid divide by zero

    return Object.keys(CHANNEL_COLORS).map((channel) => {
      const channelTotal = stats[channel] || 0;
      const ratio = channelTotal / total;

      // Calculate points: (TotalAtTime * ChannelRatio)
      const data = graphShape.map(val => Number((val * ratio).toFixed(2)));

      return {
        label: channel.charAt(0).toUpperCase() + channel.slice(1),
        data: data,
        backgroundColor: CHANNEL_COLORS[channel],
        borderColor: CHANNEL_COLORS[channel],
        pointBackgroundColor: CHANNEL_COLORS[channel],
        borderWidth: 2,
        pointStyle: "circle",
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointHoverBorderWidth: 3,
        fill: false,
        tension: 0,
        // Custom property to identify channel in drag handler
        channelKey: channel
      };
    });
  }, [stats, labels]);

  // 3. Initialize / Update Chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Destroy previous instance if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true, // Enable native tooltip for checking values
            mode: "index",
            intersect: false,
            backgroundColor: "#121212EE",
            titleColor: "#fff",
            bodyColor: "#fff",
            borderColor: "#808080",
            borderWidth: 1,
          },
          dragData: {
            round: 2,
            dragX: false,
            showTooltip: true,
            // === DRAG LOGIC ===
            onDragEnd: (e, datasetIndex, index, value) => {
              const chart = chartRef.current;
              if (!chart) return;

              // 1. Extend Y-Axis if needed
              if (value > chart.scales.y.max) {
                chart.options.scales.y.max = value + 5;
                chart.update('none');
              }

              // 2. Calculate impact on TOTAL
              // Logic: If I drag "Messages" from 10 to 20,
              // I am effectively increasing the Total for that day by 10.

              // Get the channel key
              const channelKey = datasets[datasetIndex].channelKey;
              const currentStats = statsRef.current;

              // Calculate Ratio of this channel
              const totalVal = currentStats.total || 1;
              const channelVal = currentStats[channelKey] || 0;
              const ratio = channelVal / totalVal;

              if (ratio === 0) {
                // Edge case: If channel was 0, we can't reverse math simply.
                // We assume this drag sets the NEW Total directly (simplification)
                // or we skip.
                return;
              }

              // Reverse math: If LineValue = TotalGraph * Ratio
              // Then NewTotalGraph = NewLineValue / Ratio
              const newTotalForDay = value / ratio;

              // Update Context (Column Index)
              updateRef.current(index, newTotalForDay);
            },
          }
        },
        hover: {
          mode: "index",
          intersect: false
        },
        interaction: {
          mode: "nearest",
          intersect: false
        },
        scales: {
          x: {
            grid: {
              drawOnChartArea: false,
              color: "rgba(0,0,0,0.1)"
            },
            ticks: {
              color: "#999",
              font: { size: 13, family: "'Calibri', sans-serif" },
              maxTicksLimit: 15,
              maxRotation: 50,
              minRotation: 0,
            },
            border: { display: true, width: 1, color: "rgba(0,0,0,0.1)" },
          },
          y: {
            min: 0,
            // Allow dynamic max
            suggestedMax: 10,
            grid: {
              color: "rgba(0,0,0,0.1)",
              drawBorder: false,
            },
            ticks: {
              color: "#999",
              font: { size: 13, family: "'Calibri', sans-serif" },
              stepSize: 5
            },
            beginAtZero: true
          }
        }
      },
      plugins: [hoverDashedLinePlugin],
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [labels, datasets]); // Re-init when data/labels change

  return (
    <div style={{ padding: "10px" }} className="earnings-by-channel-wrapper">
      <h6 style={{ marginBottom: "20px", marginLeft: "20px" }}>
        Earnings by Channel
        <button
          type="button"
          className="tooltip-custom"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          data-bs-title="Track trends and growth of your managed Creators’ earning channels"
          style={{ position: "relative", top: 3, left: 6 }}
        >
          <img className="charts-title" alt="" src="/info-icon.png" />
        </button>
      </h6>

      <div id="chartContainer">
        <div style={{ position: "relative", height: "260px", width: "100%" }}>
          <canvas
            ref={canvasRef}
            style={{
              display: "block",
              boxSizing: "border-box",
              height: "260px",
              width: "100%"
            }}
          ></canvas>
        </div>

        {/* Dynamic Legend */}
        <div className="legend">
          <ul>
            {Object.entries(CHANNEL_COLORS).map(([key, color]) => {
              const value = stats[key] || 0;
              // Don't hide 0 values if they are active channels,
              // but usually you might want to hide them if totally empty.
              // For now showing all as per your static example.
              const percent = stats.total > 0 ? ((value / stats.total) * 100).toFixed(2) : "0.00";

              return (
                <li key={key} className="item">
                  <div className="info">
                    <span className={key} style={{ backgroundColor: color }}></span>
                    <p>{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                  </div>
                  <div style={{fontSize: "12px", color: "white"}} className={`${key}-percent`}>
                    {percent}%
                  </div>
                  <div className={`${key}-earning`} style={{fontSize: "12px", color: "white"}}>
                    ${value.toFixed(2)}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EarningsByChannelGraph;
