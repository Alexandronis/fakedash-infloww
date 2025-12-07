import React, { useRef, useState } from "react";

interface EditableEarningsFieldProps {
  value: number;
  onChange: (v: number) => void;
  className?: string;
  children?: React.ReactNode;
  currency?: boolean; // Displays $ if true
}

// Helper: parse just the number from "$10.00", " 10.00", "abc10.00"
function extractNumber(txt: string): number | null {
  const numMatch = txt.match(/([0-9,.]+)/);
  if (!numMatch) return null;
  let clean = numMatch[1].replace(/,/g, ""); // Remove comma
  let num = parseFloat(clean);
  return isNaN(num) ? null : num;
}

const EditableEarningsField: React.FC<EditableEarningsFieldProps> = ({
   value,
   onChange,
   className = "",
   children,
   currency = true,
 }) => {
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Called when user starts editing
  const handleClick = () => {
    setEditing(true);
    setTimeout(() => {
      // Focus the editable span so you can type immediately
      ref.current?.focus();
    }, 0);
  };

  // Called when editing finishes
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
      // reset content to previous value
      if (ref.current) {
        ref.current.innerText = value.toFixed(2);
      }
    }
  };

  // Save entered value on blur/enter
  function saveValue() {
    if (ref.current) {
      let txt = ref.current.innerText;
      let parsed = extractNumber(txt);
      if (parsed !== null) {
        onChange(Number(parsed.toFixed(2)));
      } else {
        ref.current.innerText = value.toFixed(2); // restore previous value
      }
    }
  }

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
      }}
      onClick={() => !editing && handleClick()}
    >
      {currency && (
        <span
          className="dollar-sign"
          style={{
            fontSize: "24px",
            color: "#2D74FF",
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
          fontSize: "24px",
          color: "#2D74FF",
          minWidth: "50px",
          background: "transparent",
          border: "none",
          margin: "0",
          padding: "0",
          boxShadow: "none",
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      >
        {value.toFixed(2)}
      </div>
      {children}
    </h5>
  );
};

export default EditableEarningsField;
