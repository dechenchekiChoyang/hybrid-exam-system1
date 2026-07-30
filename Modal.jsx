import React from "react";

export default function Modal({
  open,
  title,
  children,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">

      <div className="bg-[#171B22] border border-[#2B3140] rounded-2xl w-[500px] max-w-[95%] p-6">

        <div className="flex justify-between items-center mb-5">

          <h2 className="text-xl font-bold text-white">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>

        </div>

        {children}

      </div>
    </div>
  );
}