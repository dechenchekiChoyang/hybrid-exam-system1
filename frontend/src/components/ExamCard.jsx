import React from "react";
import {
  Clock,
  BookOpen,
  FileText,
  Calendar,
  Play,
} from "lucide-react";

export default function ExamCard({
  title = "Computer Networks",
  subject = "BCA Semester VI",
  duration = "60 Minutes",
  questions = 50,
  marks = 100,
  date = "28 July 2026",
  status = "Available",
  onStart,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {title}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {subject}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            status === "Available"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {status}
        </span>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 font-medium mb-5">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-blue-600" />
          <span>{duration}</span>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-blue-600" />
          <span>{questions} Questions</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-blue-600" />
          <span>{marks} Marks</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-blue-600" />
          <span>{date}</span>
        </div>
      </div>

      {/* Footer */}
      <div>
        <button
          onClick={onStart}
          className="w-full bg-blue-600 hover:bg-blue-700 transition-all text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm"
        >
          <Play size={16} />
          <span>Start Examination</span>
        </button>
      </div>
    </div>
  );
}