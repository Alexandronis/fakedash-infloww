import React, { useState } from "react";
import "./header.scss";

const dropdownItems = [
  { label: "Operational", color: "#58A744" },
  { label: "Partials Outage", color: "#F88056" },
  { label: "Proxy service", color: "#58A744" },
  { label: "Messages and notifications", color: "#58A744" },
  { label: "Growth tools", color: "#58A744" },
  { label: "Creator and employee management", color: "#58A744" },
  { label: "Billing and balances", color: "#58A744" },
  { label: "Share for share", color: "#58A744" },
  { label: "Affiliate manager", color: "#58A744" },
  { label: "Infloww.com", color: "#58A744" },
  { label: "Reports", color: "#58A744" },
];

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const [selectedItem, setSelectedItem] = useState(dropdownItems[0]);
  const [sfwActive, setSfwActive] = useState(false);
  const handleDropdownClick = (item: typeof dropdownItems[0]) => {
    setSelectedItem(item);
  };
  const toggleSfw = () => {
    setSfwActive((prev) => !prev);
  };

  return (
    <div className="dashboard-header justify-content-between justify-content-end">
      <div className="d-flex align-items-center" id="header_left">
        <div className="sidebar-logo-wrap">
          <button type="button" className="menu-btn" onClick={onMenuToggle}>
            <img src="/hambuger-icon.png" alt="" />
          </button>
        </div>
      </div>

      <div className="d-flex align-items-center" id="header_right">
        <div className="dropdown operational">
          <p className="referrals-link dropdown-toggle-p">
            <span style={{backgroundColor: selectedItem.color}}/>
            {selectedItem.label}
          </p>

          <ul className="dropdown-menu">
            {dropdownItems.map((item) => (
              <li key={item.label}>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDropdownClick(item);
                  }}
                >
                  <span style={{backgroundColor: item.color}}></span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="time-zone">
          <button
            type="button"
            className="tooltip-custom info-icon"
            data-bs-toggle="tooltip"
            style={{marginRight: "10px", marginLeft: "5px"}}
          >
            <img src="/top-globe-icon.png" alt=""/>
          </button>
          UTC+01:00
          <button
            type="button"
            className="tooltip-custom info-icon"
            data-bs-toggle="tooltip"
            style={{marginRight: "5px", marginLeft: "5px"}}
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
          <span
            className="toggle-label"
            style={{color: sfwActive ? "rgb(255,255,255)" : "rgb(97, 97, 97)"}}
          >
            SFW
          </span>
          <div className="toggle-switch">
            <input type="checkbox" id="sfw-toggle" checked={sfwActive} onChange={toggleSfw} />
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
