import React, { useState } from "react";

export default function Input({
  label,
  required = false,
  type = "text",
  value,
  onChange,
  placeholder = "",
  className = "",
}) {
  const [focus, setFocus] = useState(false);

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block mb-1.5 text-xs font-semibold text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        className={`w-full h-10 rounded-lg px-3.5 text-sm bg-slate-50 text-slate-900 border outline-none transition-all ${
          focus ? "border-blue-600 bg-white ring-2 ring-blue-500/10" : "border-slate-300"
        }`}
      />
    </div>
  );
}