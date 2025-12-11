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

// --- CUSTOM TOOLTIP ---
const getOrCreateTooltip = (chart) => {
  let tooltipEl = chart.canvas.parentNode.querySelector('div.chartjs-tooltip');
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'chartjs-tooltip';
    tooltipEl.style.background = '#121212EE';
    tooltipEl.style.borderRadius = '5px';
    tooltipEl.style.color = 'white';
    tooltipEl.style.opacity = 1;
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.transform = 'translate(-50%, 0)';
    tooltipEl.style.transition = 'all .1s ease';
    tooltipEl.style.border = '1px solid #808080';
    tooltipEl.style.padding = '10px';
    tooltipEl.style.fontFamily = "'Calibri', sans-serif";
    tooltipEl.style.fontSize = '14px';
    tooltipEl.style.zIndex = 100;
    tooltipEl.style.minWidth = '180px';
    const table = document.createElement('table');
    table.style.margin = '0px';
    table.style.width = '100%';
    tooltipEl.appendChild(table);
    chart.canvas.parentNode.appendChild(tooltipEl);
  }
  return tooltipEl;
};

const externalTooltipHandler = (context) => {
  const { chart, tooltip } = context;
  const tooltipEl = getOrCreateTooltip(chart);
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }
  if (tooltip.body) {
    const titleLines = tooltip.title || [];
    const bodyLines = tooltip.body.map(b => b.lines);
    const tableHead = document.createElement('thead');
    titleLines.forEach(title => {
      const tr = document.createElement('tr');
      tr.style.borderWidth = 0;
      const th = document.createElement('th');
      th.style.borderWidth = 0;
      th.style.textAlign = 'left';
      th.style.paddingBottom = '8px';
      th.style.fontSize = '14px';
      th.innerText = title;
      tr.appendChild(th);
      tableHead.appendChild(tr);
    });
    const tableBody = document.createElement('tbody');
    bodyLines.forEach((body, i) => {
      const colors = tooltip.labelColors[i];
      const text = body[0];
      const split = text.split(':');
      const label = split[0];
      const value = split[1] || '';
      const tr = document.createElement('tr');
      tr.style.backgroundColor = 'inherit';
      tr.style.borderWidth = 0;
      const td = document.createElement('td');
      td.style.borderWidth = 0;
      td.style.display = 'flex';
      td.style.alignItems = 'center';
      td.style.justifyContent = 'space-between';
      td.style.padding = '3px 0';
      td.style.width = '100%';
      const leftPart = document.createElement('div');
      leftPart.style.display = 'flex';
      leftPart.style.alignItems = 'center';
      const spanColor = document.createElement('span');
      spanColor.style.background = colors.backgroundColor;
      spanColor.style.borderColor = colors.borderColor;
      spanColor.style.borderWidth = '2px';
      spanColor.style.marginRight = '8px';
      spanColor.style.height = '10px';
      spanColor.style.width = '10px';
      spanColor.style.borderRadius = '50%';
      spanColor.style.display = 'inline-block';
      leftPart.appendChild(spanColor);
      leftPart.appendChild(document.createTextNode(label));
      const valSpan = document.createElement('span');
      valSpan.style.fontWeight = 'bold';
      valSpan.style.marginLeft = '15px';
      valSpan.innerText = value;
      td.appendChild(leftPart);
      td.appendChild(valSpan);
      tr.appendChild(td);
      tableBody.appendChild(tr);
    });
    const tableRoot = tooltipEl.querySelector('table');
    while (tableRoot.firstChild) tableRoot.firstChild.remove();
    tableRoot.appendChild(tableHead);
    tableRoot.appendChild(tableBody);
  }
  const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
  tooltipEl.style.opacity = 1;
  tooltipEl.style.left = positionX + tooltip.caretX + 'px';
  tooltipEl.style.top = positionY + tooltip.caretY + 'px';
  tooltipEl.style.font = tooltip.options.bodyFont.string;
  tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
};

// --- LABELS LOGIC (Strict 7 Days) ---
const generateLabels = (dateRange: string, viewMode: "day" | "week") => {
  // Always use the Creator Page Range: Nov 27 - Dec 3
  const startStr = "2025-11-27";
  const startDate = new Date(startStr);
  const categories: string[] = [];

  if (viewMode === "week") {
    // Single Week Label for the whole range
    const weekEnd = new Date(startDate);
    weekEnd.setDate(startDate.getDate() + 6);
    const label = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    categories.push(label);
  } else {
    // 7 Days: Nov 27 ... Dec 3
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      categories.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
  }
  return categories;
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

const dashedYGridPlugin = {
  id: 'dashedYGrid',
  afterDraw(chart) {
    const ctx = chart.ctx;
    const yScale = chart.scales.y;

    ctx.save();
    ctx.strokeStyle = "#3e3e3e";
    ctx.setLineDash([2, 6]); // <-- smaller dashes
    ctx.lineWidth = 1;

    const step = yScale.ticks[1]?.value - yScale.ticks[0]?.value || 1;
    for (let val = yScale.min; val <= yScale.max; val += step) {
      const y = yScale.getPixelForValue(val);
      ctx.beginPath();
      ctx.moveTo(chart.chartArea.left, y);
      ctx.lineTo(chart.chartArea.right, y);
      ctx.stroke();
    }

    ctx.restore();
  }
};

// Explicitly register plugins
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
  dragData,
  hoverDashedLinePlugin,
  dashedYGridPlugin
);

const CHANNEL_COLORS = {
  subscriptions: "#3467FF",
  tips: "#2AD4AC",
  posts: "#FC6767",
  messages: "#FFA553",
  referrals: "#34C2FF",
  streams: "#CA34FF",
};

const EarningsByChannelGraph: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const { stats, filters, updateChannelGraphPoint } = useCreatorStats();

  const updateRef = useRef(updateChannelGraphPoint);
  useEffect(() => { updateRef.current = updateChannelGraphPoint; }, [updateChannelGraphPoint]);

  const filterRef = useRef(filters.viewMode);
  useEffect(() => { filterRef.current = filters.viewMode; }, [filters.viewMode]);

  const labels = useMemo(() => generateLabels(filters.dateRange, filters.viewMode), [filters.dateRange, filters.viewMode]);

  const datasets = useMemo(() => {
    // 1. Filter active channels
    const activeChannels = Object.keys(CHANNEL_COLORS).filter(channel => {
      return (stats[channel] || 0) > 0;
    });

    return activeChannels.map((channel) => {
      let rawData = stats.channelData ? stats.channelData[channel] : [];
      if (!rawData) rawData = [];

      // Slice STRICTLY 7 days (Indices 0-6)
      // because Context might hold 17 days
      let displayData = rawData.slice(0, 7);
      if (displayData.length < 7) {
        const pad = Array(7 - displayData.length).fill(0);
        displayData = [...displayData, ...pad];
      }

      // === AGGREGATION LOGIC ===
      if (filters.viewMode === "week") {
        // Aggregate 7 days -> 1 Week Point
        const weekSum = displayData.reduce((a,b) => a+b, 0);
        displayData = [weekSum];
      }

      return {
        label: channel.charAt(0).toUpperCase() + channel.slice(1),
        data: displayData,
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
  }, [stats.channelData, labels, filters.viewMode, stats]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (chartRef.current) chartRef.current.destroy();

    const allValues = datasets.flatMap(d => d.data);
    const maxVal = Math.max(...allValues, 0);

    let rawMax = maxVal > 0 ? maxVal * 1.1 : 10;
    let niceMax = Math.ceil(rawMax / 10) * 10;
    if (niceMax % 5 !== 0) niceMax = Math.ceil(niceMax / 5) * 5;

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: false,
            external: externalTooltipHandler,
            mode: "index",
            intersect: false,
          },
          dragData: {
            round: 2,
            dragX: false,
            showTooltip: true,
            onDragEnd: (e, datasetIndex, index, value) => {
              const chart = chartRef.current;
              if (!chart) return;
              if (value > chart.scales.y.max) {
                const newMax = Math.ceil((value * 1.1) / 10) * 10;
                chart.options.scales.y.max = newMax;
                chart.update('none');
              }
              const channelKey = datasets[datasetIndex].channelKey;
              const currentMode = filterRef.current;

              if (currentMode === "day") {
                // Direct update (Indices 0-6 match context 0-6)
                updateRef.current(channelKey, index, value);
              } else {
                // Week Mode (Index 0 is the aggregate)
                // Distribute new total to indices 0-6
                const dailyVal = value / 7;
                for(let i=0; i<7; i++) {
                  updateRef.current(channelKey, i, dailyVal);
                }
              }
            },
          }
        },
        hover: { mode: "index", intersect: false },
        interaction: { mode: "nearest", intersect: false },
        scales: {
          x: {
            grid: { drawOnChartArea: false, color: "rgba(255,255,255,0.1)" },
            ticks: { color: "#999", font: { size: 13, family: "'Calibri', sans-serif" }, maxTicksLimit: 15 },
            border: { display: true, width: 1, color: "rgba(255,255,255,0.1)" },
          },
          y: {
            min: 0,
            max: niceMax,
            border: { display: false },
            grid: {
              display: false,
            },
            ticks: {
              color: "#999",
              font: { size: 13, family: "'Calibri', sans-serif" },
              maxTicksLimit: 6,
              stepSize: niceMax / 5,
              precision: 0
            },
            beginAtZero: true
          }
        }
      },
      plugins: [hoverDashedLinePlugin, dashedYGridPlugin],
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
        <div style={{ position: "relative", height: "260px", width: "100%", maxWidth: "70%" }}>
          <canvas ref={canvasRef} style={{ display: "block", boxSizing: "border-box", height: "260px", width: "100%" }}></canvas>
        </div>
        <div className="legend">
          <ul>
            {/* Show ALL channels in Legend */}
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
