import React from "react";

const CreatorStatistics: React.FC = () => {
  return (
    <div className="stats-wrap" style={{ position: "relative" }}>
      <div className="stats-header">
        <h6>Creator Statistics</h6>
        <div className="metrics-and-export">
          <div className="custom-metrics-container">
            <button className="custom-metrics-button" style={{ color: "white" }}>
              <span
                className="icon"
                style={{
                  cursor: "pointer",
                  display: "inline-block"
                }}
              >
                {/* SVG icon */}
                <svg width="256px" height="256px" viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#5b5252" strokeWidth="0.096">
                  <g id="SVGRepo_bgCarrier"></g>
                  <g id="SVGRepo_tracerCarrier"></g>
                  <g id="SVGRepo_iconCarrier">
                    <path fillRule="evenodd" clipRule="evenodd"
                          d="M9.90693 3.9999C9.93791 3.99996 9.96894 4.00001 10 4.00001C10.0311 4.00001 10.0621 3.99996 10.0931 3.9999C10.4618 3.99929 10.8242 3.99869 11.147 4.08519C12.0098 4.31636 12.6836 4.99023 12.9148 5.85296C13.0013 6.1758 13.0007 6.53821 13.0001 6.90693C13.0001 6.93792 13 6.96895 13 7.00001H21C21.5523 7.00001 22 7.44772 22 8.00001C22 8.55229 21.5523 9.00001 21 9.00001H13C13 9.03107 13.0001 9.0621 13.0001 9.09309C13.0007 9.46181 13.0013 9.82422 12.9148 10.1471C12.6836 11.0098 12.0098 11.6837 11.147 11.9148C10.8242 12.0013 10.4618 12.0007 10.0931 12.0001C10.0621 12.0001 10.0311 12 10 12C9.96894 12 9.93791 12.0001 9.90692 12.0001C9.5382 12.0007 9.17579 12.0013 8.85295 11.9148C7.99022 11.6837 7.31635 11.0098 7.08519 10.1471C6.99868 9.82421 6.99928 9.46181 6.9999 9.09308C6.99995 9.0621 7 9.03106 7 9.00001H5C4.44772 9.00001 4 8.55229 4 8.00001C4 7.44772 4.44772 7.00001 5 7.00001H7C7 6.96895 6.99995 6.93792 6.9999 6.90693C6.99928 6.53821 6.99868 6.1758 7.08519 5.85296C7.31635 4.99023 7.99022 4.31636 8.85295 4.08519C9.17579 3.99869 9.5382 3.99929 9.90693 3.9999ZM9.49861 6.00536C9.39195 6.01022 9.36685 6.01805 9.37059 6.01704C9.19804 6.06328 9.06327 6.19805 9.01704 6.3706C9.0162 6.37411 9.00963 6.40483 9.00535 6.49861C9.00024 6.61064 9 6.75845 9 7.00001V9.00001C9 9.24156 9.00024 9.38937 9.00535 9.5014C9.01021 9.60806 9.01804 9.63315 9.01704 9.62942C9.06327 9.80196 9.19804 9.93674 9.37059 9.98297C9.36685 9.98197 9.39195 9.98979 9.49861 9.99466C9.61063 9.99977 9.75844 10 10 10C10.2416 10 10.3894 9.99977 10.5014 9.99466C10.608 9.98979 10.6331 9.98197 10.6294 9.98297C10.802 9.93674 10.9367 9.80196 10.983 9.62942C10.982 9.63315 10.9898 9.60806 10.9946 9.5014C10.9998 9.38937 11 9.24156 11 9.00001V7.00001C11 6.75845 10.9998 6.61064 10.9946 6.49861C10.9898 6.39196 10.982 6.36686 10.983 6.3706M9.49861 6.00536C9.61063 6.00025 9.75844 6.00001 10 6.00001L9.49861 6.00536ZM10 6.00001C10.2416 6.00001 10.3894 6.00025 10.5014 6.00536L10 6.00001ZM10.5014 6.00536C10.5952 6.00963 10.6259 6.0162 10.6294 6.01704L10.5014 6.00536ZM10.6298 6.01713C10.6298 6.01713 10.6296 6.0171 10.6294 6.01704L10.6298 6.01713ZM15.9069 11.9999C15.9379 12 15.9689 12 16 12C16.0311 12 16.0621 12 16.0931 11.9999C16.4618 11.9993 16.8242 11.9987 17.147 12.0852C18.0098 12.3164 18.6836 12.9902 18.9148 13.853C19.0013 14.1758 19.0007 14.5382 19.0001 14.9069C19.0001 14.9379 19 14.9689 19 15H21C21.5523 15 22 15.4477 22 16C22 16.5523 21.5523 17 21 17H19C19 17.0311 19.0001 17.0621 19.0001 17.0931C19.0007 17.4618 19.0013 17.8242 18.9148 18.1471C18.6836 19.0098 18.0098 19.6837 17.147 19.9148C16.8242 20.0013 16.4618 20.0007 16.0931 20.0001C16.0621 20.0001 16.0311 20 16 20C15.9689 20 15.9379 20.0001 15.9069 20.0001C15.5382 20.0007 15.1758 20.0013 14.853 19.9148C13.9902 19.6837 13.3164 19.0098 13.0852 18.1471C12.9987 17.8242 12.9993 17.4618 12.9999 17.0931C12.9999 17.0621 13 17.0311 13 17H5C4.44772 17 4 16.5523 4 16C4 15.4477 4.44772 15 5 15H13C13 14.969 12.9999 14.9379 12.9999 14.9069C12.9993 14.5382 12.9987 14.1758 13.0852 13.853C13.3164 12.9902 13.9902 12.3164 14.853 12.0852C15.1758 11.9987 15.5382 11.9993 15.9069 11.9999ZM15.4986 14.0054C15.392 14.0102 15.3669 14.018 15.3706 14.017C15.198 14.0633 15.0633 14.1981 15.017 14.3706C15.018 14.3669 15.0102 14.392 15.0054 14.4986C15.0002 14.6106 15 14.7585 15 15V17C15 17.2416 15.0002 17.3894 15.0054 17.5014C15.0102 17.6081 15.018 17.6332 15.017 17.6294C15.0633 17.802 15.198 17.9367 15.3706 17.983C15.3669 17.982 15.392 17.9898 15.4986 17.9947C15.6106 17.9998 15.7584 18 16 18C16.2416 18 16.3894 17.9998 16.5014 17.9947C16.608 17.9898 16.6331 17.982 16.6294 17.983C16.802 17.9367 16.9367 17.802 16.983 17.6294C16.982 17.6332 16.9898 17.6081 16.9946 17.5014C16.9998 17.3894 17 17.2416 17 17V15C17 14.7585 16.9998 14.6106 16.9946 14.4986C16.9898 14.392 16.982 14.3669 16.983 14.3706C16.9367 14.1981 16.802 14.0633 16.6294 14.017C16.6331 14.018 16.608 14.0102 16.5014 14.0054C16.3894 14.0002 16.2416 14 16 14C15.7584 14 15.6106 14.0002 15.4986 14.0054Z"
                          fill="#666970"
                    ></path>
                  </g>
                </svg>
              </span>
              <div
                id="optionsMenu"
                style={{
                  display: "none",
                  flexDirection: "column",
                  position: "absolute",
                  top: "53px",
                  right: "6%",
                  backgroundColor: "#262626",
                  color: "#B8B8B8",
                  padding: "20px 70px 20px 20px",
                  borderRadius: "10px",
                  boxShadow: "rgba(0, 0, 0, 0.3) 0px 0px 15px",
                  zIndex: 9999
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  {/** Each label (check box + title) */}
                  <label style={{ textAlign: "left", fontSize: 16, display: "flex", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", marginRight: 10 }}>
                      <input type="checkbox" id="creators" checked style={{
                        appearance: "none",
                        width: 16,
                        height: 16,
                        border: "2px solid #007bff",
                        borderRadius: "50%",
                        cursor: "pointer",
                        transition: "background-color 0.2s, border-color 0.2s",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center center",
                        backgroundSize: "16px",
                        backgroundColor: "#007bff",
                        backgroundImage: "url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBkPSJNNSA4bDIgMiA0LTQiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+)"
                      }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}> Creator </div>
                  </label>
                  <label style={{ textAlign: "left", fontSize: 16, display: "flex", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", marginRight: 10 }}>
                      <input type="checkbox" id="posts" checked style={{
                        appearance: "none",
                        width: 16,
                        height: 16,
                        border: "2px solid #007bff",
                        borderRadius: "50%",
                        cursor: "pointer",
                        transition: "background-color 0.2s, border-color 0.2s",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center center",
                        backgroundSize: "16px",
                        backgroundColor: "#007bff",
                        backgroundImage: "url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBkPSJNNSA4bDIgMiA0LTQiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+)"
                      }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}> Posts </div>
                  </label>
                  <label style={{ textAlign: "left", fontSize: 16, display: "flex", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", marginRight: 10 }}>
                      <input type="checkbox" id="subscription" checked style={{
                        appearance: "none",
                        width: 16,
                        height: 16,
                        border: "2px solid #007bff",
                        borderRadius: "50%",
                        cursor: "pointer",
                        transition: "background-color 0.2s, border-color 0.2s",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center center",
                        backgroundSize: "16px",
                        backgroundColor: "#007bff",
                        backgroundImage: "url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBkPSJNNSA4bDIgMiA0LTQiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+)"
                      }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}> Subscription </div>
                  </label>
                  <label style={{ textAlign: "left", fontSize: 16, display: "flex", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", marginRight: 10 }}>
                      <input type="checkbox" id="tips" checked style={{
                        appearance: "none",
                        width: 16,
                        height: 16,
                        border: "2px solid #007bff",
                        borderRadius: "50%",
                        cursor: "pointer",
                        transition: "background-color 0.2s, border-color 0.2s",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center center",
                        backgroundSize: "16px",
                        backgroundColor: "#007bff",
                        backgroundImage: "url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBkPSJNNSA4bDIgMiA0LTQiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+)"
                      }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}> Tips </div>
                  </label>
                  <label style={{ textAlign: "left", fontSize: 16, display: "flex", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", marginRight: 10 }}>
                      <input type="checkbox" id="message" checked style={{
                        appearance: "none",
                        width: 16,
                        height: 16,
                        border: "2px solid #007bff",
                        borderRadius: "50%",
                        cursor: "pointer",
                        transition: "background-color 0.2s, border-color 0.2s",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center center",
                        backgroundSize: "16px",
                        backgroundColor: "#007bff",
                        backgroundImage: "url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBkPSJNNSA4bDIgMiA0LTQiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+)"
                      }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}> Message </div>
                  </label>
                  <label style={{ textAlign: "left", fontSize: 16, display: "flex", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", marginRight: 10 }}>
                      <input type="checkbox" id="streams" checked style={{
                        appearance: "none",
                        width: 16,
                        height: 16,
                        border: "2px solid #007bff",
                        borderRadius: "50%",
                        cursor: "pointer",
                        transition: "background-color 0.2s, border-color 0.2s",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center center",
                        backgroundSize: "16px",
                        backgroundColor: "#007bff",
                        backgroundImage: "url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBkPSJNNSA4bDIgMiA0LTQiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+)"
                      }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}> Streams </div>
                  </label>
                  <label style={{ textAlign: "left", fontSize: 16, display: "flex", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", marginRight: 10 }}>
                      <input type="checkbox" checked style={{
                        appearance: "none",
                        width: 16,
                        height: 16,
                        border: "2px solid #007bff",
                        borderRadius: "50%",
                        cursor: "pointer",
                        transition: "background-color 0.2s, border-color 0.2s",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center center",
                        backgroundSize: "16px",
                        backgroundColor: "#007bff",
                        // backgroundImage: "url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBkPSJNNSA4bDIgMiA0LTQiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW9
                        // tIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+)"
                      }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}> Total Earnings </div>
                  </label>
                  <label style={{ textAlign: "left", fontSize: 16, display: "flex", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", marginRight: 10 }}>
                      <input type="checkbox" id="refund" checked style={{
                        appearance: "none",
                        width: 16,
                        height: 16,
                        border: "2px solid #007bff",
                        borderRadius: "50%",
                        cursor: "pointer",
                        transition: "background-color 0.2s, border-color 0.2s",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center center",
                        backgroundSize: "16px",
                        backgroundColor: "#007bff",
                        backgroundImage: "url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBkPSJNNSA4bDIgMiA0LTQiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+)"
                      }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}> Refund </div>
                  </label>
                  <label style={{
                    display: "flex", alignItems: "center",
                    fontSize: 16, cursor: "pointer"
                  }}>
                    <div style={{
                      display: "flex", alignItems: "center",
                      marginRight: 10
                    }}>
                      <input type="checkbox" id="totalActiveFans" style={{
                        appearance: "none",
                        width: 16,
                        height: 16,
                        border: "2px solid #666",
                        borderRadius: "50%",
                        cursor: "pointer",
                        transition: "background-color 0.2s, border-color 0.2s",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundSize: "16px",
                        backgroundColor: "#666"
                      }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}> Total Active Fans </div>
                  </label>
                  <label style={{
                    display: "flex", alignItems: "center",
                    fontSize: 16, cursor: "pointer"
                  }}>
                    <div style={{
                      display: "flex", alignItems: "center",
                      marginRight: 10
                    }}>
                      <input type="checkbox" id="expired" style={{
                        appearance: "none",
                        width: 16,
                        height: 16,
                        border: "2px solid #666",
                        borderRadius: "50%",
                        cursor: "pointer",
                        transition: "background-color 0.2s, border-color 0.2s",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundSize: "16px",
                        backgroundColor: "#666"
                      }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}> Expired </div>
                  </label>
                </div>
              </div>
              Custom metrics
            </button>
          </div>
          <span id="export-btn" className="header-span_filter" style={{ cursor: "pointer" }}>
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"
                    d="M18.796 4H5.204a1 1 0 0 0-.753 1.659l5.302 6.058a1 1 0 0 1 .247.659v4.874a.5.5 0 0 0 .2.4l3 2.25a.5.5 0 0 0 .8-.4v-7.124a1 1 0 0 1 .247-.659l5.302-6.059c.566-.646.106-1.658-.753-1.658Z"></path>
            </svg>
            Export
          </span>
          <input type="file" id="fileInput" style={{ display: "none" }} multiple />
        </div>
      </div>

      <div className="d-flex justify-content-between">
        <div className="card">
          <div className="card-content">
            <p className="display-5 creator-bottom" id="editableText">0</p>
            <h5 className="card-title">
              Creators
              <button type="button" className="info-btn">
                <img src="/info-icon.png" alt="Info" className="info-icon" />
              </button>
            </h5>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <p className="display-5 msg-earning-bottom">$11.38</p>
            <h5 className="card-title">
              Message Earnings
              <button type="button" className="info-btn">
                <img src="/info-icon.png" alt="Info" className="info-icon" />
              </button>
            </h5>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <p className="display-5 total-earning-bottom">$11.44</p>
            <h5 className="card-title">
              Total Earnings
              <button type="button" className="info-btn">
                <img src="/info-icon.png" alt="Info" className="info-icon" />
              </button>
            </h5>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <p className="display-5 refunded-bottom" id="editableText">$0.00</p>
            <h5 className="card-title">
              Refunded
              <button type="button" className="info-btn">
                <img src="/info-icon.png" alt="Info" className="info-icon" />
              </button>
            </h5>
          </div>
        </div>
      </div>
      <div>
        <div className="table-container" id="tableContainer">
          <table>
            <tr>
              <th style={{
                padding: "10px 12px", textAlign: "left", fontSize: "13px", color: "rgb(153, 153, 153)",
                whiteSpace: "nowrap", position: "relative", fontFamily: "Calibri, sans-serif",
                backgroundColor: "rgb(53, 53, 53)"
              }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
                  cursor: "pointer", position: "relative"
                }}>
                  <span>Creators</span>
                  <div style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 0,
                    cursor: "pointer", marginLeft: 8
                  }}>
                    <div title="Click to sort descending" style={{
                      width: 14, height: 14,
                      backgroundImage: `url("/arrow11.png")`,
                      backgroundSize: "contain", backgroundRepeat: "no-repeat"
                    }}></div>
                    <div title="Click to sort ascending" style={{
                      width: 14, height: 14,
                      backgroundImage: `url("/arrow12.png")`,
                      backgroundSize: "contain", backgroundRepeat: "no-repeat"
                    }}></div>
                  </div>
                </div>
              </th>
              <th style={{
                padding: "10px 12px", textAlign: "left", fontSize: "13px", color: "rgb(153, 153, 153)",
                whiteSpace: "nowrap", position: "relative", fontFamily: "Calibri, sans-serif",
                backgroundColor: "rgb(53, 53, 53)"
              }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
                  cursor: "pointer", position: "relative"
                }}>
                  <span>Posts</span>
                  <div style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 0,
                    cursor: "pointer", marginLeft: 8
                  }}>
                    <div title="Click to sort descending" style={{
                      width: 14, height: 14,
                      backgroundImage: `url("/arrow11.png")`,
                      backgroundSize: "contain", backgroundRepeat: "no-repeat"
                    }}></div>
                    <div title="Click to sort ascending" style={{
                      width: 14, height: 14,
                      backgroundImage: `url("/arrow12.png")`,
                      backgroundSize: "contain", backgroundRepeat: "no-repeat"
                    }}></div>
                  </div>
                </div>
              </th>
              <th style={{
                padding: "10px 12px", textAlign: "left", fontSize: "13px", color: "rgb(153, 153, 153)",
                whiteSpace: "nowrap", position: "relative", fontFamily: "Calibri, sans-serif",
                backgroundColor: "rgb(53, 53, 53)"
              }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
                  cursor: "pointer", position: "relative"
                }}>
                  <span>Subscription</span>
                  <div style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 0,
                    cursor: "pointer", marginLeft: 8
                  }}>
                    <div title="Click to sort descending" style={{
                      width: 14, height: 14,
                      backgroundImage: `url("/arrow11.png")`,
                      backgroundSize: "contain", backgroundRepeat: "no-repeat"
                    }}></div>
                    <div title="Click to sort ascending" style={{
                      width: 14, height: 14,
                      backgroundImage: `url("/arrow12.png")`,
                      backgroundSize: "contain", backgroundRepeat: "no-repeat"
                    }}></div>
                  </div>
                </div>
              </th>
              <th style={{
                padding: "10px 12px", textAlign: "left", fontSize: "13px", color: "rgb(153, 153, 153)",
                whiteSpace: "nowrap", position: "relative", fontFamily: "Calibri, sans-serif",
                backgroundColor: "rgb(53, 53, 53)"
              }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
                  cursor: "pointer", position: "relative"
                }}>
                  <span>Tips</span>
                  <div style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 0,
                    cursor: "pointer", marginLeft: 8
                  }}>
                    <div title="Click to sort descending" style={{
                      width: 14, height: 14,
                      backgroundImage: `url("/arrow11.png")`,
                      backgroundSize: "contain", backgroundRepeat: "no-repeat"
                    }}></div>
                    <div title="Click to sort ascending" style={{
                      width: 14, height: 14,
                      backgroundImage: `url("/arrow12.png")`,
                      backgroundSize: "contain", backgroundRepeat: "no-repeat"
                    }}></div>
                  </div>
                </div>
              </th>
              <th style={{
                padding: "10px 12px", textAlign: "left", fontSize: "13px", color: "rgb(153, 153, 153)",
                whiteSpace: "nowrap", position: "relative", fontFamily: "Calibri, sans-serif",
                backgroundColor: "rgb(53, 53, 53)"
              }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
                  cursor: "pointer", position: "relative"
                }}>
                  <span>Message</span>
                  <div style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 0,
                    cursor: "pointer", marginLeft: 8
                  }}>
                    <div title="Click to sort descending" style={{
                      width: 14, height: 14,
                      backgroundImage: `url("/arrow11.png")`,
                      backgroundSize: "contain", backgroundRepeat: "no-repeat"
                    }}></div>
                    <div title="Click to sort ascending" style={{
                      width: 14, height: 14,
                      backgroundImage: `url("/arrow12.png")`,
                      backgroundSize: "contain", backgroundRepeat: "no-repeat"
                    }}></div>
                  </div>
                </div>
              </th>
              <th style={{
                padding: "10px 12px", textAlign: "left", fontSize: "13px", color: "rgb(153, 153, 153)",
                whiteSpace: "nowrap", position: "relative", fontFamily: "Calibri, sans-serif",
                backgroundColor: "rgb(53, 53, 53)"
              }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
                  cursor: "pointer", position: "relative"
                }}>
                  <span>Streams</span>
                  <div style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 0,
                    cursor: "pointer", marginLeft: 8
                  }}>
                    <div title="Click to sort descending" style={{
                      width: 14, height: 14,
                      backgroundImage: `url("/arrow11.png")`,
                      backgroundSize: "contain", backgroundRepeat: "no-repeat"
                    }}></div>
                    <div title="Click to sort ascending" style={{
                      width: 14, height: 14,
                      backgroundImage: `url("/arrow12.png")`,
                      backgroundSize: "contain", backgroundRepeat: "no-repeat"
                    }}></div>
                  </div>
                </div>
              </th>
              <th style={{
                padding: "10px 12px", textAlign: "left", fontSize: "13px", color: "rgb(153, 153, 153)",
                whiteSpace: "nowrap", position: "relative", fontFamily: "Calibri, sans-serif",
                backgroundColor: "rgb(53, 53, 53)"
              }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
                  cursor: "pointer", position: "relative"
                }}>
                  <span>Refund</span>
                  <div style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 0,
                    cursor: "pointer", marginLeft: 8
                  }}>
                    <div title="Click to sort descending" style={{
                      width: 14, height: 14,
                      backgroundImage: `url("/arrow11.png")`,
                      backgroundSize: "contain", backgroundRepeat: "no-repeat"
                    }}></div>
                    <div title="Click to sort ascending" style={{
                      width: 14, height: 14,
                      backgroundImage: `url("/arrow12.png")`,
                      backgroundSize: "contain", backgroundRepeat: "no-repeat"
                    }}></div>
                  </div>
                </div>
              </th>
            </tr>
            <thead></thead>
            <tbody>
            <tr>
              <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            </tbody>
          </table>
        </div>
        <div className="main-card-wrap charts">
          <div className="main-card-heading"></div>
          <div style={{ position: "relative", top: "17%" }} className="main-card-content nodata">
            <img src="/empty-data.png" alt="" />
            <p>No data</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorStatistics;
