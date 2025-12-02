import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../../context/SettingsContext";
import "./balanceModal.scss";

const BalanceModal = ({ isOpen, onClose }: any) => {
  const { i18n } = useTranslation();
  const { totalEarnings, setTotalEarnings, currencySign, setCurrencySign } = useSettings();
  const [value, setValue] = useState(totalEarnings.toFixed(2));

  useEffect(() => {
    if (isOpen) {
      setValue(totalEarnings.toFixed(2));
    }
  }, [isOpen, totalEarnings]);

  if (!isOpen) return null;

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang); // automatically saves to cookie
    onClose();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const num = parseFloat(value.replace(/,/g, ""));
    if (!isNaN(num)) {
      setTotalEarnings(num);
    }

    onClose();
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrencySign(e.target.value);
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="modal-close" onClick={onClose}>×</span>
        <h2 className="modal-logo">
          <a href="http://fakedash.com/my-account/">
            <img src="assets/logo.png" alt=""/>
          </a>
        </h2>
        <form id="settingsForm" onSubmit={handleSave}>

          <div className="settings-form-group">
            <div className="settings-form-group-inner">
              <label htmlFor="totalEarnings">Total Earnings</label>

              <div className="settings-input-wrapper">
                <span className="settings-currency-symbol">{currencySign}</span>
                <input
                  type="text"
                  id="totalEarnings"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="settings-form-group">
            <div className="settings-form-group-inner">
              <label htmlFor="language">Language & Currency</label>
              <select
                id="language"
                value={i18n.language}
                onChange={handleLanguageChange}
              >
                <option value="en">English ($)</option>
                <option value="fr">French (€)</option>
              </select>
            </div>

            <div className="settings-form-group-inner">
              <label htmlFor="curr_sign">USD - AUD</label>
              <select
                id="curr_sign"
                value={currencySign}
                onChange={handleCurrencyChange}
              >
                <option value="$">USD</option>
                <option value="A$">AUD</option>
              </select>
            </div>
          </div>

          <div className="settings-form-group save">
            <button type="submit" className="settings-save-btn">Save Changes</button>
          </div>

          <div className="settings-form-group last">
            <button type="button" className="settings-save-btn">Logout</button>
            <button type="button" className="settings-save-btn">Reset</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default BalanceModal;
