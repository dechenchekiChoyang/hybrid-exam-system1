import React from "react";
import { Search, Bell, LogOut } from "lucide-react";

export default function TopBar({
  user,
  role = "Student",
  onLogout,
}) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const displayName = user?.fullName || user?.name || "Student";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-xs sticky top-0 z-50">
      {/* Left Side */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Welcome Back, {displayName} 👋
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          {today} • Royal Examination Portal
        </p>
      </div>

      {/* Search */}
      <div className="relative w-80 hidden md:block">
        <Search
          size={16}
          className="absolute left-3.5 top-3 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search exams, results, notices..."
          className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-600 transition-all"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-5">
        {/* Notification */}
        <button className="relative p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-all">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
        </button>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center shadow-md shadow-blue-500/20">
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <h3 className="text-xs font-bold text-slate-900">
              {displayName}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium capitalize">
              {role} Account
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 font-semibold px-3.5 py-2 rounded-xl text-xs border border-slate-200 hover:border-red-200 transition-all"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}