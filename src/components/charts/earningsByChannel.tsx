// @ts-nocheck
import React, { useEffect, useRef, useMemo } from "react";
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

const generateLabels = (dateRange: string, viewMode: "day" | "week") => {
  const [startStr, endStr] = dateRange.split("_");
  const startDate = new Date(startStr);
  const endDate = new Date(endStr);
  const categories: string[] = [];

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
      if (categories.length > 52) break;
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
  const { stats, filters, updateChannelGraphPoint } = useCreatorStats();

  // Ref for callback
  const updateRef = useRef(updateChannelGraphPoint);
  useEffect(() => { updateRef.current = updateChannelGraphPoint; }, [updateChannelGraphPoint]);

  const labels = useMemo(() => generateLabels(filters.dateRange, filters.viewMode), [filters.dateRange, filters.viewMode]);

  const datasets = useMemo(() => {
    return Object.keys(CHANNEL_COLORS).map((channel) => {
      // Read directly from independent arrays
      let data = stats.channelData ? stats.channelData[channel] : [];

      // Safety: Ensure length matches labels
      if (!data || data.length !== labels.length) {
        data = Array(labels.length).fill(0);
      }

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
        channelKey: channel
      };
    });
  }, [stats.channelData, labels, stats]); // Trigger when channelData changes

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (chartRef.current) chartRef.current.destroy();

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
            enabled: true,
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
            onDragEnd: (e, datasetIndex, index, value) => {
              const chart = chartRef.current;
              if (!chart) return;

              if (value > chart.scales.y.max) {
                chart.options.scales.y.max = value + 5;
                chart.update('none');
              }

              const channelKey = datasets[datasetIndex].channelKey;
              // Call independent update
              updateRef.current(channelKey, index, value);
            },
          }
        },
        hover: { mode: "index", intersect: false },
        interaction: { mode: "nearest", intersect: false },
        scales: {
          x: {
            grid: { drawOnChartArea: false, color: "rgba(0,0,0,0.1)" },
            ticks: { color: "#999", font: { size: 13, family: "'Calibri', sans-serif" }, maxTicksLimit: 15 },
            border: { display: true, width: 1, color: "rgba(0,0,0,0.1)" },
          },
          y: {
            min: 0,
            grid: { color: "rgba(0,0,0,0.1)", drawBorder: false },
            ticks: { color: "#999", font: { size: 13, family: "'Calibri', sans-serif" }, stepSize: 5 },
            beginAtZero: true
          }
        }
      },
      plugins: [hoverDashedLinePlugin],
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [labels, datasets]);

  return (
    <div style={{ padding: "10px" }} className="earnings-by-channel-wrapper">
      <h6 style={{ marginBottom: "20px", marginLeft: "20px" }}>
        Earnings by Channel
        <button className="tooltip-custom" style={{ position: "relative", top: 3, left: 6 }}>
          <img className="charts-title" alt="" src="/info-icon.png" />
        </button>
      </h6>
      <div id="chartContainer">
        <div style={{ position: "relative", height: "260px", width: "100%" }}>
          <canvas ref={canvasRef} style={{ display: "block", boxSizing: "border-box", height: "260px", width: "100%" }}></canvas>
        </div>
        <div className="legend">
          <ul>
            {Object.entries(CHANNEL_COLORS).map(([key, color]) => {
              const value = stats[key] || 0;
              const percent = stats.total > 0 ? ((value / stats.total) * 100).toFixed(2) : "0.00";
              return (
                <li key={key} className="item">
                  <div className="info">
                    <span className={key} style={{ backgroundColor: color }}></span>
                    <p>{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                  </div>
                  <div className={`${key}-percent`} style={{fontSize: "12px", color: "white"}}>
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
