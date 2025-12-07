import React from "react";
import { useCreatorStats } from '../../context/CreatorStatsContext.tsx';
import EditableEarningsField from '../editableEarningsField';

const EarningsSummary: React.FC = () => {
  const {
    stats,
    updateTotalEarnings,
    updateChannelValue,
  } = useCreatorStats();

  return (
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
                onChange={v => updateChannelValue("subscriptions", v)}
                className="sub-earning"
              />
              <p>Subscriptions</p>
            </div>
            <img src="/plus-icon.png" alt=""/>
          </div>

          <div className="overview-card">
            <div className="card-content">
              <EditableEarningsField
                value={stats.tips}
                onChange={v => updateChannelValue("tips", v)}
                className="tips-earning"
              />
              <p>Tips</p>
            </div>
            <img src="/tips-icon.png" alt=""/>
          </div>
        </div>

        <div className="overview-col">
          <div className="overview-card">
            <div className="card-content">
              <EditableEarningsField
                value={stats.posts}
                onChange={v => updateChannelValue("posts", v)}
                className="posts-earning"
              />
              <p>Posts</p>
            </div>
            <img src="/posts-icon.png" alt=""/>
          </div>

          <div className="overview-card">
            <div className="card-content">
              <EditableEarningsField
                value={stats.referrals}
                onChange={v => updateChannelValue("referrals", v)}
                className="ref-earning"
              />
              <p>Referrals</p>
            </div>
            <img src="/referrals-icon.png" alt=""/>
          </div>
        </div>

        <div className="overview-col">
          <div className="overview-card">
            <div className="card-content">
              <EditableEarningsField
                value={stats.messages}
                onChange={v => updateChannelValue("messages", v)}
                className="msg-earning"
              />
              <p>Messages</p>
            </div>
            <img src="/messages-icon.png" alt=""/>
          </div>

          <div className="overview-card">
            <div className="card-content">
              <EditableEarningsField
                value={stats.streams}
                onChange={v => updateChannelValue("streams", v)}
                className="streams-earning"
              />
              <p>Streams</p>
            </div>
            <img src="/streams-icon.png" alt=""/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsSummary;
