import React from "react";
import {
  User,
  Mail,
  Building2,
  GraduationCap,
  BadgeCheck,
} from "lucide-react";

export default function ProfileCard({ user }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col items-center border-b border-slate-100 pb-5">
        <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-md shadow-blue-500/20">
          {(user?.fullName || user?.name || "S").charAt(0).toUpperCase()}
        </div>

        <h2 className="mt-3 text-lg font-bold text-slate-900">
          {user?.fullName || user?.name || "Student Candidate"}
        </h2>

        <span className="mt-1 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
          Student Candidate
        </span>
      </div>

      <div className="mt-5 space-y-3.5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <Mail size={16} />
          </div>
          <div>
            <p className="text-slate-500 text-[11px] font-semibold uppercase">Email Address</p>
            <p className="text-slate-900 text-xs font-semibold">{user?.email || "Not Available"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <Building2 size={16} />
          </div>
          <div>
            <p className="text-slate-500 text-[11px] font-semibold uppercase">Department</p>
            <p className="text-slate-900 text-xs font-semibold">{user?.department || "Computer Applications"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <GraduationCap size={16} />
          </div>
          <div>
            <p className="text-slate-500 text-[11px] font-semibold uppercase">Enrollment ID</p>
            <p className="text-slate-900 text-xs font-semibold">{user?.enrollmentId || "STU-2026-881"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
            <BadgeCheck size={16} />
          </div>
          <div>
            <p className="text-slate-500 text-[11px] font-semibold uppercase">Account Status</p>
            <p className="text-emerald-600 text-xs font-bold">Active / Verified</p>
          </div>
        </div>
      </div>
    </div>
  );
}