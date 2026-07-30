import React from "react";
import {
  LayoutDashboard,
  FileText,
  Trophy,
  User,
  Settings,
  LogOut,
  GraduationCap,
} from "lucide-react";

const menus = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "exams",
    label: "My Exams",
    icon: FileText,
  },
  {
    id: "results",
    label: "Results",
    icon: Trophy,
  },
  {
    id: "profile",
    label: "Profile",
    icon: User,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function Sidebar({
  active,
  onChange,
  onLogout,
}) {
  return (
    <aside className="w-72 min-h-screen bg-[#111827] border-r border-[#2B3140] flex flex-col">

      {/* Logo */}

      <div className="h-20 flex items-center gap-3 px-6 border-b border-[#2B3140]">

        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">

          <GraduationCap
            className="text-white"
            size={28}
          />

        </div>

        <div>

          <h1 className="text-white text-lg font-bold">
            Hybrid Exam
          </h1>

          <p className="text-xs text-gray-400">
            Examination System
          </p>

        </div>

      </div>

      {/* Menu */}

      <div className="flex-1 py-6 px-4 space-y-2">

        {menus.map((item) => {

          const Icon = item.icon;

          return (

            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                active === item.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-400 hover:bg-[#1B2230] hover:text-white"
              }`}
            >

              <Icon size={20} />

              <span className="font-medium">
                {item.label}
              </span>

            </button>

          );

        })}

      </div>

      {/* Logout */}

      <div className="p-4 border-t border-[#2B3140]">

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl transition"
        >

          <LogOut size={18} />

          Logout

        </button>

      </div>

    </aside>
  );
}