import React from "react";
import Card from "../ui/Card";
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

      <h2 className="text-white text-xl font-bold mb-6">
        Performance Overview
      </h2>

      <div style={{ width: "100%", height: 300 }}>

        <ResponsiveContainer>

          <LineChart data={data}>

            <CartesianGrid stroke="#2B3140" />

            <XAxis dataKey="exam" stroke="#8A93A6" />

            <YAxis stroke="#8A93A6" />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="score"
              stroke="#2563EB"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </Card>
  );
}