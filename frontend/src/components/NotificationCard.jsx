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
      message: "Computer Networks Mid-Term exam window is active.",
      type: "exam",
    },
    {
      title: "Result Status",
      message: "Subjective question scores are pending faculty review.",
      type: "result",
    },
    {
      title: "Proctoring Guidelines",
      message: "Tab switching is strictly monitored during all test sessions.",
      type: "notice",
    },
  ];

  const data = notifications.length > 0 ? notifications : defaultNotifications;

  const getIcon = (type) => {
    switch (type) {
      case "exam":
        return <CalendarDays size={18} className="text-blue-600" />;
      case "result":
        return <Trophy size={18} className="text-emerald-600" />;
      default:
        return <AlertCircle size={18} className="text-amber-600" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
        <Bell className="text-blue-600" size={18} />
        <h2 className="text-lg font-bold text-slate-900">
          Official Notifications
        </h2>
      </div>

      <div className="space-y-3">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex gap-3 items-start bg-slate-50 border border-slate-100 rounded-xl p-3.5 hover:bg-blue-50/50 transition-all"
          >
            <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs mt-0.5">
              {getIcon(item.type)}
            </div>

            <div>
              <h3 className="text-slate-900 font-bold text-xs">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {item.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}