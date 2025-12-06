import React from "react";

const EarningsSummary: React.FC = () => {
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
  );
};

export default EarningsSummary;
