import React from "react";

const COLORS = {
  surface: "#171B22",
  border: "#2B3140",
};

export default function Card({
  children,
  className = "",
  style = {},
}) {
  return (
    <div
      className={`rounded-2xl shadow-lg ${className}`}
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}