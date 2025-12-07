// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import FilterDialog from "../filterDialog";
import { Tooltip } from "bootstrap";
import { useCreatorStats } from "../../context/CreatorStatsContext"; // ADJUST PATH IF NEEDED

const TopFilters: React.FC = () => {
  // 1. Connect to Context
  const { filters, setViewMode } = useCreatorStats();

  useEffect(() => {
    const tooltipTriggerList = Array.from(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.forEach(
      (tooltipTriggerEl) => new Tooltip(tooltipTriggerEl)
    );
  }, []);

  const earningsOptions = ["Gross earnings", "Net earnings"];
  const [selectedEarnings, setSelectedEarnings] = useState("Gross earnings");
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

  // Helper to handle view mode switch
  const handleViewModeChange = (e: React.MouseEvent, mode: "day" | "week" | "hour" | "month") => {
    e.preventDefault();
    // Only process active modes
    if (mode === "day" || mode === "week") {
      setViewMode(mode);
    }
  };

  return (
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
        <div className="daterange1" style={{display: "none"}}>
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

        {/* Shown by dropdown */}
        <div className="dropdown header-shown_by">
          <button
            className="dropdown-toggle border-0 text-start w-100"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{backgroundColor: "transparent", appearance: "none"}}
          >
            Shown by {filters.viewMode}
          </button>

          <ul className="dropdown-menu">
            <li>
              <a className="dropdown-item disabled" href="#" onClick={(e) => handleViewModeChange(e, "hour")}>
                Shown by hour
              </a>
            </li>
            <li>
              <a
                className={`dropdown-item ${filters.viewMode === "day" ? "active" : ""}`}
                href="#"
                onClick={(e) => handleViewModeChange(e, "day")}
              >
                Shown by day
              </a>
            </li>
            <li>
              <a
                className={`dropdown-item ${filters.viewMode === "week" ? "active" : ""}`}
                href="#"
                onClick={(e) => handleViewModeChange(e, "week")}
              >
                Shown by week
              </a>
            </li>
            <li>
              <a className="dropdown-item disabled" href="#" onClick={(e) => handleViewModeChange(e, "month")}>
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
          <img src="/info-icon.png" alt=""/>
        </button>

        {/* Earnings dropdown */}
        <div className="dropdown" id="earnings-select">
          <button
            className="dropdown-toggle border-0 text-start w-100"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{backgroundColor: "transparent", appearance: "none"}}
          >
            {selectedEarnings}
          </button>

          <ul className="dropdown-menu">
            {earningsOptions.map((opt) => (
              <li key={opt}>
                <a
                  className={`dropdown-item${
                    selectedEarnings === opt ? " active" : ""
                  }`}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedEarnings(opt);
                  }}
                >
                  {opt}
                </a>
              </li>
            ))}
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

        <FilterDialog isOpen={isDialogOpen} onClose={closeDialog}/>
      </div>
    </div>
  );
};

export default TopFilters;
