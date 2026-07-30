import React from "react";
import Card from "./ui/Card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = [
  { exam: "Exam 1", score: 70 },
  { exam: "Exam 2", score: 82 },
  { exam: "Exam 3", score: 76 },
  { exam: "Exam 4", score: 91 },
  { exam: "Exam 5", score: 87 },
];

export default function PerformanceChart() {
  return (
    <Card className="p-6">
      <h2 className="text-slate-900 text-lg font-bold mb-4">
        Academic Performance Overview
      </h2>

      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
            <XAxis dataKey="exam" stroke="#64748B" />
            <YAxis stroke="#64748B" />
            <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '8px' }} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#2563EB"
              strokeWidth={3}
              dot={{ fill: '#2563EB', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}