import React from "react";

const EarningsByChannelGraph: React.FC = () => {
  return (
    <div style={{ padding: "10px" }} className="earnings-by-channel-wrapper">
      <h6 style={{ marginBottom: "20px", marginLeft: "20px" }}>
        Earnings by Channel
        <button
          type="button"
          className="tooltip-custom"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          data-bs-title="Track trends and growth of your managed Creators’ earning channels"
          style={{ position: "relative", top: 3, left: 6 }}
        >
          <img className="charts-title" alt="" src="/info-icon.png" />
        </button>
      </h6>

      <div id="chartContainer">
        {/* This will be replaced by Chart.js Line chart in future */}
        <canvas
          id="earningsChart"
          style={{
            display: "block",
            boxSizing: "border-box",
            height: "260px",
            width: "730.1px",
          }}
          width={730}
          height={260}
        ></canvas>
        <div className="legend">
          <ul>
            <li className="item">
              <div className="info">
                <span className="subscriptions"></span>
                <p>Subscriptions</p>
              </div>
              <div
                style={{ fontSize: "12px", color: "white" }}
                className="sub-percent"
              >
                0.53%
              </div>
              <div
                className="sub-earning"
                id="editableText"
                style={{ fontSize: "12px", color: "white" }}
              >
                $0.06
              </div>
            </li>
            <li className="item">
              <div className="info">
                <span className="tips"></span>
                <p>Tips</p>
              </div>
              <div
                style={{ fontSize: "12px", color: "white" }}
                className="tips-percent"
              >
                0.00%
              </div>
              <div
                className="tips-earning"
                id="editableText"
                style={{ fontSize: "12px", color: "white" }}
              >
                $0.00
              </div>
            </li>
            <li className="item">
              <div className="info">
                <span className="posts"></span>
                <p>Posts</p>
              </div>
              <div
                style={{ fontSize: "12px", color: "white" }}
                className="posts-percent"
              >
                0.00%
              </div>
              <div
                className="posts-earning"
                id="editableText"
                style={{ fontSize: "12px", color: "white" }}
              >
                $0.00
              </div>
            </li>
            <li className="item">
              <div className="info">
                <span className="messages"></span>
                <p>Messages</p>
              </div>
              <div
                style={{ fontSize: "12px", color: "white" }}
                className="msg-percent"
              >
                99.47%
              </div>
              <div
                className="msg-earning"
                id="editableText"
                style={{ fontSize: "12px", color: "white" }}
              >
                $11.17
              </div>
            </li>
            <li className="item">
              <div className="info">
                <span className="referrals"></span>
                <p>Referrals</p>
              </div>
              <div
                style={{ fontSize: "12px", color: "white" }}
                className="ref-percent"
              >
                0.00%
              </div>
              <div
                className="ref-earning"
                id="editableText"
                style={{ fontSize: "12px", color: "white" }}
              >
                $0.00
              </div>
            </li>
            <li className="item">
              <div className="info">
                <span className="streams"></span>
                <p>Streams</p>
              </div>
              <div style={{ fontSize: "12px", color: "white" }}>0%</div>
              <div
                className="streams-earning"
                style={{ fontSize: "12px", color: "white" }}
              >
                $0.00
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EarningsByChannelGraph;
