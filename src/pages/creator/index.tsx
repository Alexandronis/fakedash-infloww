import React, { useState } from "react";
import "./creator.scss";
import FilterDialog from "../../components/filterDialog";

const CreatorPage: React.FC = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);

  const showDialog = () => setDialogOpen(true);
  const closeDialog = () => setDialogOpen(false);

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
          <div id="daterange">
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
    </div>
  );
};

export default CreatorPage;
