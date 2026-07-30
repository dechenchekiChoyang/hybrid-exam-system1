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
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "exams", label: "My Examinations", icon: FileText },
  { id: "results", label: "Results & Transcripts", icon: Trophy },
  { id: "profile", label: "Student Profile", icon: User },
  { id: "settings", label: "System Settings", icon: Settings },
];

export default function Sidebar({ active, onChange, onLogout }) {
  return (
    <aside className="w-72 min-h-screen bg-white border-r border-slate-200 flex flex-col shadow-xs">
      {/* Logo */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
          <GraduationCap className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-slate-900 text-base font-bold tracking-tight">
            Hybrid Exam
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Academic Assessment System
          </p>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 py-6 px-4 space-y-1.5">
        {menus.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 font-semibold py-2.5 rounded-xl border border-slate-200 hover:border-red-200 transition-all text-xs"
        >
          <LogOut size={16} />
          <span>Sign Out Account</span>
        </button>
      </div>
    </aside>
  );
}