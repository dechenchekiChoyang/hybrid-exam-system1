import React from "react";

export default function Card({
  children,
  className = "",
  style = {},
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl bg-white border border-slate-200 shadow-sm transition-all duration-200 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}