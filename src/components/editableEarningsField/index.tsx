// @ts-nocheck
import React, { useRef, useState } from "react";

interface EditableEarningsFieldProps {
  value: number;
  onChange: (v: number) => void;
  className?: string;
  children?: React.ReactNode;
  currency?: boolean;
  style?: React.CSSProperties;
}

function extractNumber(txt: string): number | null {
  // Remove all commas and currency symbols before parsing
  // Match first sequence of digits/dots
  // Example: "$ 10,000.00" -> "10000.00"
  const clean = txt.replace(/[^0-9.]/g, "");
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
        onChange(parsed);
      } else {
        ref.current.innerText = formatValue(value);
      }
    }
  };

  // Helper to format display
  // 10000 -> "10,000.00" (if currency=true)
  // 10000 -> "10000" (if currency=false)
  const formatValue = (val: number) => {
    if (currency) {
      // Add commas and force 2 decimals
      return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return Math.floor(val).toString(); // Integers for counts
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
        ...style
      }}
      onClick={() => !editing && handleClick()}
    >
      {currency && (
        <span
          className="dollar-sign"
          style={{
            fontSize: "24px",
            color: style.color === "inherit" ? "inherit" : "#2D74FF",
            lineHeight: "48px",
            verticalAlign: "middle",
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
