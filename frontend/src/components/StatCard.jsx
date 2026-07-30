import React from "react";
import { TrendingUp } from "lucide-react";

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = "#2563EB",
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            {title}
          </p>

          <h2 className="text-slate-900 text-3xl font-extrabold font-mono mt-1">
            {value}
          </h2>

          <div className="flex items-center gap-1.5 mt-3">
            <TrendingUp size={14} className="text-emerald-600" />
            <span className="text-emerald-600 text-xs font-semibold">
              +12% this term
            </span>
          </div>
        </div>

        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center border"
          style={{
            backgroundColor: `${color}10`,
            borderColor: `${color}30`,
          }}
        >
          {Icon && <Icon size={26} color={color} />}
        </div>
      </div>
    </div>
  );
}