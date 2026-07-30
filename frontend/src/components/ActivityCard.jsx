import React from "react";
import Card from "./ui/Card";

const activities = [
  {
    title: "Completed Computer Networks Mid-Term Exam",
    time: "Today",
  },
  {
    title: "Registered Candidate Profile",
    time: "Yesterday",
  },
  {
    title: "Hall Ticket Issued for Spring 2026",
    time: "2 Days Ago",
  },
];

export default function ActivityCard() {
  return (
    <Card className="p-6">
      <h2 className="text-slate-900 text-lg font-bold mb-4">
        Recent Activity Logs
      </h2>

      <div className="space-y-3">
        {activities.map((item, index) => (
          <div
            key={index}
            className="border-b border-slate-100 pb-3 last:border-none"
          >
            <h3 className="text-slate-900 text-sm font-semibold">
              {item.title}
            </h3>
            <p className="text-slate-500 text-xs font-medium mt-0.5">
              {item.time}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}