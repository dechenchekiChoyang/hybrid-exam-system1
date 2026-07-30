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

  const displayName =
    user?.fullName ||
    user?.name ||
    "Student";

  const initials = displayName
    .charAt(0)
    .toUpperCase();

  return (
    <header className="h-20 bg-[#171B22] border-b border-[#2B3140] px-8 flex items-center justify-between">

      {/* Left Side */}
      <div>
        <h2 className="text-2xl font-bold text-white">
          Welcome back, {displayName} 👋
        </h2>

        <p className="text-sm text-gray-400 mt-1">
          {today}
        </p>
      </div>

      {/* Search */}
      <div className="relative w-[420px]">

        <Search
          size={18}
          className="absolute left-4 top-3.5 text-gray-500"
        />

        <input
          type="text"
          placeholder="Search exams, results..."
          className="w-full h-11 rounded-xl bg-[#111827] border border-[#2B3140] pl-11 pr-4 text-white placeholder-gray-500 outline-none focus:border-blue-500 transition"
        />

      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6">

        {/* Notification */}
        <button className="relative">

          <Bell
            size={22}
            className="text-gray-300 hover:text-white transition"
          />

          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500"></span>

        </button>

        {/* User */}
        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">

            {initials}

          </div>

          <div>

            <h3 className="text-white font-semibold">
              {displayName}
            </h3>

            <p className="text-sm text-gray-400 capitalize">
              {role}
            </p>

          </div>

        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-all duration-300 px-4 py-2 rounded-xl text-white shadow-md"
        >

          <LogOut size={18} />

          Logout

        </button>

      </div>

    </header>
  );
}