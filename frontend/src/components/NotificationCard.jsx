import React from "react";
import {
  Bell,
  CalendarDays,
  Trophy,
  AlertCircle,
} from "lucide-react";

export default function NotificationCard({
  notifications = [],
}) {
  const defaultNotifications = [
    {
      title: "Upcoming Examination",
      message: "Computer Networks exam starts tomorrow at 10:00 AM.",
      type: "exam",
    },
    {
      title: "Result Published",
      message: "Your Data Structures result has been published.",
      type: "result",
    },
    {
      title: "Important Notice",
      message: "Update your profile before the next examination.",
      type: "notice",
    },
  ];

  const data =
    notifications.length > 0
      ? notifications
      : defaultNotifications;

  const getIcon = (type) => {
    switch (type) {
      case "exam":
        return (
          <CalendarDays
            size={20}
            className="text-blue-400"
          />
        );

      case "result":
        return (
          <Trophy
            size={20}
            className="text-green-400"
          />
        );

      default:
        return (
          <AlertCircle
            size={20}
            className="text-yellow-400"
          />
        );
    }
  };

  return (
    <div className="bg-[#171B22] border border-[#2B3140] rounded-2xl p-6 shadow-lg">

      <div className="flex items-center gap-2 mb-6">

        <Bell className="text-blue-500" />

        <h2 className="text-xl font-bold text-white">
          Notifications
        </h2>

      </div>

      <div className="space-y-4">

        {data.map((item, index) => (

          <div
            key={index}
            className="flex gap-4 items-start bg-[#111827] rounded-xl p-4 hover:bg-[#1B2230] transition"
          >

            {getIcon(item.type)}

            <div>

              <h3 className="text-white font-semibold">
                {item.title}
              </h3>

              <p className="text-sm text-gray-400 mt-1">
                {item.message}
              </p>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}