// @ts-nocheck
import React, { useRef, useState } from "react";

interface EditableEarningsFieldProps {
  value: number;
  onChange: (v: number) => void;
  className?: string;
  children?: React.ReactNode;
  currency?: boolean;
  style?: React.CSSProperties; // Allow external styles
}

function extractNumber(txt: string): number | null {
  const numMatch = txt.match(/([0-9,.]+)/);
  if (!numMatch) return null;
  let clean = numMatch[1].replace(/,/g, "");
  let num = parseFloat(clean);
  return isNaN(num) ? null : num;
}

const EditableEarningsField: React.FC<EditableEarningsFieldProps> = ({
                                                                       value,
                                                                       onChange,
                                                                       className = "",
                                                                       children,
                                                                       currency = true,
                                                                       style = {}
                                                                     }) => {
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    setEditing(true);
    setTimeout(() => { ref.current?.focus(); }, 0);
  };

  const handleBlur = () => {
    saveValue();
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveValue();
      setEditing(false);
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setEditing(false);
      if (ref.current) ref.current.innerText = formatValue(value);
    }
  };

  const saveValue = () => {
    if (ref.current) {
      let txt = ref.current.innerText;
      let parsed = extractNumber(txt);
      if (parsed !== null) {
        // If it's a counter (no currency), force integer? Optional, but safer.
        // For now, just passing parsed number.
        onChange(parsed);
      } else {
        ref.current.innerText = formatValue(value);
      }
    }
  };

  // Helper to format display
  const formatValue = (val: number) => {
    return currency ? val.toFixed(2) : Math.floor(val).toString();
  };

  return (
    <h5
      className={className}
      id="editableText"
      tabIndex={0}
      style={{
        cursor: editing ? "text" : "pointer",
        display: "flex",
        alignItems: "center",
        outline: editing ? "2px solid #2D74FF" : "none",
        ...style // Merge passed styles (like color: inherit)
      }}
      onClick={() => !editing && handleClick()}
    >
      {currency && (
        <span
          className="dollar-sign"
          style={{
            // Dollar sign usually keeps its blue color unless overridden explicitly
            fontSize: "24px",
            color: style.color === "inherit" ? "inherit" : "#2D74FF",
            lineHeight: "48px",
            verticalAlign: "middle",
            marginRight: "2px",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          $
        </span>
      )}
      <div
        ref={ref}
        contentEditable={editing}
        suppressContentEditableWarning
        spellCheck={false}
        tabIndex={0}
        style={{
          outline: "none",
          // Default to blue unless inherited
          color: style.color === "inherit" ? "inherit" : "#2D74FF",
          background: "transparent",
          border: "none",
          margin: "0",
          padding: "0",
          boxShadow: "none",
          minWidth: "10px"
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      >
        {formatValue(value)}
      </div>
      {children}
    </h5>
  );
};

export default EditableEarningsField;
