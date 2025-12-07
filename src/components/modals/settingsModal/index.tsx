import React from "react";
import "./settingsModal.scss";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div
      className={`modal fade ${isOpen ? "show" : ""}`}
      style={{ display: isOpen ? "block" : "none" }}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      id="createModal"
    >
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="form-container">
            <h2>
              <img src="/logo.png" alt="" />
            </h2>

            <form onSubmit={handleSave}>
              {/* User Name / Avatar Name */}
              <div className="form-group d-flex justify-content-between">
                <div style={{ width: "50%" }}>
                  <label htmlFor="userName">User Name:</label>
                  <input type="text" id="userName" className="form-control" placeholder="Enter User Name" value="Agency" />
                </div>

                <div style={{ width: "47%" }}>
                  <label htmlFor="avatarName">Avatar Name:</label>
                  <input type="text" id="avatarName" className="form-control" placeholder="Enter Avatar Name" value="Ag" />
                </div>
              </div>

              {/* Avatar Image */}
              <div className="form-group">
                <label htmlFor="avatarIsImage">Avatar Image:</label>
                <select id="avatarIsImage" className="form-control">
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>

              {/* Total Sales */}
              <div className="form-group">
                <label htmlFor="totalEarnings">Total Sales ($):</label>
                <input type="text" id="totalEarnings" inputMode="decimal" className="form-control" placeholder="Enter earnings" value="$ 2.94" />
              </div>

              {/* App Version / Messages */}
              <div className="form-group d-flex justify-content-between">
                <div style={{ width: "47%" }}>
                  <label htmlFor="appVersion">App Version:</label>
                  <input type="text" id="appVersion" className="form-control" placeholder="Enter App Version" value="5.6.1" />
                </div>
                <div style={{ width: "47%" }}>
                  <label htmlFor="input_messages">Messages Pro:</label>
                  <input type="number" id="input_messages" className="form-control" placeholder="Enter Messages pro" value="0" />
                </div>
              </div>

              {/* Timezone / Header Alignment */}
              <div className="form-group d-flex justify-content-between">
                <div style={{ width: "47%" }}>
                  <label htmlFor="timezone">Select Timezone:</label>
                  <select id="timezone" className="form-control" value="UTC+01:00">
                    <option value="UTC-12:00">UTC-12:00</option>
                    <option value="UTC-11:00">UTC-11:00</option>
                    <option value="UTC-10:00">UTC-10:00</option>
                    <option value="UTC-9:00">UTC-9:00</option>
                    <option value="UTC-8:00">UTC-8:00</option>
                    <option value="UTC-7:00">UTC-7:00</option>
                    <option value="UTC-6:00">UTC-6:00</option>
                    <option value="UTC-5:00">UTC-5:00</option>
                    <option value="UTC-4:00">UTC-4:00</option>
                    <option value="UTC-3:00">UTC-3:00</option>
                    <option value="UTC-2:00">UTC-2:00</option>
                    <option value="UTC-1:00">UTC-1:00</option>
                    <option value="UTC+00:00">UTC+00:00</option>
                    <option value="UTC+01:00">UTC+01:00</option>
                    <option value="UTC+02:00">UTC+02:00</option>
                    <option value="UTC+03:00">UTC+03:00</option>
                    <option value="UTC+04:00">UTC+04:00</option>
                    <option value="UTC+05:00">UTC+05:00</option>
                    <option value="UTC+06:00">UTC+06:00</option>
                    <option value="UTC+07:00">UTC+07:00</option>
                    <option value="UTC+08:00">UTC+08:00</option>
                    <option value="UTC+09:00">UTC+09:00</option>
                    <option value="UTC+10:00">UTC+10:00</option>
                    <option value="UTC+11:00">UTC+11:00</option>
                    <option value="UTC+12:00">UTC+12:00</option>
                    <option value="UTC+13:00">UTC+13:00</option>
                    <option value="UTC+14:00">UTC+14:00</option>
                  </select>
                </div>

                <div style={{ width: "47%" }}>
                  <label htmlFor="headerAlignment">Header Alignment:</label>
                  <select id="headerAlignment" className="form-control">
                    <option value="left">Windows</option>
                    <option value="right">MacOS</option>
                  </select>
                </div>
              </div>

              {/* Toggle */}
              <div className="form-group">
                <label className="toggle-container">
                  <span className="toggle-label text-muted">Show OF Badge</span>
                  <div className="toggle-switch">
                    <input type="checkbox" id="showOfBadge" defaultChecked />
                    <div className="slider" />
                  </div>
                </label>
              </div>

              {/* Buttons */}
              <div className="form-actions">
                <button type="submit" className="calculate-btn">Calculate</button>
                <button type="button" className="random-btn" style={{ marginLeft: 20 }}>Randomize</button>
                <button type="button" className="logout-btn" style={{ marginLeft: 20 }}>Logout</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
