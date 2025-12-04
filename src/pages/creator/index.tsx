import React from 'react';
import './creator.scss';

const CreatorPage: React.FC = () => {
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
              <span style={{ padding: '0 60px 0 10px' }}>Nov. 25, 2025</span>
              <span style={{ padding: '0 45px 0 0' }}>
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

          {/* HIDDEN DATE RANGE */}
          <div className="daterange1" style={{ display: 'none' }}>
            <span>
              <span style={{ padding: '0 60px 0 10px' }}>Nov. 25, 2025</span>
              <span style={{ padding: '0 45px 0 0' }}>
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

          {/* SHOWN BY DROPDOWN */}
          <div className="dropdown header-shown_by">
            <button
              className="dropdown-toggle border-0 text-start w-100"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ backgroundColor: 'transparent', appearance: 'none' }}
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

          {/* TOOLTIP BUTTON */}
          <button
            type="button"
            className="tooltip-custom"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-title="Tooltip on top"
          >
            <img src="/info-icon.png" alt="" />
          </button>

          {/* EARNINGS DROPDOWN */}
          <div className="dropdown" id="earnings-select">
            <button
              className="dropdown-toggle border-0 text-start w-100"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ backgroundColor: 'transparent', appearance: 'none' }}
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

          {/* FILTER BUTTON */}
          <span className="header-span_filter" onClick={() => showDialog()}>
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

          {/* FILTER DIALOG */}
          <div
            id="filterDialog"
            style={{
              display: 'none',
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              height: '228px',
              width: '600px',
              backgroundColor: '#2F2F2F',
              color: 'white',
              borderRadius: '10px',
              margin: 0,
              padding: 0,
            }}
          >
            <h6
              style={{
                marginBottom: '15px',
                fontSize: '18px',
                fontWeight: 'bold',
                padding: '20px 20px 2px 10px',
              }}
            >
              Filter Options
            </h6>

            <div
              style={{
                width: '600px',
                backgroundColor: '#262626',
                padding: '20px 15px',
                borderRadius: 0,
              }}
            >
              <label htmlFor="creator" style={{ fontSize: '15px', width: '100%' }}>
                Filter by Creator(s)
              </label>

              <select
                id="creator"
                style={{
                  width: '100%',
                  height: '45px',
                  marginTop: '10px',
                  borderRadius: '5px',
                  backgroundColor: '#211f1f',
                  color: 'white',
                  border: 'none',
                  fontSize: '13px',
                  paddingLeft: '10px',
                  paddingRight: '25px',
                  position: 'relative',
                }}
              >
                <option style={{ fontSize: '12px' }}>Select Creator</option>
              </select>
            </div>

            {/* BUTTONS */}
            <div
              style={{
                outline: 'none',
                textAlign: 'right',
                width: '100%',
                paddingTop: '7px',
              }}
            >
              <button
                type="button"
                onClick={() => closeDialog()}
                style={{
                  padding: '0px 15px',
                  backgroundColor: 'transparent',
                  color: 'white',
                  cursor: 'pointer',
                  borderRadius: '5px',
                  border: '1px solid #444444',
                  fontSize: '14px',
                  width: '77px',
                  height: '35px',
                }}
              >
                Cancel
              </button>

              <button
                style={{
                  padding: '0px 15px',
                  backgroundColor: '#3467FF',
                  color: 'white',
                  cursor: 'pointer',
                  borderRadius: '5px',
                  border: 'none',
                  fontSize: '14px',
                  width: '77px',
                  height: '35px',
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorPage;
