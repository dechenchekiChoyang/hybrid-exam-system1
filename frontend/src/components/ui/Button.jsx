import React from "react";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
}) {
  const variantStyles = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 border-transparent",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border-transparent",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm border-transparent",
    warning: "bg-amber-500 hover:bg-amber-600 text-white shadow-sm border-transparent",
    outline: "bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-sm",
    dark: "bg-slate-900 hover:bg-slate-800 text-white border-transparent shadow-sm",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 border disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant] || variantStyles.primary} ${className}`}
    >
      {children}
    </button>
  );
}