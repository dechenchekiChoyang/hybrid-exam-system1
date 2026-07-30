import React from "react";

export default function Modal({
  open,
  title,
  children,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-[500px] max-w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-900">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl font-bold px-2 py-0.5 rounded"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}