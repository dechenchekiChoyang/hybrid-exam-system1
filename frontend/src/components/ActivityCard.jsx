import React from "react";
import Card from "./ui/Card";

const activities = [
  {
    title: "Completed Computer Networks Exam",
    time: "Today",
  },
  {
    title: "Registered Successfully",
    time: "Yesterday",
  },
  {
    title: "Result Published",
    time: "2 Days Ago",
  },
];

export default function ActivityCard() {
  return (
    <Card className="p-6">

      <h2 className="text-white text-xl font-bold mb-5">
        Recent Activity
      </h2>

      <div className="space-y-4">

        {activities.map((item, index) => (

          <div
            key={index}
            className="border-b border-[#2B3140] pb-3"
          >

            <h3 className="text-white">
              {item.title}
            </h3>

            <p className="text-gray-500 text-sm">
              {item.time}
            </p>

          </div>

        ))}

      </div>

    </Card>
  );
}