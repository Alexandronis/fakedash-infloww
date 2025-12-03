import React from "react";
import "./header.scss";

const Header: React.FC = () => {
  //const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="dashboard-header justify-content-between justify-content-end">
      <div className="d-flex align-items-center" id="header_left">
        <div className="sidebar-logo-wrap">
          <button type="button" className="menu-btn">
            <img src="/hambuger-icon.png" alt="" />
          </button>
        </div>
      </div>

      <div className="d-flex align-items-center" id="header_right">
        <div className="dropdown operational">
          <p className="referrals-link dropdown-toggle-p">
            <span />
            Operational
          </p>

          <ul className="dropdown-menu">
            <li>
              <a className="dropdown-item" href="#">
                <span style={{ backgroundColor: "#58A744" }}></span>
                Operational
              </a>
            </li>

            <li>
              <a className="dropdown-item" href="#">
                <span style={{ backgroundColor: "#F88056" }}></span>
                Partials Outage
              </a>
            </li>

            <li>
              <a className="dropdown-item" href="#">
                <span style={{ backgroundColor: "#58A744" }}></span>
                Proxy service
              </a>
            </li>

            <li>
              <a className="dropdown-item" href="#">
                <span style={{ backgroundColor: "#58A744" }}></span>
                Messages and notifications
              </a>
            </li>

            <li>
              <a className="dropdown-item" href="#">
                <span style={{ backgroundColor: "#58A744" }}></span>
                Growth tools
              </a>
            </li>

            <li>
              <a className="dropdown-item" href="#">
                <span style={{ backgroundColor: "#58A744" }}></span>
                Creator and employee management
              </a>
            </li>

            <li>
              <a className="dropdown-item" href="#">
                <span style={{ backgroundColor: "#58A744" }}></span>
                Billing and balances
              </a>
            </li>

            <li>
              <a className="dropdown-item" href="#">
                <span style={{ backgroundColor: "#58A744" }}></span>
                Share for share
              </a>
            </li>

            <li>
              <a className="dropdown-item" href="#">
                <span style={{ backgroundColor: "#58A744" }}></span>
                Affiliate manager
              </a>
            </li>

            <li>
              <a className="dropdown-item" href="#">
                <span style={{ backgroundColor: "#58A744" }}></span>
                Infloww.com
              </a>
            </li>

            <li>
              <a className="dropdown-item" href="#">
                <span style={{ backgroundColor: "#58A744" }}></span>
                Reports
              </a>
            </li>
          </ul>
        </div>

        <p className="time-zone">
          <button
            type="button"
            className="tooltip-custom info-icon"
            data-bs-toggle="tooltip"
            style={{ marginRight: "10px", marginLeft: "5px" }}
          >
            <img src="/top-globe-icon.png" alt="" />
          </button>
          UTC+01:00
          <button
            type="button"
            className="tooltip-custom info-icon"
            data-bs-toggle="tooltip"
            style={{ marginRight: "5px", marginLeft: "5px" }}
            data-bs-placement="top"
            data-bs-title="Tooltip on top"
          >
            <img src="/top-info-icon.png" alt="" />
          </button>
        </p>

        <a href="#" className="referrals-link">
          <img
            src="/referral-icon.png"
            style={{ marginRight: "8px" }}
            alt=""
          />
          <span>Referrals</span>
        </a>

        <a href="#" className="referrals-link" style={{ marginRight: 0 }}>
          <img
            src="/trump-icon.png"
            style={{ marginRight: "8px" }}
            alt=""
          />
          <span>Leaderboard</span>
        </a>

        <label className="toggle-container">
          <span className="toggle-label" style={{ color: "rgb(97, 97, 97)" }}>
            SFW
          </span>
          <div className="toggle-switch">
            <input type="checkbox" id="sfw-toggle" />
            <div className="slider"></div>
          </div>
        </label>

        <a
          href="#"
          style={{ marginRight: "16px" }}
          className="notification-link active"
        >
          <img src="/alarm-icon.png" alt="" />
        </a>

        <div className="profile-dropdown dropdown">
          <button
            id="editableText"
            className="dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <span className="avatarName">Ag</span>
          </button>

          <ul className="dropdown-menu" style={{}}>
            <li>
              <a className="dropdown-item" href="#">
                Add Account
              </a>
            </li>
            <li>
              <a className="dropdown-item" href="#">Logout</a>
            </li>
          </ul>
        </div>

        <a
          href="#"
          style={{ backgroundColor: "transparent" }}
          className="notification-link window-buttons"
        >
          <img src="/min-icon.png" alt="" />
        </a>

        <a
          href="#"
          style={{ backgroundColor: "transparent" }}
          className="notification-link window-buttons"
        >
          <img src="/max-icon.png" alt="" />
        </a>

        <a
          href="#"
          style={{ backgroundColor: "transparent" }}
          className="notification-link window-buttons"
        >
          <img src="/close-icon.png" alt="" />
        </a>
      </div>
    </div>
  );
};

export default Header;
