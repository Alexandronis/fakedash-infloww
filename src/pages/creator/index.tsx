// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import { Tooltip } from 'bootstrap';
import FilterDialog from "../../components/filterDialog";
import HighchartGraph from "../../components/charts/earningsTrends.tsx";
import "./creator.scss";

const CreatorPage: React.FC = () => {
  const earningsOptions = {
    colors: [
      "#2b908f", "#90ee7e", "#f45b5b", "#7798BF", "#aaeeee",
      "#ff0066", "#eeaaee", "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"
    ],
    chart: {
      type: "column",
      backgroundColor: "transparent",
      borderColor: "#334eff",
      plotBorderColor: "#606063",
      spacing: [10, 10, 15, 10],
      marginTop: 60,
      style: { fontFamily: "'Segoe UI', sans-serif" },
      animation: false,
      zooming: {
        singleTouch: false,
        resetButton: {
          theme: { zIndex: 6 },
          position: { align: "right", x: -10, y: 10 }
        }
      }
    },
    title: {
      text: `Earnings trends <button type="button" class="tooltip-custom" style="position: relative; top: 3px; left: 6px;"><img class="charts-title" alt="" src="images/info-icon.png"></button>`,
      useHTML: true,
      align: "left",
      margin: 15,
      style: {
        color: "white",
        fontWeight: "500",
        fontSize: "16px",
        textTransform: "none"
      }
    },
    subtitle: {
      style: { color: "#E0E0E3", fontSize: "0.8em", textTransform: "uppercase" },
      text: ""
    },
    caption: {
      text: "",
      margin: 15,
      align: "left",
      verticalAlign: "bottom",
      style: { color: "#666666", fontSize: "0.8em" }
    },
    legend: {
      enabled: false,
      align: "center",
      layout: "horizontal",
      itemStyle: {
        color: "#E0E0E3",
        cursor: "pointer",
        fontSize: "0.8em"
      }
    },
    credits: { enabled: false },
    xAxis: [{
      categories: ["Nov 30-Dec 6", "Dec 7-13"],
      lineColor: "#3e3e3e",
      lineWidth: 1,
      tickmarkPlacement: "on",
      title: { align: "middle", style: { color: "#A0A0A3", fontSize: "0.8em" } },
      labels: {
        style: {
          color: "#999999",
          cursor: "default",
          fontSize: "0.8em"
        }
      },
      gridLineColor: "#707073",
      margin: 15,
      tickColor: "#3e3e3e",
      tickLength: 5,
      tickWidth: 1,
      tickInterval: 1
    }],
    yAxis: [{
      min: 0,
      title: { text: "", style: { color: "#444444", fontSize: "0.8em" } },
      labels: {
        style: {
          color: "#999999",
          cursor: "default",
          fontSize: "0.8em"
        },
        x: -5,
        y: 3
      },
      gridLineDashStyle: "Dash",
      gridLineColor: "#3e3e3e",
      gridLineWidth: 1,
      lineColor: "#707073",
      lineWidth: 0,
      tickColor: "#707073",
      tickInterval: 10,
      endOnTick: true
    }],
    tooltip: {
      enabled: true,
      backgroundColor: "#121212EE",
      style: {
        color: "#fff",
        cursor: "default",
        fontSize: "0.8em",
        lineHeight: "20px"
      },
      useHTML: true,
      shared: true,
      animation: { duration: 300 },
      borderRadius: 5,
      borderColor: "#808080",
      borderWidth: 1,
      shadow: false,
      padding: 10,
      pointFormat: `<span style="color:{point.color}">●</span> {series.name}: <b>{point.y}</b><br/>`,
      headerFormat: `<span style="font-size: 0.8em">{point.key}</span><br/>`,
      followPointer: true
    },
    plotOptions: {
      column: {
        dragDrop: {
          draggableY: true // Enable dragging vertically
        },
        allowPointSelect: true,
        cursor: 'ns-resize',
        animation: { duration: 1000 },
        borderColor: "#ffffff",
        borderWidth: 0,
        borderRadius: 1,
        maxPointWidth: 170,
        groupPadding: 0.15,
        pointPadding: 0.001,
        states: {
          hover: { brightness: 0.1, color: "#3971FF" },
          select: { color: "#cccccc", borderColor: "#000000" }
        },
        point: {
          events: {
            drop: function (event) {
              const chart = this.series.chart;
              const maxVal = Math.max(...this.series.data.map(p => p.y), event.newY);
              chart.yAxis[0].setExtremes(0, maxVal > 10 ? maxVal + 10 : 10);
            }
          }
        },
        color: "#3467FF"
      }
    },
    series: [{
      name: "Earnings",
      type: "column",
      color: "#3467FF",
      data: [8.75, 0],
      animation: false,
      dataLabels: {
        enabled: false,
        style: { fontSize: "13px", fontWeight: "bold", color: "contrast", textOutline: "1px contrast" }
      }
    }]
  };

  useEffect(() => {
    const tooltipTriggerList = Array.from(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.forEach(
      (tooltipTriggerEl) => new Tooltip(tooltipTriggerEl)
    );
  }, []);

  const [isDialogOpen, setDialogOpen] = useState(false);

  const showDialog = () => setDialogOpen(true);
  const closeDialog = () => setDialogOpen(false);

  const dateRangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dateRangeRef.current) return;

    // daterangepicker MUST see jQuery + moment globally
    (window as any).moment = moment;

    // @ts-ignore
    $(dateRangeRef.current).daterangepicker(
      {
        opens: "left",
        autoUpdateInput: false,
        alwaysShowCalendars: true,
        startDate: moment().subtract(7, "days"),
        endDate: moment(),
        ranges: {
          "2025": [moment("2025-01-01"), moment("2025-12-31")],
          "Last 7 Days": [moment().subtract(6, "days"), moment()],
          "Last 30 Days": [moment().subtract(29, "days"), moment()],
          "Last 90 Days": [moment().subtract(89, "days"), moment()],
          "Last 365 Days": [moment().subtract(364, "days"), moment()],
          December: [moment("2025-12-01"), moment("2025-12-31")],
          November: [moment("2025-11-01"), moment("2025-11-30")],
          October: [moment("2025-10-01"), moment("2025-10-31")],
          September: [moment("2025-09-01"), moment("2025-09-30")],
          August: [moment("2025-08-01"), moment("2025-08-31")],
          July: [moment("2025-07-01"), moment("2025-07-31")],
        },
      },
      function (start: any, end: any) {
        dateRangeRef.current!.querySelector("span")!.innerHTML = `
        <span style="padding: 0 60px 0 10px">${start.format("MMM. DD, YYYY")}</span>
        <span style="padding: 0 45px 0 0">⇀ ${end.format("MMM. DD, YYYY")}</span>
      `;
      }
    );
  }, []);

  return (
    <div className="creator-content">
      <div className="header-title">
        <h2>Creator Reports</h2>
      </div>

      <div className="header-bar">
        <div className="header-tab">
          <span className="overview-tab">Overview</span>
          <span className="creator_perf-tab">Creator performance</span>
        </div>

        <div className="header-filter">
          {/* DATE RANGE */}
          <div id="daterange" ref={dateRangeRef}>
            <span>
              <span style={{padding: "0 60px 0 10px"}}>Nov. 25, 2025</span>
              <span style={{padding: "0 45px 0 0"}}>
                ⇀&nbsp;&nbsp; Nov. 29, 2025
              </span>
            </span>
            &nbsp;
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="#A6A6A6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4 10h16m-8-3V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Zm3-7h.01v.01H8V13Zm4 0h.01v.01H12V13Zm4 0h.01v.01H16V13Zm-8 4h.01v.01H8V17Zm4 0h.01v.01H12V17Zm4 0h.01v.01H16V17Z"
              />
            </svg>
          </div>

          {/* Hidden date range */}
          <div className="daterange1" style={{ display: "none" }}>
            <span>
              <span style={{ padding: "0 60px 0 10px" }}>Nov. 25, 2025</span>
              <span style={{ padding: "0 45px 0 0" }}>
                ⇀&nbsp;&nbsp; Nov. 29, 2025
              </span>
            </span>
            &nbsp;
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="#A6A6A6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4 10h16m-8-3V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Zm3-7h.01v.01H8V13Zm4 0h.01v.01H12V13Zm4 0h.01v.01H16V13Zm-8 4h.01v.01H8V17Zm4 0h.01v.01H12V17Zm4 0h.01v.01H16V17Z"
              />
            </svg>
          </div>

          {/* Shown by dropdown */}
          <div className="dropdown header-shown_by">
            <button
              className="dropdown-toggle border-0 text-start w-100"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ backgroundColor: "transparent", appearance: "none" }}
            >
              Shown by week
            </button>

            <ul className="dropdown-menu">
              <li>
                <a className="dropdown-item disabled" href="#" data-period="hour">
                  Shown by hour
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="#" data-period="day">
                  Shown by day
                </a>
              </li>
              <li>
                <a className="dropdown-item active" href="#" data-period="week">
                  Shown by week
                </a>
              </li>
              <li>
                <a className="dropdown-item disabled" href="#" data-period="month">
                  Shown by month
                </a>
              </li>
            </ul>
          </div>

          {/* Tooltip button */}
          <button
            type="button"
            className="tooltip-custom"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-title="Tooltip on top"
          >
            <img src="/info-icon.png" alt="" />
          </button>

          {/* Earnings dropdown */}
          <div className="dropdown" id="earnings-select">
            <button
              className="dropdown-toggle border-0 text-start w-100"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ backgroundColor: "transparent", appearance: "none" }}
            >
              Net earnings
            </button>

            <ul className="dropdown-menu">
              <li>
                <a className="dropdown-item" href="#">
                  Gross earnings
                </a>
              </li>
              <li>
                <a className="dropdown-item active" href="#">
                  Net earnings
                </a>
              </li>
            </ul>
          </div>

          {/* Filter button */}
          <span className="header-span_filter" onClick={showDialog}>
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
                d="M18.796 4H5.204a1 1 0 0 0-.753 1.659l5.302 6.058a1 1 0 0 1 .247.659v4.874a.5.5 0 0 0 .2.4l3 2.25a.5.5 0 0 0 .8-.4v-7.124a1 1 0 0 1 .247-.659l5.302-6.059c.566-.646.106-1.658-.753-1.658Z"
              />
            </svg>
            Filters
          </span>

          {/* New Filter Dialog Component */}
          <FilterDialog isOpen={isDialogOpen} onClose={closeDialog} />
        </div>
      </div>
      <div className="col-12">
        <div className="main-card-wrap">
          <div className="main-card-heading">
            <h4>
              Earnings summary
              <button
                type="button"
                className="tooltip-custom"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                data-bs-title="An overview of total earnings based on your managed Creators during this period"
              >
                <img src="/info-icon.png" alt=""/>
              </button>
            </h4>
          </div>
          <div className="main-card-content">
            <div className="overview-col">
              <div className="overview-inner">
                <img src="/of-icon.svg" alt=""/>
                <p>Total earnings</p>
                <h5 className="total-earning" id="editableText">
                    <span
                      className="dollar-sign"
                      style={{
                        fontSize: '24px',
                        color: '#2D74FF',
                        lineHeight: '48px',
                        verticalAlign: 'middle',
                      }}
                    >
                      $
                    </span>
                  7.00
                </h5>
              </div>
            </div>

            <div className="overview-col">
              <div className="overview-card">
                <div className="card-content">
                  <h5 className="sub-earning" id="editableText">
                    $2.20
                  </h5>
                  <p>Subscriptions</p>
                </div>
                <img src="/plus-icon.png" alt=""/>
              </div>

              <div className="overview-card">
                <div className="card-content">
                  <h5 className="tips-earning" id="editableText">
                    $0.00
                  </h5>
                  <p>Tips</p>
                </div>
                <img src="/tips-icon.png" alt=""/>
              </div>
            </div>

            <div className="overview-col">
              <div className="overview-card">
                <div className="card-content">
                  <h5 className="posts-earning" id="editableText">
                    $0.00
                  </h5>
                  <p>Posts</p>
                </div>
                <img src="/posts-icon.png" alt=""/>
              </div>

              <div className="overview-card">
                <div className="card-content">
                  <h5 className="ref-earning" id="editableText">
                    $0.00
                  </h5>
                  <p>Referrals</p>
                </div>
                <img src="/referrals-icon.png" alt=""/>
              </div>
            </div>

            <div className="overview-col">
              <div className="overview-card">
                <div className="card-content">
                  <h5 className="msg-earning" id="editableText">
                    $4.80
                  </h5>
                  <p>Messages</p>
                </div>
                <img src="/messages-icon.png" alt=""/>
              </div>

              <div className="overview-card">
                <div className="card-content">
                  <h5 className="streams-earning" id="editableText">
                    $0.00
                  </h5>
                  <p>Streams</p>
                </div>
                <img src="/streams-icon.png" alt=""/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <HighchartGraph options={earningsOptions} />
    </div>
  );
};

export default CreatorPage;
