// @ts-nocheck
import React, { useState } from 'react';
import CreatorEarningsOverview from "../../components/homePage/CreatorEarningsOverview"; // Ensure correct path
import HomeEmployeeChart from "../../components/charts/homeEmployeeChart.tsx"; // Ensure correct path
import './home.scss';

const HomePage: React.FC = () => {
  // Local state for the "Yesterday/Today/Week" filter on Home Page
  const [timeFilter, setTimeFilter] = useState("week");

  return (
    <div className="dashboard-content">
      <div className="row">
        <div className="col-12">
          <CreatorEarningsOverview
            activeFilter={timeFilter}
            onFilterChange={setTimeFilter}
          />
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
          <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
            <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1, backgroundColor: 'transparent'}}>
              <div className="main-card-wrap charts1" style={{ marginTop: 0 }}>
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
                <div style={{position: 'relative', top: '0%', padding: 0}} className="main-card-content nodata">
                  <img src="/empty-data.png" alt=""/>
                  <p>No employees have clocked in.</p>
                </div>
              </div>
              <HomeEmployeeChart timeFilter={timeFilter} />
            </div>
            <div className="main-card-wrap charts1">
              <div className="main-card-heading">
                <h4>Scheduled hours
                  <button type="button" className="tooltip-custom" data-bs-toggle="tooltip" data-bs-placement="top"
                          data-bs-title="Tooltip on top">
                    <img src="/info-icon.png" alt=""/>
                  </button>
                </h4>
              </div>
              <div className="main-card-content nodata">
                <img src="/empty-data.png" alt=""/>
                <p>No data</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
