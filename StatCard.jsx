import React from "react";
import { TrendingUp } from "lucide-react";

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = "#2563EB",
}) {
  return (
    <div className="bg-[#171B22] border border-[#2B3140] rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-gray-400 text-sm">
            {title}
          </p>

          <h2 className="text-white text-3xl font-bold mt-2">
            {value}
          </h2>

          <div className="flex items-center gap-2 mt-4">

            <TrendingUp
              size={16}
              className="text-green-500"
            />

            <span className="text-green-500 text-sm">
              +12% this month
            </span>

          </div>

        </div>

        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: `${color}20`,
          }}
        >

          {Icon && (
            <Icon
              size={30}
              color={color}
            />
          )}

        </div>

      </div>

    </div>
  );
}