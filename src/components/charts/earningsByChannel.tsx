// @ts-nocheck
import React, { useEffect, useRef } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
} from "chart.js";
import dragData from "chartjs-plugin-dragdata";
import { useCreatorStats } from "../../context/CreatorStatsContext.tsx";

// Plugin for dashed vertical hover line
const hoverDashedLinePlugin = {
  id: "hoverDashedLine",
  afterDraw(chart) {
    const idx = chart._hoverIndex;
    if (idx == null) return;
    const xScale = chart.scales.x;
    if (!xScale) return;
    const x = xScale.getPixelForTick(idx);
    if (x == null) return;

    const ctx = chart.ctx;
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#999999";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, chart.chartArea.top);
    ctx.lineTo(x, chart.chartArea.bottom);
    ctx.stroke();
    ctx.restore();
  }
};

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  dragData,
  hoverDashedLinePlugin
);

const initialLabels = ["Nov 30-Dec 6", "Dec 7-13"];
const initialDatasets = [
  {
    label: "Subscriptions",
    data: [0.55, 0],
    backgroundColor: "#3467FF",
    borderColor: "#3467FF",
    pointBackgroundColor: "#3467FF",
    borderWidth: 2,
    pointStyle: "circle",
    pointBorderWidth: 2,
    pointRadius: 3,
    pointHoverRadius: 4,
    pointHoverBorderWidth: 3,
    fill: false,
    tension: 0
  },
  {
    label: "Messages",
    data: [16.17, 16.17],
    backgroundColor: "#FFA553",
    borderColor: "#FFA553",
    pointBackgroundColor: "#FFA553",
    borderWidth: 2,
    pointStyle: "circle",
    pointBorderWidth: 2,
    pointRadius: 3,
    pointHoverRadius: 4,
    pointHoverBorderWidth: 3,
    fill: false,
    tension: 0
  },
  {
    label: "Streams",
    data: [0, 0],
    backgroundColor: "#CA34FF",
    borderColor: "#CA34FF",
    pointBackgroundColor: "#CA34FF",
    borderWidth: 2,
    pointStyle: "circle",
    pointBorderWidth: 2,
    pointRadius: 3,
    pointHoverRadius: 4,
    pointHoverBorderWidth: 3,
    fill: false,
    tension: 0
  }
];

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: false,
      mode: "index",
      intersect: false
    },
    dragData: {
      round: 2,
      dragX: false,
      showTooltip: true,
      onDragEnd: (e, datasetIndex, index, value) => {
        const chart = e.chart;
        const yAxis = chart.scales.y;
        if (value > yAxis.max) {
          yAxis.options.max = value + 5;
          chart.update();
        }
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
      type: "category",
      display: true,
      position: "bottom",
      grid: {
        drawOnChartArea: false,
        drawTicks: true,
        drawBorder: true,
        display: true,
        lineWidth: 1,
        tickLength: 8,
        offset: false,
        color: "rgba(0,0,0,0.1)"
      },
      ticks: {
        color: "#999",
        font: {
          size: 13,
          family: "'Calibri', sans-serif"
        },
        maxTicksLimit: 15,
        minRotation: 0,
        maxRotation: 50,
        mirror: false,
        padding: 3,
        display: true,
        autoSkip: true,
        autoSkipPadding: 3,
        labelOffset: 0,
        align: "center",
        crossAlign: "near"
      },
      bounds: "ticks",
      border: { display: true, width: 1, color: "rgba(0,0,0,0.1)" },
    },
    y: {
      type: "linear",
      display: true,
      position: "left",
      min: 0,
      max: 20,
      grid: {
        drawOnChartArea: false,
        drawBorder: false,
        display: true,
        lineWidth: 1,
        color: "rgba(0,0,0,0.1)"
      },
      ticks: {
        color: "#999",
        font: {
          size: 13,
          family: "'Calibri', sans-serif"
        },
        stepSize: 5,
        padding: 3,
        display: true,
        autoSkip: true,
        autoSkipPadding: 3
      },
      beginAtZero: true
    }
  }
};

const EarningsByChannelGraph: React.FC = () => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const {
    stats,
  } = useCreatorStats();

  const STAT_CONFIG = {
    subscriptions: { label: "Subscriptions", className: "subscriptions" },
    tips: { label: "Tips", className: "tips" },
    posts: { label: "Posts", className: "posts" },
    messages: { label: "Messages", className: "messages" },
    referrals: { label: "Referrals", className: "referrals" },
    streams: { label: "Streams", className: "streams" },
  };


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: initialLabels,
        datasets: initialDatasets,
      },
      options: {
        ...chartOptions,
        onHover(event, elements) {
          const chart = chartRef.current;
          chart._hoverIndex =
            elements && elements.length > 0 ? elements[0].index : null;
          chart.draw();
        },
      },
      plugins: [hoverDashedLinePlugin],
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, []);

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
      {/* Tooltip: kept as your HTML version */}
      <div
        className="tooltip-popup"
        style={{
          position: "absolute",
          backgroundColor: "black",
          padding: "10px",
          boxShadow: "rgba(0, 0, 0, 0.1) 0px 0px 10px",
          zIndex: 10,
          maxWidth: "250px",
          fontSize: "14px",
          color: "white",
          borderRadius: "5px",
          top: "163.562px",
          left: "321.484px",
          display: "none"
        }}
      >
        Track trends and growth of your managed Creators’ earning channels
      </div>
      <div id="chartContainer">
        <div style={{ position: "relative", height: "260px", width: "706px" }}>
          <canvas
            ref={canvasRef}
            style={{
              display: "block",
              boxSizing: "border-box",
              height: "260px",
              width: "730.1px"
            }}
            width={730}
            height={260}
          ></canvas>
        </div>
        <div className="legend">
          <ul>
            {Object.entries(stats)
              .filter(([key]) => key !== "total")
              .map(([key, value]) => {
                const cfg = STAT_CONFIG[key];
                if (!cfg) return null;

                const percent =
                  stats.total > 0 ? ((value / stats.total) * 100).toFixed(2) : "0.00";

                return (
                  <li key={key} className="item">
                    <div className="info">
                      <span className={cfg.className}></span>
                      <p>{cfg.label}</p>
                    </div>

                    <div style={{fontSize: "12px", color: "white"}}>
                      {percent}%
                    </div>

                    <div
                      className={`${cfg.className}-earning`}
                      style={{fontSize: "12px", color: "white"}}
                    >
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
