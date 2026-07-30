import React from "react";

const COLORS = {
  primary: "#2563EB",
  success: "#16A34A",
  danger: "#DC2626",
  warning: "#F59E0B",
  dark: "#171B22",
  border: "#2B3140",
  white: "#ffffff",
};

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
}) {
  const styles = {
    primary: {
      background: COLORS.primary,
      color: COLORS.white,
    },

    success: {
      background: COLORS.success,
      color: COLORS.white,
    },

    danger: {
      background: COLORS.danger,
      color: COLORS.white,
    },

    warning: {
      background: COLORS.warning,
      color: "#111827",
    },

    outline: {
      background: "transparent",
      color: COLORS.white,
      border: `1px solid ${COLORS.border}`,
    },

    dark: {
      background: COLORS.dark,
      color: COLORS.white,
      border: `1px solid ${COLORS.border}`,
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={styles[variant]}
      className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}