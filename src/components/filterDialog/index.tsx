import React from "react";
import './filterDialog.scss';

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const FilterDialog: React.FC<FilterDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="filterDialog"
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        height: "228px",
        width: "600px",
        backgroundColor: "#2F2F2F",
        color: "white",
        borderRadius: "10px",
        margin: 0,
        padding: 0,
        zIndex: 9999,
      }}
    >
      <h6
        style={{
          marginBottom: "15px",
          fontSize: "18px",
          fontWeight: "bold",
          padding: "20px 20px 2px 10px",
        }}
      >
        Filter Options
      </h6>

      <div
        style={{
          width: "600px",
          backgroundColor: "#262626",
          padding: "20px 15px",
          borderRadius: 0,
          height: 'auto'
        }}
      >
        <label htmlFor="creator" style={{ fontSize: "15px", width: "100%" }}>
          Filter by Creator(s)
        </label>

        <select
          id="creator"
          style={{
            width: "100%",
            height: "45px",
            marginTop: "10px",
            borderRadius: "5px",
            backgroundColor: "#211f1f",
            color: "white",
            border: "none",
            fontSize: "13px",
            paddingLeft: "10px",
            paddingRight: "25px",
            position: "relative",
          }}
        >
          <option style={{ fontSize: "12px" }}>Select Creator</option>
        </select>
      </div>

      {/* BUTTONS */}
      <div
        style={{
          outline: "none",
          textAlign: "right",
          width: "100%",
          paddingTop: "7px",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: "0px 15px",
            backgroundColor: "transparent",
            color: "white",
            cursor: "pointer",
            borderRadius: "5px",
            border: "1px solid #444444",
            fontSize: "14px",
            width: "77px",
            height: "35px",
          }}
        >
          Cancel
        </button>

        <button
          style={{
            padding: "0px 15px",
            backgroundColor: "#3467FF",
            color: "white",
            cursor: "pointer",
            borderRadius: "5px",
            border: "none",
            fontSize: "14px",
            width: "77px",
            height: "35px",
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default FilterDialog;
