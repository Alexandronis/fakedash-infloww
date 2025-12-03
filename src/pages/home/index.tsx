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

            <div className="main-card-content">
              <div className="overview-col">
                <div className="overview-inner">
                  <img src="/of-icon.svg" alt="" />
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
                  <img src="/plus-icon.png" alt="" />
                </div>

                <div className="overview-card">
                  <div className="card-content">
                    <h5 className="tips-earning" id="editableText">
                      $0.00
                    </h5>
                    <p>Tips</p>
                  </div>
                  <img src="/tips-icon.png" alt="" />
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
                  <img src="/posts-icon.png" alt="" />
                </div>

                <div className="overview-card">
                  <div className="card-content">
                    <h5 className="ref-earning" id="editableText">
                      $0.00
                    </h5>
                    <p>Referrals</p>
                  </div>
                  <img src="/referrals-icon.png" alt="" />
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
                  <img src="/messages-icon.png" alt="" />
                </div>

                <div className="overview-card">
                  <div className="card-content">
                    <h5 className="streams-earning" id="editableText">
                      $0.00
                    </h5>
                    <p>Streams</p>
                  </div>
                  <img src="/streams-icon.png" alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 charts">
          <div className="main-card-wrap charts">
            <div className="main-card-heading">
              <h4>My shifts
                <button type="button" className="tooltip-custom" data-bs-toggle="tooltip" data-bs-placement="top"
                        data-bs-title="Tooltip on top">
                  <img src="/info-icon.png" alt=""/>
                </button>
              </h4>
            </div>
            <div style={{position: 'relative', top: '17%'}} className="main-card-content nodata">
              <img src="/empty-data.png" alt=""/>
              <p>No data</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1  }}>
            <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1, backgroundColor: 'transparent'}}>
              <div className="main-card-wrap charts1">
                <div className="main-card-heading">
                  <h4>Current clocked-in employees
                    <button
                      type="button"
                      className="tooltip-custom employee-count-btn"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      data-bs-title="Click to edit employee count"
                      style={{color: 'white', fontSize: '14px', cursor: 'pointer'}}
                    >
                      <img src="/people-icon.png" alt="" style={{marginRight: '5px'}}/>
                      <span className="employee-count-display">0</span>
                    </button>
                  </h4>
                </div>
                <div style={{position: 'relative', top:'0%', padding: 0}} className="main-card-content nodata">
                  <img src="/empty-data.png" alt=""/>
                  <p>No employees have clocked in.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
