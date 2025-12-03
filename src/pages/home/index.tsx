import React from 'react';
import './home.scss';

const HomePage: React.FC = () => {
  return (
    <div className="dashboard-content">
      <div className="row">
        <div className="col-12">
          <div className="main-card-wrap">
            <div className="main-card-heading">
              <h4>
                Creator earnings overview
                <button
                  type="button"
                  className="tooltip-custom"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  data-bs-title="Tooltip on top"
                >
                  <img src="/info-icon.png" alt="" />
                </button>
                <span className="utc">UTC+01:00</span>
                <img
                  src="/info-icon.png"
                  alt=""
                  style={{ marginLeft: '8px', marginBottom: '2px' }}
                />
              </h4>

              <div className="d-flex header-filter">
                <div
                  className="dropdown header-shown_by"
                  style={{
                    backgroundColor: '#151515',
                    height: '33px',
                    fontSize: '14px',
                    marginTop: '1px',
                    marginRight: '16px',
                    paddingTop: '7px',
                    paddingLeft: '10px',
                    width: '130px',
                  }}
                >
                  <button
                    className="dropdown-toggle border-0 text-start w-100"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{
                      backgroundColor: 'transparent',
                      appearance: 'none',
                      color: '#bbb',
                    }}
                  >
                    Net earnings
                  </button>

                  <ul className="dropdown-menu" style={{ padding: '3px' }}>
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

                <ul className="time-selector">
                  <li id="yesterday">
                    <button type="button">Yesterday</button>
                  </li>
                  <li id="today">
                    <button type="button">Today</button>
                  </li>
                  <li id="week" className="active">
                    <button type="button">This week</button>
                  </li>
                  <li id="month">
                    <button type="button">This month</button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      Home page
    </div>
  );
};

export default HomePage;
