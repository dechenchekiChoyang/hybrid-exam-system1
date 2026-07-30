import React, { useState } from "react";

const COLORS = {
  border: "#374151",
  focus: "#2563EB",
  bg: "#111827",
  text: "#ffffff",
};

export default function Input({
  label,
  required = false,
  type = "text",
  value,
  onChange,
  placeholder = "",
}) {
  const [focus, setFocus] = useState(false);

  return (
    <div className="mb-5">

      {label && (
        <label
          className="block mb-2 text-sm font-semibold"
          style={{ color: "#ffffff" }}
        >
          {label}

          {required && (
            <span style={{ color: "#ef4444" }}>
              {" "}
              *
            </span>
          )}
        </label>
      )}

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        className="w-full h-12 rounded-xl px-4 outline-none transition-all duration-300"
        style={{
          background: COLORS.bg,
          color: COLORS.text,
          border: focus
            ? `1px solid ${COLORS.focus}`
            : `1px solid ${COLORS.border}`,
        }}
      />

    </div>
  );
}