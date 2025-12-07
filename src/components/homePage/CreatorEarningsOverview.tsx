// @ts-nocheck
import React, { useState } from 'react';
import { useCreatorStats } from '../../context/CreatorStatsContext'; // Adjust path if needed
import EditableEarningsField from '../editableEarningsField'; // Adjust path if needed

interface CreatorEarningsOverviewProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const CreatorEarningsOverview: React.FC<CreatorEarningsOverviewProps> = ({
 activeFilter,
 onFilterChange
}) => {
  const [selectedEarnings, setSelectedEarnings] = useState("Gross earnings");
  const earningsOptions = ["Gross earnings", "Net earnings"];

  const {
    stats,
    userSettings,
    updateTotalEarnings,
    updateChannelValue,
  } = useCreatorStats();

  return (
    <div className="main-card-wrap first-main-card-wrap">
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
          <span className="utc">{userSettings.timezone}</span>
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
              {selectedEarnings}
            </button>

            <ul className="dropdown-menu" style={{ padding: '3px' }}>
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

          <ul className="time-selector">
            <li id="yesterday" className={activeFilter === 'yesterday' ? 'active' : ''}>
              <button type="button" onClick={() => onFilterChange('yesterday')}>Yesterday</button>
            </li>
            <li id="today" className={activeFilter === 'today' ? 'active' : ''}>
              <button type="button" onClick={() => onFilterChange('today')}>Today</button>
            </li>
            <li id="week" className={activeFilter === 'week' ? 'active' : ''}>
              <button type="button" onClick={() => onFilterChange('week')}>This week</button>
            </li>
            <li id="month" className={activeFilter === 'month' ? 'active' : ''}>
              <button type="button" onClick={() => onFilterChange('month')}>This month</button>
            </li>
          </ul>
        </div>
      </div>

      <div className="main-card-content">
        <div className="overview-col">
          <div className="overview-inner">
            <img src="/of-icon.svg" alt="" />
            <p>Total earnings</p>
            <EditableEarningsField
              value={stats.total}
              onChange={updateTotalEarnings}
              className="total-earning"
            />
          </div>
        </div>

        <div className="overview-col">
          <div className="overview-card">
            <div className="card-content">
              <EditableEarningsField
                value={stats.subscriptions}
                onChange={(v) => updateChannelValue("subscriptions", v)}
                className="sub-earning"
              />
              <p>Subscriptions</p>
            </div>
            <img src="/plus-icon.png" alt="" />
          </div>

          <div className="overview-card">
            <div className="card-content">
              <EditableEarningsField
                value={stats.tips}
                onChange={(v) => updateChannelValue("tips", v)}
                className="tips-earning"
              />
              <p>Tips</p>
            </div>
            <img src="/tips-icon.png" alt="" />
          </div>
        </div>

        <div className="overview-col">
          <div className="overview-card">
            <div className="card-content">
              <EditableEarningsField
                value={stats.posts}
                onChange={(v) => updateChannelValue("posts", v)}
                className="posts-earning"
              />
              <p>Posts</p>
            </div>
            <img src="/posts-icon.png" alt="" />
          </div>

          <div className="overview-card">
            <div className="card-content">
              <EditableEarningsField
                value={stats.referrals}
                onChange={(v) => updateChannelValue("referrals", v)}
                className="ref-earning"
              />
              <p>Referrals</p>
            </div>
            <img src="/referrals-icon.png" alt="" />
          </div>
        </div>

        <div className="overview-col">
          <div className="overview-card">
            <div className="card-content">
              <EditableEarningsField
                value={stats.messages}
                onChange={(v) => updateChannelValue("messages", v)}
                className="msg-earning"
              />
              <p>Messages</p>
            </div>
            <img src="/messages-icon.png" alt="" />
          </div>

          <div className="overview-card">
            <div className="card-content">
              <EditableEarningsField
                value={stats.streams}
                onChange={(v) => updateChannelValue("streams", v)}
                className="streams-earning"
              />
              <p>Streams</p>
            </div>
            <img src="/streams-icon.png" alt="" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorEarningsOverview;
